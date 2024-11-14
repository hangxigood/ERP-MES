import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/mongoose';
import BatchRecordData from '../../../../../../models/BatchRecordData';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../../lib/authOptions";
import BatchRecord from '../../../../../../models/BatchRecord';

export async function POST(request, { params }) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { batchRecordId, sectionName } = params;

    // Get the original section
    const originalSection = await BatchRecordData.findOne({
      batchRecord: batchRecordId,
      sectionName: sectionName
    });

    // Find all sections with higher order than the original
    const sectionsToUpdate = await BatchRecordData.find({
      batchRecord: batchRecordId,
      order: { $gt: originalSection.order }
    }).sort({ order: 1 });

    // Shift all subsequent sections up by 1
    for (const section of sectionsToUpdate) {
      await BatchRecordData.findByIdAndUpdate(section._id, {
        $inc: { order: 1 }
      });
    }

    // Find existing duplicates to determine the next number
    const existingSections = await BatchRecordData.find({
      batchRecord: batchRecordId,
      sectionName: new RegExp(`^${sectionName}( \\d+)?$`)
    }).sort({ sectionName: -1 });

    let newSectionName;
    if (existingSections.length > 1) {
      const lastNumber = parseInt(existingSections[0].sectionName.split(' ').pop());
      newSectionName = `${sectionName} ${lastNumber + 1}`;
    } else {
      newSectionName = `${sectionName} 2`;
    }

    // Get the template section structure
    const batchRecord = await BatchRecord.findById(batchRecordId).populate('template');
    const templateSection = batchRecord.template.structure.find(
      section => section.sectionName === sectionName
    );

    // Create new section from template structure
    const newSection = new BatchRecordData({
      batchRecord: batchRecordId,
      sectionName: newSectionName,
      status: 'Not Started',
      order: originalSection.order + 1,
      fields: templateSection.fields.map(field => ({
        fieldName: field.name,
        fieldType: field.fieldType,
        fieldValue: Array.isArray(field.default) ? field.default : [field.default || '']
      })),
      sectionDescription: templateSection.sectionDescription,
      createdBy: session.user.id,
      updatedBy: session.user.id,
      isDuplicate: true,
      duplicatable: originalSection.duplicatable
    });

    // Add user and client info before saving
    newSection._user = {
      id: session.user.id,
      role: session.user.role
    };
    newSection._clientInfo = {
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.ip
    };

    await newSection.save();

    return NextResponse.json(newSection);
  } catch (error) {
    console.error('Error duplicating section:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
