import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';

export async function GET(request, { params }) {
  // Auth check
  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const batchRecordId = parseInt(params.batchId);

    if (!batchRecordId) {
      return NextResponse.json({ message: 'Batch record ID is required' }, { status: 400 });
    }

    const lineClearance = await prisma.lineClearance.findFirst({
      where: { batchRecordId: batchRecordId },
    });

    // Return an empty object if line clearance is not found
    return NextResponse.json(lineClearance || {});
  } catch (error) {
    console.error('Error fetching line clearance:', error);
    return NextResponse.json({ message: 'Error fetching line clearance', error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { batchId } = params;
  const { productionLineCleared, singleLot, equipmentCleaned } = await request.json();
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const updatedLineClearance = await prisma.lineClearance.upsert({
      where: {
        batchRecordId: parseInt(batchId),
      },
      update: {
        productionLineCleared,
        singleLot,
        equipmentCleaned,
        updatedAt: new Date(),
        updatedBy: { connect: { id: session.user.id } }
      },
      create: {
        productionLineCleared,
        singleLot,
        equipmentCleaned,
        batchRecord: { connect: { id: parseInt(batchId) } },
        createdBy: { connect: { id: session.user.id } },
        updatedBy: { connect: { id: session.user.id } }
      }
    });

    return new Response(JSON.stringify(updatedLineClearance), { status: 200 });
  } catch (error) {
    console.error("Error updating line clearance:", error);
    return new Response(JSON.stringify({ error: "Failed to update line clearance" }), { status: 500 });
  }
}
