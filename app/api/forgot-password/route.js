import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongoose';
import User from '../../../models/User'; 
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../../../lib/sendEmail';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: email });

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send email with reset token
    console.log('Sending password reset email...');
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({ message: 'Password reset link sent to your email' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request' }, { status: 500 });
  }
}
