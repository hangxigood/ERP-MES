import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import User from '../../../../models/User';
import bcrypt from 'bcrypt';


function isPasswordSecure(password) {
  const minLength = 5;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasLowercase &&
    hasUppercase &&
    hasNumber &&
    hasSpecialChar
  );
}
export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!isPasswordSecure(password)) {
      return NextResponse.json({ error: 'Password does not meet security requirements' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({
      passwordSetupToken: token,
      passwordSetupExpires: { $gt: Date.now() }
    });

    if (!user) {
    console.log('No user found with the given token');
      return NextResponse.json({ error: 'Invalid or expired password setup token' }, { status: 400 });
    }

    console.log('User found:', user);

    // Hash the new password
    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    if (!saltRounds) {
        console.error('SALT_ROUNDS not set or invalid');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user with new password and remove setup token
    user.password = hashedPassword;
    user.passwordSetupToken = undefined;
    user.passwordSetupExpires = undefined;
    await user.save();

    return NextResponse.json({ message: 'Password set successfully' }, { status: 200 });
  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json({ error: 'An error occurred while setting the password', details: error.message }, { status: 500 });
  }
}