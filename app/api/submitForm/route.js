import { getConnection } from '../../_utils/db';

export async function POST(req) {
  const { name, documentNumber, revision, date, family, partPrefix, partNumber, description, lotNumber, manufactureDate } = await req.json();

  try {
    const connection = await getConnection();

    const insertQuery = `
      INSERT INTO batch_records (name, document_number, revision, date, family, part_prefix, part_number, description, lot_number, manufacture_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [name, documentNumber, revision, date, family, partPrefix, partNumber, description, lotNumber, manufactureDate];

    await connection.execute(insertQuery, values);
    await connection.end();
    return new Response(JSON.stringify({ message: 'Form data saved successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error saving form data:', error);
    return new Response(JSON.stringify({ message: 'Error saving form data' }), { status: 500 });
  }
}
