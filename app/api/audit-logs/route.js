import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/authOptions";
import dbConnect from '../../../lib/mongoose';
import FieldValueHistory from '../../../models/FieldValueHistory';
import User from '../../../models/User';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');
    const searchTerm = searchParams.get('search');

    // Build query
    const query = {};

    // Date range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.timestamp.$lte = endDateTime;
      }
    }

    // User filters
    if (userId) query['metadata.userId'] = new mongoose.Types.ObjectId(userId);
    if (userRole) query['metadata.userRole'] = userRole;

    // Execute query with pagination and populate user information
    const [histories, total] = await Promise.all([
      FieldValueHistory.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
          path: 'metadata.userId',
          model: 'User',
          select: 'name email role'
        })
        .lean(),
      FieldValueHistory.countDocuments(query)
    ]);

    // Transform histories to match AuditLog format
    const formattedLogs = await Promise.all(histories.map(async (history) => {
      // Find previous version for diff calculation
      const previousVersion = await FieldValueHistory.findOne({
        batchRecordData: history.batchRecordData,
        version: history.version - 1
      }).lean();

      // Determine operation type based on previous version existence
      const operationType = previousVersion ? 'update' : 'insert';

      // Calculate changes only for updates
      const changes = previousVersion ? calculateFieldDiffs(
        previousVersion.fieldsSnapshot,
        history.fieldsSnapshot,
        history.sectionName
      ) : [];

      // Safely handle user metadata
      const userMetadata = {
        ...history.metadata,
        user: history.metadata?.userId ? {
          id: typeof history.metadata.userId === 'object' 
            ? history.metadata.userId._id 
            : history.metadata.userId,
          name: history.metadata.userId?.name,
          email: history.metadata.userId?.email,
          role: history.metadata.userId?.role || history.metadata.userRole
        } : null
      };

      return {
        _id: history._id,
        operationType, // Now dynamically set based on previousVersion
        collectionName: 'BatchRecordData',
        documentId: history.batchRecord,
        timestamp: history.timestamp,
        metadata: userMetadata,
        updateDescription: {
          fields: changes
        }
      };
    }));

    // Get unique collections and users for filter dropdowns
    const [collections, users, roles] = await Promise.all([
      ['BatchRecordData'], // Fixed collections list
      User.find({}, 'name email role').lean(),
      FieldValueHistory.distinct('metadata.userRole')
    ]);

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      },
      filters: {
        collections,
        users: users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        })),
        roles,
        operations: ['update', 'insert'] // Updated to include both operations
      },
      stats: {
        totalLogs: total,
        uniqueCollections: collections.length,
        uniqueUsers: users.length,
        recentActivity: {
          today: await FieldValueHistory.countDocuments({
            ...query,
            timestamp: { 
              $gte: new Date(new Date().setHours(0,0,0,0)) 
            }
          }),
          thisWeek: await FieldValueHistory.countDocuments({
            ...query,
            timestamp: { 
              $gte: new Date(new Date().setDate(new Date().getDate() - 7)) 
            }
          })
        }
      }
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
  }
}

function calculateFieldDiffs(oldFields, newFields, sectionName) {
  const changes = [];

  newFields.forEach((newField, fieldIndex) => {
    const oldField = oldFields[fieldIndex];
    if (!oldField) return;

    // Get values, handling both array and non-array cases
    const oldValues = Array.isArray(oldField.fieldValue) ? oldField.fieldValue : [oldField.fieldValue];
    const newValues = Array.isArray(newField.fieldValue) ? newField.fieldValue : [newField.fieldValue];

    // Compare values at each index
    newValues.forEach((newValue, valueIndex) => {
      const oldValue = oldValues[valueIndex];
      
      // Compare values and add to changes if different
      if (newValue !== oldValue && newValue !== '' && newValue !== null) {
        // Get label from the first field's corresponding value
        const labels = newFields[0]?.fieldValue || [];
        const label = Array.isArray(labels) && labels[valueIndex] 
          ? `${labels[valueIndex]}(${valueIndex + 1})`
          : `(${valueIndex + 1})`;

        changes.push({
          sectionName: sectionName,
          label: label,
          fieldName: newField.fieldName,
          old: oldValue || '',
          new: newValue
        });
      }
    });
  });

  return changes;
}

// Add a new endpoint to get specific log details
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { logId } = await request.json();
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      return NextResponse.json({ error: 'Invalid log ID' }, { status: 400 });
    }

    const log = await FieldValueHistory.findById(logId)
      .populate({
        path: 'metadata.userId',
        model: 'User',
        select: 'name email role'
      })
      .lean();

    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    // Format the log data
    const formattedLog = {
      ...log,
      metadata: {
        ...log.metadata,
        user: log.metadata.userId ? {
          id: log.metadata.userId._id,
          name: log.metadata.userId.name,
          email: log.metadata.userId.email,
          role: log.metadata.userId.role
        } : null
      }
    };

    return NextResponse.json({ log: formattedLog });
  } catch (error) {
    console.error('Error fetching log details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
