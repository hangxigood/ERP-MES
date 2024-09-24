import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongoose';
import Template from '../../../models/Template';

export async function GET() {
  try {
    await dbConnect();

    // Fetch all template names
    const templates = await Template.find({}, 'name');

    // Extract names from the templates
    const templateNames = templates.map(template => template.name);

    return NextResponse.json(templateNames);
  } catch (error) {
    console.error('Error fetching template names:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
