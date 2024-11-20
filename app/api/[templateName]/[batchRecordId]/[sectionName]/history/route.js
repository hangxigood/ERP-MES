import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../../lib/authOptions";
import dbConnect from '../../../../../../lib/mongoose';
import FieldValueHistory from '../../../../../../models/FieldValueHistory';
import BatchRecordData from '../../../../../../models/BatchRecordData';
import { processHistoryEntry } from '../../../../../../lib/utils/auditUtils';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { batchRecordId, sectionName } = params;

    // Get the BatchRecordData document ID first
    const batchRecordData = await BatchRecordData.findOne({
      batchRecord: batchRecordId,
      sectionName: sectionName
    });

    if (!batchRecordData) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // Fetch history entries
    const history = await FieldValueHistory.find({
      batchRecordData: batchRecordData._id
    })
    .sort({ version: -1 })
    .populate('metadata.userId', 'name email role')
    .lean();

    // Process history using shared utility
    const processedHistory = history.map((entry, index) => 
      processHistoryEntry(entry, history[index + 1])
    );

    return NextResponse.json(processedHistory);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}