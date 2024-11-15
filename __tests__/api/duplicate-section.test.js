import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { POST } from '../../../app/api/batch-records/[id]/sections/duplicate/route';
import dbConnect from '../../../lib/mongoose';
import BatchRecord from '../../../models/BatchRecord';
import Template from '../../../models/Template';
import BatchRecordData from '../../../models/BatchRecordData';

/**
 * @fileoverview Tests for the section duplication API endpoint.
 * Verifies authentication, input validation, and successful duplication of template sections.
 */


jest.mock('next-auth');
jest.mock('../../../lib/mongoose');
jest.mock('../../../models/BatchRecord');
jest.mock('../../../models/Template');
jest.mock('../../../models/BatchRecordData');

describe('POST /api/batch-records/[id]/sections/duplicate', () => {
    const mockSession = {
        user: { id: 'user123' }
    };

    const mockRequest = {
        json: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        getServerSession.mockResolvedValue(mockSession);
    });

    test('returns 401 if not authenticated', async () => {
        getServerSession.mockResolvedValueOnce(null);
        
        const response = await POST(mockRequest);
        
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    test('returns 404 if batch record not found', async () => {
        mockRequest.json.mockResolvedValueOnce({
            batchRecordId: 'invalid-id',
            templateName: 'Test Template',
            sectionName: 'Test Section'
        });
        BatchRecord.findById.mockResolvedValueOnce(null);

        const response = await POST(mockRequest);

        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({ error: 'Batch record not found' });
    });

    test('successfully duplicates a section', async () => {
        const mockBatchRecord = {
            _id: 'batch123',
            template: 'template123'
        };

        const mockTemplate = {
            structure: [{
                sectionName: 'Test Section',
                sectionDescription: 'Test Description',
                order: 1,
                duplicatable: true,
                fields: [
                    { name: 'field1', default: 'default1', fieldType: 'text' }
                ]
            }]
        };

        const mockDuplicateSection = {
            _id: 'section123',
            toObject: () => ({
                sectionName: 'Test Section',
                fields: [{ fieldName: 'field1' }]
            })
        };

        mockRequest.json.mockResolvedValueOnce({
            batchRecordId: 'batch123',
            templateName: 'Test Template',
            sectionName: 'Test Section'
        });

        BatchRecord.findById.mockResolvedValueOnce(mockBatchRecord);
        Template.findById.mockResolvedValueOnce(mockTemplate);
        BatchRecordData.prototype.save.mockResolvedValueOnce(mockDuplicateSection);

        const response = await POST(mockRequest);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.message).toBe('Section duplicated successfully');
        expect(responseData.section).toBeDefined();
    });

    test('returns 500 on database error', async () => {
        mockRequest.json.mockResolvedValueOnce({
            batchRecordId: 'batch123',
            templateName: 'Test Template',
            sectionName: 'Test Section'
        });

        BatchRecord.findById.mockRejectedValueOnce(new Error('Database error'));

        const response = await POST(mockRequest);

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: 'Internal server error' });
    });
});