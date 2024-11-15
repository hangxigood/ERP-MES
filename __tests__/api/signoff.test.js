import { POST } from '../../../app/api/batch-records/[batchRecordId]/sections/[sectionName]/signoff/route';
import BatchRecordData from '../../../models/BatchRecordData';
import connectDB from '../../../lib/mongoose';
import { getServerSession } from 'next-auth/next';

/**
 * @fileoverview Tests for the section sign-off API endpoint.
 * These tests verify the functionality of signing off on batch record sections,
 * including authentication checks and data validation.
 */


jest.mock('../../../lib/mongoose');
jest.mock('next-auth/next');
jest.mock('../../../models/BatchRecordData');

describe('Section Sign-off API', () => {
    const mockParams = {
        batchRecordId: 'test-batch-123',
        sectionName: 'test-section'
    };
    
    const mockComment = 'Test sign-off comment';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        getServerSession.mockResolvedValue(null);

        const req = {
            json: () => Promise.resolve({ comment: mockComment })  
        };

        const response = await POST(req, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.message).toBe('Unauthorized');
    });

    it('should successfully sign off a section', async () => {
        const mockSession = {
            user: {
                name: 'Test User',
                role: 'QA',
                id: 'test-user-id'
            }
        };

        const mockUpdatedSection = {
            batchRecord: mockParams.batchRecordId,
            sectionName: mockParams.sectionName,
            signoffs: [{
                signedBy: 'QA(Test User)',
                signedAt: expect.any(Date),
                comment: mockComment
            }],
            updatedBy: 'test-user-id'
        };

        getServerSession.mockResolvedValue(mockSession);
        BatchRecordData.findOneAndUpdate.mockResolvedValue(mockUpdatedSection);

        const req = {
            json: () => Promise.resolve({ comment: mockComment })
        };

        const response = await POST(req, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(BatchRecordData.findOneAndUpdate).toHaveBeenCalledWith(
            { batchRecord: mockParams.batchRecordId, sectionName: mockParams.sectionName },
            expect.any(Object),
            { new: true }
        );
        expect(data).toEqual(mockUpdatedSection);
    });

    it('should return 404 if section is not found', async () => {
        const mockSession = {
            user: {
                name: 'Test User',
                role: 'QA',
                id: 'test-user-id'
            }
        };

        getServerSession.mockResolvedValue(mockSession);
        BatchRecordData.findOneAndUpdate.mockResolvedValue(null);

        const req = {
            json: () => Promise.resolve({ comment: mockComment })
        };

        const response = await POST(req, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.message).toBe('Section not found');
    });

    it('should return 500 if database operation fails', async () => {
        const mockSession = {
            user: {
                name: 'Test User',
                role: 'QA',
                id: 'test-user-id'
            }
        };

        getServerSession.mockResolvedValue(mockSession);
        BatchRecordData.findOneAndUpdate.mockRejectedValue(new Error('Database error'));

        const req = {
            json: () => Promise.resolve({ comment: mockComment })
        };

        const response = await POST(req, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Error signing off section');
    });
});