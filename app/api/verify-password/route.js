import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/authOptions";
import bcrypt from 'bcrypt';
import dbConnect from '../../../lib/mongoose';
import User from '../../../models/User';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { password } = await req.json();

  await dbConnect();

  try {
    const user = await User.findById(session.user.id);
    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      return new Response(JSON.stringify({ message: 'Password verified' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ message: 'Invalid password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error verifying password:', error);
    return new Response(JSON.stringify({ message: 'Error verifying password' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}