import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../../../../lib/authOptions";
import dbConnect from '../../../../../../lib/mongoose';
import BatchRecordData from '../../../../../../models/BatchRecordData';
import Template from '../../../../../../models/Template';
import BatchRecord from '../../../../../../models/BatchRecord';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateName, batchRecordId, sectionName } = await request.json();
    await dbConnect();

    // Find the batch record to get template ID
    const batchRecord = await BatchRecord.findById(batchRecordId);
    if (!batchRecord) {
      return NextResponse.json({ error: 'Batch record not found' }, { status: 404 });
    }

    // Find the template and the specific section
    const template = await Template.findById(batchRecord.template);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Find the section in template structure
    const templateSection = template.structure.find(
      section => section.sectionName === sectionName
    );
    if (!templateSection) {
      return NextResponse.json({ error: 'Section not found in template' }, { status: 404 });
    }

    // Create fields from template definition
    const fields = templateSection.fields.map(field => ({
      fieldName: field.name,
      fieldValue: field.default === '' ? null : field.default,
      fieldType: field.fieldType
    }));

    // Create the duplicate section with timestamp
    const timestamp = Date.now();
    const duplicateSection = new BatchRecordData({
      batchRecord: batchRecordId,
      sectionName: `${templateSection.sectionName} (${timestamp})`,
      sectionDescription: templateSection.sectionDescription,
      order: templateSection.order,
      status: 'Not Started',
      fields: fields,
      createdBy: session.user.id,
      updatedBy: session.user.id,
      duplicatable: templateSection.duplicatable,
      isDuplicate: true,
      signoffs: []
    });

    await duplicateSection.save();

    return NextResponse.json({ 
      message: 'Section duplicated successfully',
      section: duplicateSection 
    });

  } catch (error) {
    console.error('Error duplicating section:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}