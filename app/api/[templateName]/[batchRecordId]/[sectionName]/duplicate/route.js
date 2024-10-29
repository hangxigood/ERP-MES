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
      status: 'pending',
      fields: templateSection.fields.map(field => ({
        fieldName: field.name,
        fieldType: field.fieldType,
        fieldValue: Array.isArray(field.default) ? field.default : [field.default || '']
      })),
      createdBy: session.user.id,
      updatedBy: session.user.id,
      isDuplicate: true
    });

    await newSection.save();

    return NextResponse.json(newSection);
  } catch (error) {
    console.error('Error duplicating section:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
