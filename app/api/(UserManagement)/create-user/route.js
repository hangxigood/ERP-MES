import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';
import { getToken } from 'next-auth/jwt';


export async function POST(request) {
  // Auth check
  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Parse the incoming request body for user data
    const { name, email, password, role, createdById, updatedById } = await request.json();

    // Check if the email already exists
    await dbConnect();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Hash the password
    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      createdBy: createdById,
      updatedBy: updatedById
    });

    // Save the user to the database
    await newUser.save();

    // Return the created user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Error creating user', error: error.message }, { status: 500 });
  }
}

