import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongoose';
import BatchRecord from '../../../models/BatchRecord';
import Template from '../../../models/Template'; // Add this line to import the Template model
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/authOptions";

export async function GET(request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const batchRecords = await BatchRecord.find()
      .populate('template', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ createdAt: -1 })
      .select('template status createdBy updatedBy createdAt updatedAt');

    const formattedBatchRecords = batchRecords.map(record => ({
      id: record._id,
      templateName: record.template.name,
      status: record.status,
      createdBy: record.createdBy.name,
      createdAt: record.createdAt,
      updatedBy: record.updatedBy.name,
      updatedAt: record.updatedAt
    }));

    return NextResponse.json(formattedBatchRecords);
  } catch (error) {
    console.error('Error fetching batch records:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
