import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../../../../lib/authOptions";
import dbConnect from '../../../../../../lib/mongoose';
import BatchRecordData from '../../../../../../models/BatchRecordData';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateName, batchRecordId, sectionName } = params;
    if (!templateName || !batchRecordId || !sectionName) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await dbConnect();

    // Find and delete the duplicated section
    const deletedSection = await BatchRecordData.findOneAndDelete({
      batchRecord: batchRecordId,
      sectionName: decodeURIComponent(sectionName),
      isDuplicate: true
    });

    if (!deletedSection) {
      return NextResponse.json(
        { error: 'Section not found or not a duplicate' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Section deleted successfully' }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
}
