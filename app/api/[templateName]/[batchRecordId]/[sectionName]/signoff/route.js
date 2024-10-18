import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../../lib/authOptions";
import connectDB from "../../../../../../lib/mongoose";
import BatchRecordData from "../../../../../../models/BatchRecordData";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { batchRecordId, sectionName } = params;
  const { comment } = await req.json();

  await connectDB();

  try {
    const updatedSection = await BatchRecordData.findOneAndUpdate(
      { batchRecord: batchRecordId, sectionName: sectionName },
      {
        $push: {
          signoffs: {
            signedBy: session.user.role + '(' + session.user.name + ')',
            signedAt: new Date(),
            comment: comment
          }
        },
        $set: { updatedBy: session.user.id }
      },
      { new: true }
    );

    if (!updatedSection) {
      return new Response(JSON.stringify({ message: 'Section not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(updatedSection), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error signing off section:', error);
    return new Response(JSON.stringify({ message: 'Error signing off section' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
