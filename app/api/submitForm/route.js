import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request) { 
  try {
    const body = await request.json();

    const newBatchRecord = await prisma.batchRecordHeader.create({
      data: {
        name: body.name,
        documentNumber: body.documentNumber,
        revision: body.revision,
        date: new Date(body.date),
        family: body.family,
        partPrefix: body.partPrefix,
        partNumber: body.partNumber,
        description: body.description,
        lotNumber: body.lotNumber,
        manufactureDate: body.manufactureDate,
      },
    });

    return NextResponse.json({ message: 'Batch record created successfully', data: newBatchRecord }, { status: 201 });
  } catch (error) {
    console.error('Error creating batch record:', error);
    return NextResponse.json({ message: 'Error creating batch record' }, { status: 500 });
  }
}