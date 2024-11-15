import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { GET, POST, DELETE } from '../../../app/api/batch-records/[batchRecordId]/sections/[sectionName]/route';
import dbConnect from '../../../lib/mongoose';
import BatchRecord from '../../../models/BatchRecord';
import BatchRecordData from '../../../models/BatchRecordData';
import { getServerSession } from "next-auth/next";

/**
 * @fileoverview Tests for the batch record section API endpoints
 * Tests GET, POST and DELETE operations for batch record sections
 */


jest.mock('../../../lib/mongoose');
jest.mock('../../../models/BatchRecord');
jest.mock('../../../models/BatchRecordData');
jest.mock('next-auth/next');

describe('Batch Record Section API', () => {
    const mockSession = {
        user: {
            id: 'user123',
            role: 'PRODUCTION'
        }
    };

    const mockParams = {
        batchRecordId: '507f1f77bcf86cd799439011',
        sectionName: 'testSection'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        getServerSession.mockResolvedValue(mockSession);
    });

    describe('GET endpoint', () => {
        it('should return 401 if not authenticated', async () => {
            getServerSession.mockResolvedValueOnce(null);
            
            const response = await GET({}, { params: mockParams });
            expect(response.status).toBe(401);
        });

        it('should return 400 for invalid batch record ID', async () => {
            const response = await GET({}, { params: { ...mockParams, batchRecordId: 'invalid' }});
            expect(response.status).toBe(400);
        });

        it('should return section data successfully', async () => {
            const mockBatchRecord = {
                template: {
                    structure: [{
                        sectionName: 'testSection',
                        sectionDescription: 'Test Description'
                    }]
                }
            };

            const mockBatchRecordData = {
                toObject: () => ({
                    fields: {},
                    status: 'draft'
                })
            };

            BatchRecord.findById.mockResolvedValue(mockBatchRecord);
            BatchRecordData.findOne.mockResolvedValue(mockBatchRecordData);

            const response = await GET({}, { params: mockParams });
            expect(response.status).toBe(200);
        });
    });

    describe('POST endpoint', () => {
        const mockRequest = {
            json: () => Promise.resolve({ 
                data: { field1: 'value1' }, 
                status: 'draft' 
            }),
            headers: {
                get: jest.fn()
            }
        };

        it('should update section data successfully', async () => {
            const mockSectionData = {
                fields: {},
                save: jest.fn().mockResolvedValue({ fields: { field1: 'value1' }})
            };

            BatchRecordData.findOne.mockResolvedValue(mockSectionData);

            const response = await POST(mockRequest, { params: mockParams });
            expect(response.status).toBe(200);
        });

        it('should return 403 if section is already signed off', async () => {
            BatchRecordData.findOne.mockResolvedValue(null);

            const response = await POST(mockRequest, { params: mockParams });
            expect(response.status).toBe(403);
        });
    });

    describe('DELETE endpoint', () => {
        it('should delete duplicate section successfully', async () => {
            BatchRecordData.findOne.mockResolvedValue({ isDuplicate: true });
            BatchRecordData.deleteOne.mockResolvedValue({});

            const response = await DELETE({}, { params: mockParams });
            expect(response.status).toBe(200);
        });

        it('should return 403 when trying to delete original section', async () => {
            BatchRecordData.findOne.mockResolvedValue({ isDuplicate: false });

            const response = await DELETE({}, { params: mockParams });
            expect(response.status).toBe(403);
        });
    });
});