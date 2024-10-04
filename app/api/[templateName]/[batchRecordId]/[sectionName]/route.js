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

    const { batchRecordId, sectionName } = params;
    const decodedBatchRecordId = decodeURIComponent(batchRecordId);

    // Validate batchRecordId
    if (!mongoose.Types.ObjectId.isValid(decodedBatchRecordId)) {
      return NextResponse.json({ error: 'Invalid batch record ID' }, { status: 400 });
    }

    // Find the batch record
    const batchRecord = await BatchRecord.findById(decodedBatchRecordId);
    if (!batchRecord) {
      return NextResponse.json({ error: 'Batch record not found' }, { status: 404 });
    }

    // Find the batch record data for the specific section
    const batchRecordData = await BatchRecordData.findOne({
      batchRecord: decodedBatchRecordId,
      sectionName: sectionName
    });

    if (!batchRecordData) {
      return NextResponse.json({ error: 'Batch record data not found for the specified section' }, { status: 404 });
    }

    return NextResponse.json(batchRecordData);
  } catch (error) {
    console.error('Error fetching batch record section data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { batchRecordId, sectionName } = params;

  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, status } = await request.json();

    // Find and update the specific section data
    const updatedSectionData = await BatchRecordData.findOneAndUpdate(
      {
        batchRecord: batchRecordId,
        sectionName: sectionName
      },
      {
        $set: {
          fields: data,
          status: status,
          updatedBy: session.user.id
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedSectionData) {
      return NextResponse.json({ error: 'Section data not found' }, { status: 404 });
    }

    return NextResponse.json(updatedSectionData);

  } catch (error) {
    console.error('Error updating batch record section data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

