import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

/**
 * PUT /api/batchRecords?id=1&formType=lineClearance
 * PUT /api/batchRecords?id=1&formType=billOfMaterials
 */
export async function PUT(request) {
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get('formType');
    const formId = searchParams.get('formId');
  
    if (!formType || !formId) {
      return NextResponse.json({ error: 'Form type and ID are required' }, { status: 400 });
    }
  
    try {
      const body = await request.json();
      let updatedForm;
  
      switch (formType) {
        case 'lineClearance':
          updatedForm = await prisma.lineClearance.update({
            where: { id: parseInt(formId) },
            data: body,
          });
          break;
        case 'billOfMaterials':
          updatedForm = await prisma.billOfMaterials.update({
            where: { id: parseInt(formId) },
            data: body,
          });
          break;
        // Add cases for other form types
        default:
          return NextResponse.json({ error: 'Invalid form type' }, { status: 400 });
      }
  
      return NextResponse.json(updatedForm);
    } catch (error) {
      console.error('Error updating form:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }