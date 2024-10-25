import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/authOptions";
import dbConnect from '../../../lib/mongoose';
import AuditLog from '../../../models/AuditLog';

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

    // Build query
    const query = {};
    if (collection) query.collectionName = collection;
    if (operation) query.operationType = operation;
    if (documentId) query.documentId = documentId;
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Execute query with pagination
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      AuditLog.countDocuments(query)
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
