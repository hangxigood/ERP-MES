import { GET } from './get';
import { PUT } from './put';
import { POST as POST_OLD } from './post';
import { createBatchRecord } from './createBatchRecord';

export { GET, PUT };

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // create batch record
  if (action === 'createBatchRecord') {
    return createBatchRecord(request);
  }

  // Default to the existing POST handler
  return POST_OLD(request);
}