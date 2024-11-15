import { GET } from '../../../src/app/api/batch-records/route';
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongoose';
import BatchRecord from '../../../models/BatchRecord';
import BatchRecordData from '../../../models/BatchRecordData';
import { getServerSession } from "next-auth/next";

/**
 * @fileoverview Tests for the batch records API endpoint.
 * This file contains tests for the GET method of the batch records API endpoint.
 * It uses mock authentication sessions to simulate different user roles and
 * verifies the correct behavior of the API endpoint.
 */


jest.mock('next-auth/next');
jest.mock('../../../lib/mongoose');
jest.mock('../../../models/BatchRecord');
jest.mock('../../../models/BatchRecordData');

describe('GET /api/batch-records', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if the user is not authenticated', async () => {
        getServerSession.mockResolvedValueOnce(null);

        const response = await GET();

        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should return 500 if there is a server error', async () => {
        getServerSession.mockResolvedValueOnce({ user: { role: 'ADMIN' } });
        dbConnect.mockRejectedValueOnce(new Error('Database connection error'));

        const response = await GET();

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: 'Internal Server Error' });
    });

    it('should return batch records for authenticated users', async () => {
        getServerSession.mockResolvedValueOnce({ user: { role: 'ADMIN' } });
        dbConnect.mockResolvedValueOnce();

        const mockBatchRecords = [
            {
                _id: '1',
                template: { name: 'Template 1' },
                status: 'Completed',
                createdBy: { name: 'User 1' },
                updatedBy: { name: 'User 2' },
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        const mockBatchRecordData = {
            batchRecord: '1',
            sectionName: 'Header',
            order: 1,
            fields: [{ fieldName: 'Lot Number', fieldValue: '12345' }]
        };

        BatchRecord.find.mockResolvedValueOnce(mockBatchRecords);
        BatchRecordData.findOne.mockResolvedValueOnce(mockBatchRecordData);

        const response = await GET();

        expect(response.status).toBe(200);
        const jsonResponse = await response.json();
        expect(jsonResponse).toEqual([
            {
                id: '1',
                templateName: 'Template 1',
                status: 'Completed',
                lotNumber: '12345',
                createdBy: 'User 1',
                createdAt: mockBatchRecords[0].createdAt,
                updatedBy: 'User 2',
                updatedAt: mockBatchRecords[0].updatedAt
            }
        ]);
    });
});