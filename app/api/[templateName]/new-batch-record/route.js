import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import Template from '../../../../models/Template';
import BatchRecord from '../../../../models/BatchRecord';
import BatchRecordData from '../../../../models/BatchRecordData';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/authOptions";

export async function POST(request, { params }) {
	// const { templateName } = params;
	// const decodedTemplateName = decodeURIComponent(templateName);

	try {
		await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateName } = params;

    // Find the template
    const template = await Template.findOne({ name: templateName });
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Validate template structure
    if (!Array.isArray(template.structure) || template.structure.length === 0) {
      return NextResponse.json({ error: 'Invalid template structure' }, { status: 400 });
    }

    // Create a new batch record
    const newBatchRecord = new BatchRecord({
      template: template._id,
      status: 'In Progress',
      createdBy: session.user.id,
      updatedBy: session.user.id
    });
    await newBatchRecord.save();

    // Create batch record data for each section in the template
    const batchRecordDataIds = [];
    for (let i = 0; i < template.structure.length; i++) {
      const section = template.structure[i];
      if (!section.sectionName || !Array.isArray(section.fields)) {
        console.error('Invalid section structure:', section);
        return NextResponse.json({ error: 'Invalid section structure' }, { status: 400 });
      }

      try {
        const fields = section.fields.map(field => ({
          fieldName: field.name,
          fieldValue: field.default === '' ? null : field.default,
          fieldType: field.fieldType
        }));

        const newBatchRecordData = new BatchRecordData({
          batchRecord: newBatchRecord._id,
          sectionName: section.sectionName,
          order: section.order || i + 1,
          status: 'Not Started',
          fields: fields,
          createdBy: session.user.id,
          updatedBy: session.user.id,
          sectionDescription: section.sectionDescription
        });

        await newBatchRecordData.save();
        console.log("Saving successful with order:", newBatchRecordData.order);
        batchRecordDataIds.push(newBatchRecordData._id);
      } catch (error) {
        console.error('Error creating batch record data:', error);
        return NextResponse.json({ error: 'Error creating batch record data' }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      message: 'Batch record created successfully', 
      batchRecordId: newBatchRecord._id,
      batchRecordDataIds: batchRecordDataIds,
      templateName: template.name,
      templateVersion: template.version
    });
  } catch (error) {
    console.error('Error creating batch record:', error);
    if (error.message === 'Invalid field structure') {
      return NextResponse.json({ error: 'Invalid template field structure' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
