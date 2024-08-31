import { prisma } from '../../../lib/prisma';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function POST(request) {
  // Auth check
  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      name,
      documentNumber,
      revision,
      date,
      family,
      partPrefix,
      partNumber,
      description,
      lotNumber,
      manufactureDate,
      createdById,
      updatedById
    } = await request.json();

    const newBatchRecord = await prisma.batchRecord.create({
      data: {
        name,
        documentNumber,
        revision,
        date: new Date(date),
        family,
        partPrefix,
        partNumber,
        description,
        lotNumber,
        manufactureDate,
        createdBy: { connect: { id: createdById } },
        updatedBy: { connect: { id: updatedById } }
      }
    });

    return NextResponse.json(newBatchRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating batch record:', error);
    return NextResponse.json({ message: 'Error creating batch record', error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  // Auth check
  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const batchRecords = await prisma.batchRecord.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        documentNumber: true,
        lotNumber: true,
        date: true
      }
    });

    return NextResponse.json(batchRecords);
  } catch (error) {
    console.error('Error fetching batch records:', error);
    return NextResponse.json({ message: 'Error fetching batch records', error: error.message }, { status: 500 });
  }
}
