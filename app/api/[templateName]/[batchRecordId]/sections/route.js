import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongoose';
import BatchRecord from '../../../../../models/BatchRecord';
import BatchRecordData from '../../../../../models/BatchRecordData';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/authOptions";
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { batchRecordId } = params;

    // Validate batchRecordId
    if (!mongoose.Types.ObjectId.isValid(batchRecordId)) {
      return NextResponse.json({ error: 'Invalid batch record ID' }, { status: 400 });
    }

    // Find the batch record
    const batchRecord = await BatchRecord.findById(batchRecordId);
    if (!batchRecord) {
      return NextResponse.json({ error: 'Batch record not found' }, { status: 404 });
    }

    // Find all batch record data sections for this batch record
    const batchRecordSections = await BatchRecordData.find({
      batchRecord: batchRecordId
    }).select('sectionName');

    // Transform the sections data
    const sections = batchRecordSections.map(section => ({
      name: section.sectionName,
      displayName: section.sectionName // You might want to add a displayName field to your model if it's different from sectionName
    }));

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching batch record sections:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
