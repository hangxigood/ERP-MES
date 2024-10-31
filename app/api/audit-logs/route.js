import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/authOptions";
import dbConnect from '../../../lib/mongoose';
import AuditLog from '../../../models/AuditLog';
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
    const collection = searchParams.get('collection');
    const operation = searchParams.get('operation');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const documentId = searchParams.get('documentId');
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');
    const searchTerm = searchParams.get('search');

    // Build query
    const query = {};

    // Basic filters
    if (collection) query.collectionName = collection;
    if (operation) query.operationType = operation;
    if (documentId) {
      if (mongoose.Types.ObjectId.isValid(documentId)) {
        query.documentId = new mongoose.Types.ObjectId(documentId);
      } else {
        return NextResponse.json({ error: 'Invalid document ID format' }, { status: 400 });
      }
    }

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

    // Search functionality
    if (searchTerm) {
      query.$or = [
        { 'updateDescription.fields.fieldName': { $regex: searchTerm, $options: 'i' } },
        { collectionName: { $regex: searchTerm, $options: 'i' } },
        { 'metadata.userRole': { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Execute query with pagination and populate user information
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
          path: 'metadata.userId',
          model: 'User',
          select: 'name email role'
        })
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    // Transform logs to include formatted data
    const formattedLogs = logs.map(log => {
      const formattedLog = {
        ...log,
        metadata: {
          ...log.metadata,
          user: log.metadata.userId ? {
            id: log.metadata.userId._id,
            name: log.metadata.userId.name,
            email: log.metadata.userId.email,
            role: log.metadata.userId.role
          } : null,
        }
      };

      // Format the changes if it's an update operation
      if (log.operationType === 'update' && log.updateDescription?.fields) {
        formattedLog.changes = log.updateDescription.fields.map(field => ({
          fieldName: field.fieldName,
          oldValue: field.old,
          newValue: field.new,
          path: field.fieldName
        }));
      }

      return formattedLog;
    });

    // Get unique collections and users for filter dropdowns
    const [collections, users, roles] = await Promise.all([
      AuditLog.distinct('collectionName'),
      User.find({}, 'name email role').lean(),
      AuditLog.distinct('metadata.userRole')
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
        operations: ['insert', 'update', 'delete', 'replace']
      },
      stats: {
        totalLogs: total,
        uniqueCollections: collections.length,
        uniqueUsers: users.length,
        recentActivity: {
          today: await AuditLog.countDocuments({
            ...query,
            timestamp: { 
              $gte: new Date(new Date().setHours(0,0,0,0)) 
            }
          }),
          thisWeek: await AuditLog.countDocuments({
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

    const log = await AuditLog.findById(logId)
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
