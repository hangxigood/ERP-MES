import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import User from '../../../../models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized: Only admins can view users' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const users = await User.find({}, {
      _id: 1,
      id: 1,
      name: 1,
      email: 1,
      role: 1,
      createdAt: 1,
      updatedAt: 1
    }).sort({ createdAt: -1 });

    // Transform _id to id if needed
    const transformedUsers = users.map(user => ({
      id: user.id || user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
