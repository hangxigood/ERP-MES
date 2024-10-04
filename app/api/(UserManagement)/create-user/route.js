import { NextResponse } from 'next/server';
// import bcrypt from 'bcrypt';
import dbConnect from '../../../../lib/mongoose';
import User from '../../../../models/User';
import { getToken } from 'next-auth/jwt';
import crypto from 'crypto';
import { sendPasswordSetupEmail } from '../../../../lib/sendEmail';


export async function POST(request) {
  // Auth check
  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Parse the incoming request body for user data
    const { name, email, role, createdById, updatedById } = await request.json();

    // Check if the email already exists
    await dbConnect();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Generate a random password
    const passwordSetupToken = crypto.randomBytes(16).toString('hex');
    const passwordSetupExpires = Date.now() + 24 * 3600000; // 24 hours from now

/**
 // Hash the password
 const saltRounds = parseInt(process.env.SALT_ROUNDS);
 const hashedPassword = await bcrypt.hash(password, saltRounds);
 * 
 */

    // Create the new user without a password
    const newUser = new User({
      name,
      email,
      role,
      createdBy: createdById,
      updatedBy: updatedById,
      passwordSetupToken,
      passwordSetupExpires
    });

    // Save the user to the database
    await newUser.save();

    // Send email with password setup link
    await sendPasswordSetupEmail(email, passwordSetupToken);

    // Return the created user data
    const userWithoutSensitiveInfo = newUser.toObject();
    delete userWithoutSensitiveInfo.passwordSetupToken;
    delete userWithoutSensitiveInfo.passwordSetupExpires;

    return NextResponse.json(userWithoutSensitiveInfo, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Error creating user', error: error.message }, { status: 500 });
  }
}

