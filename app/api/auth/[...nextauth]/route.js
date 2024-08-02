import NextAuth from 'next-auth';
import nextAuthOptions from '../../../_utils/nextAuthOptions';

export async function GET(req, res) {
  return await NextAuth(req, res, nextAuthOptions);
}

export async function POST(req, res) {
  return await NextAuth(req, res, nextAuthOptions);
}
