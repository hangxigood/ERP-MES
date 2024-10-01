import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import User from '../../../../models/User';
import { getToken } from 'next-auth/jwt';
import bcrypt from 'bcrypt';

export async function POST(request) {
  const token = await getToken({ req: request });
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userEmail, updatedFields, adminPassword, adminId } = await request.json();

    await dbConnect();

    // Verify admin password
    const admin = await User.findById(adminId);
    if (!admin || !(await bcrypt.compare(adminPassword, admin.password))) {
      return NextResponse.json({ message: 'Invalid admin password' }, { status: 401 });
    }

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update fields
    Object.keys(updatedFields).forEach(field => {
      user[field] = updatedFields[field];
    });

    user.updatedBy = adminId;

    await user.save();

    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json({ message: 'User updated successfully', user: userWithoutPassword }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: 'Validation error', error: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const token = await getToken({ req: request });
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const name = searchParams.get('name');

    await dbConnect();

    let users;
    if (email && name) {
      users = await User.find({
        $or: [
          { email: new RegExp(email, 'i') },
          { name: new RegExp(name, 'i') }
        ]
      });
    } else if (email) {
      users = await User.find({ email: new RegExp(email, 'i') });
    } else if (name) {
      users = await User.find({ name: new RegExp(name, 'i') });
    } else {
      return NextResponse.json({ message: 'Invalid search query' }, { status: 400 });
    }

    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    });

    return NextResponse.json({ users: usersWithoutPassword }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 500 });
  }
}