import { getToken } from 'next-auth/jwt';
import { GET as GET_OLD } from './get';
import { PUT as PUT_OLD } from './put';
import { POST as POST_OLD } from './post';
import { createBatchRecord } from './createBatchRecord';

const secret = process.env.NEXTAUTH_SECRET

async function checkToken(req) {
  const token = await getToken({ req, secret});
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }
}

export async function GET(request) {
  const tokenCheck = await checkToken(request);
  if (tokenCheck) return tokenCheck;
  return GET_OLD(request);
}

export async function PUT(request) {
  const tokenCheck = await checkToken(request);
  if (tokenCheck) return tokenCheck;
  return PUT_OLD(request);
}

export async function POST(request) {
  const tokenCheck = await checkToken(request);
  if (tokenCheck) return tokenCheck;

  // create batch record
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // create batch record
  if (action === 'createBatchRecord') {
    return createBatchRecord(request);
  }

  // Default to the existing POST handler
  return POST_OLD(request);
}