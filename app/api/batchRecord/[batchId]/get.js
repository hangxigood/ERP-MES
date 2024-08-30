import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

/**
 * GET /api/batchRecords?id=1
 * GET /api/batchRecords?id=1&formType=lineClearance
 * GET /api/batchRecords?id=1&formType=billOfMaterials
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const formType = searchParams.get('formType');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
      const batchRecord = await prisma.batchRecord.findUnique({
        where: { id: parseInt(id) },
        include: {
          lineClearances: formType === 'lineClearance',
          billOfMaterials: formType === 'billOfMaterials',
          // Add other form types here
        },
      });

      if (!batchRecord) {
        return NextResponse.json({ error: 'Batch record not found' }, { status: 404 });
      }

      // If a specific form type was requested but doesn't exist, return an empty object
      if (formType && !batchRecord[formType]) {
        batchRecord[formType] = {};
      }
      console.log("Batch record from route:", batchRecord);
      return NextResponse.json(batchRecord);
    } catch (error) {
      console.error('Error retrieving batch record:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }
