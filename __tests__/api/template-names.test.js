import { NextResponse } from 'next/server';
import { GET } from '@/app/api/template-names/route';
import Template from '@/models/Template';
import dbConnect from '@/lib/mongoose';

/**
 * @fileoverview Tests for the template names API endpoint
 * Tests GET request functionality including successful retrieval of template names
 * and error handling cases
 */


// Mock the dependencies
jest.mock('@/lib/mongoose');
jest.mock('@/models/Template');
jest.mock('next/server');

describe('Template Names API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return template names successfully', async () => {
        // Mock the database connection
        dbConnect.mockResolvedValue();

        // Mock template data
        const mockTemplates = [
            { name: 'Template 1' },
            { name: 'Template 2' },
            { name: 'Template 3' }
        ];

        // Mock the Template.find() response
        Template.find.mockResolvedValue(mockTemplates);

        // Mock NextResponse.json
        NextResponse.json.mockImplementation(data => ({ data }));

        // Call the GET handler
        const response = await GET();

        // Verify database connection was attempted
        expect(dbConnect).toHaveBeenCalled();

        // Verify Template.find was called with correct parameters
        expect(Template.find).toHaveBeenCalledWith({}, 'name');

        // Verify the response contains expected template names
        expect(response.data).toEqual(['Template 1', 'Template 2', 'Template 3']);
    });

    it('should handle errors appropriately', async () => {
        // Mock database connection error
        const mockError = new Error('Database connection failed');
        dbConnect.mockRejectedValue(mockError);

        // Mock NextResponse.json for error case
        NextResponse.json.mockImplementation((data, options) => ({ data, options }));

        // Call the GET handler
        const response = await GET();

        // Verify error response
        expect(response.data).toEqual({ error: 'Internal Server Error' });
        expect(response.options).toEqual({ status: 500 });
    });
});