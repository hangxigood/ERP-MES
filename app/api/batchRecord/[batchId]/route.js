import { prisma } from '../../../../lib/prisma';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  // Auth check
  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const batchId = parseInt(params.batchId);
    const batchRecord = await prisma.batchRecord.findUnique({
      where: { id: batchId },
    });

    if (!batchRecord) {
      return NextResponse.json({ message: 'Batch record not found' }, { status: 404 });
    }

    return NextResponse.json(batchRecord);
  } catch (error) {
    console.error('Error fetching batch record:', error);
    return NextResponse.json({ message: 'Error fetching batch record', error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  // Auth check
  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const batchId = parseInt(params.batchId);
    const updatedData = await request.json();

    // Fields to update
    const allowedFields = [
      'name', 'documentNumber', 'revision', 'date', 'family',
      'partPrefix', 'partNumber', 'description', 'lotNumber',
      'manufactureDate', 'additionalData'
    ];

    // Filter out unnecessary fields and prepare the data for update
    const filteredData = Object.keys(updatedData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updatedData[key];
        return obj;
      }, {});

    const updatedBatchRecord = await prisma.batchRecord.update({
      where: { id: batchId },
      data: {
        ...filteredData,
        date: new Date(updatedData.date),
        updatedAt: new Date(),
        updatedBy: { connect: { id: token.sub } }
      },
    });

    return NextResponse.json(updatedBatchRecord);
  } catch (error) {
    console.error('Error updating batch record:', error);
    return NextResponse.json({ message: 'Error updating batch record', error: error.message }, { status: 500 });
  }
}
