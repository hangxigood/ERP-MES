import { NextResponse } from 'next/server';
import { prisma} from '../../../lib/prisma';


/**
 * GET /api/batchRecords?id=1
 * GET /api/batchRecords?id=1&formType=lineClearance
 * GET /api/batchRecords?id=1&formType=billOfMaterials
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
  
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
  
    try {
      const batchRecord = await prisma.batchRecord.findUnique({
        where: { id: parseInt(id) },
        include: {
          lineClearances: true,
          billOfMaterials: true,
          // Include other form types as needed
        },
      });
  
      if (!batchRecord) {
        return NextResponse.json({ error: 'Batch record not found' }, { status: 404 });
      }
  
      return NextResponse.json(batchRecord);
    } catch (error) {
      console.error('Error retrieving batch record:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }
  