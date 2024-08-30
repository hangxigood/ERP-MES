import { NextResponse } from 'next/server';
import {prisma} from '../../../../lib/prisma';

/**
 * POST /api/batchRecords?batchRecordId=1&formType=lineClearance
 * POST /api/batchRecords?batchRecordId=1&formType=billOfMaterials
 */
export async function POST(request) {
    const { searchParams } = new URL(request.url);
    const batchRecordId = searchParams.get('batchRecordId');
    const formType = searchParams.get('formType');
  
    if (!batchRecordId || !formType) {
      return NextResponse.json({ error: 'Batch record ID and form type are required' }, { status: 400 });
    }
  
    try {
      const body = await request.json();
      let newForm;
  
      switch (formType) {
        case 'lineClearance':
          newForm = await prisma.lineClearance.create({
            data: {
              ...body,
              batchRecord: { connect: { id: parseInt(batchRecordId) } },
            },
          });
          break;
        case 'billOfMaterials':
          newForm = await prisma.billOfMaterials.create({
            data: {
              ...body,
              batchRecord: { connect: { id: parseInt(batchRecordId) } },
            },
          });
          break;
        // Add cases for other form types
        default:
          return NextResponse.json({ error: 'Invalid form type' }, { status: 400 });
      }
  
      return NextResponse.json(newForm);
    } catch (error) {
      console.error('Error creating form:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }