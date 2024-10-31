import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongoose';
import BatchRecord from '../../../../../models/BatchRecord';
import BatchRecordData from '../../../../../models/BatchRecordData';
import Template from '../../../../../models/Template';
import FieldValueHistory from '../../../../../models/FieldValueHistory';
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

    // Fetch the template to get the sectionDescription
    const batchRecordWithTemplate = await BatchRecord.findById(decodedBatchRecordId).populate('template');
    const templateSection = batchRecordWithTemplate.template.structure.find(section => section.sectionName === sectionName);
    const sectionDescription = templateSection ? templateSection.sectionDescription : '';

    return NextResponse.json({
      ...batchRecordData.toObject(),
      sectionDescription
    });
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

    // First find the document
    const sectionData = await BatchRecordData.findOne({
      batchRecord: batchRecordId,
      sectionName: sectionName,
      signoffs: { $size: 0 }
    });

    if (!sectionData) {
      return NextResponse.json({ error: 'Section data not found or has been signed off' }, { status: 403 });
    }

    // Update the document using the instance
    sectionData.fields = data;
    sectionData.status = status;
    sectionData.updatedBy = session.user.id;
    
    // Attach user info for audit logging
    sectionData._user = {
      id: session.user.id,
      role: session.user.role
    };
    sectionData._clientInfo = {
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.ip
    };

    // Save the document to trigger the middleware
    const updatedSectionData = await sectionData.save();

    return NextResponse.json(updatedSectionData);

  } catch (error) {
    console.error('Error updating batch record section data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { batchRecordId, sectionName } = params;

    const section = await BatchRecordData.findOne({
      batchRecord: batchRecordId,
      sectionName: sectionName
    });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    if (!section.isDuplicate) {
      return NextResponse.json({ error: 'Cannot delete original section' }, { status: 403 });
    }

    await BatchRecordData.deleteOne({
      batchRecord: batchRecordId,
      sectionName: sectionName
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
