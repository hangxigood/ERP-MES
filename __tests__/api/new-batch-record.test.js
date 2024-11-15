import { POST } from '../../src/app/api/new-batch-record/route';
import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongoose';
import Template from '../../models/Template';
import BatchRecord from '../../models/BatchRecord';
import BatchRecordData from '../../models/BatchRecordData';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/authOptions";

/**
 * @fileoverview Jest tests for the new batch record API endpoint.
 * This file contains tests to ensure the correct functionality of the API endpoint
 * for creating new batch records, including authentication, template validation,
 * and batch record creation.
 */


jest.mock('next-auth/next');
jest.mock('../../lib/mongoose');
jest.mock('../../models/Template');
jest.mock('../../models/BatchRecord');
jest.mock('../../models/BatchRecordData');

describe('POST /api/new-batch-record', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        dbConnect.mockResolvedValue();
    });

    it('should return 401 if the user is not authenticated', async () => {
        getServerSession.mockResolvedValue(null);

        const request = new Request('http://localhost/api/new-batch-record', { method: 'POST' });
        const response = await POST(request, { params: { templateName: 'Test Template' } });

        expect(response.status).toBe(401);
        const json = await response.json();
        expect(json.error).toBe('Unauthorized');
    });

    it('should return 404 if the template is not found', async () => {
        getServerSession.mockResolvedValue({ user: { id: 'user1' } });
        Template.findOne.mockResolvedValue(null);

        const request = new Request('http://localhost/api/new-batch-record', { method: 'POST' });
        const response = await POST(request, { params: { templateName: 'Nonexistent Template' } });

        expect(response.status).toBe(404);
        const json = await response.json();
        expect(json.error).toBe('Template not found');
    });

    it('should return 400 if the template structure is invalid', async () => {
        getServerSession.mockResolvedValue({ user: { id: 'user1' } });
        Template.findOne.mockResolvedValue({ structure: [] });

        const request = new Request('http://localhost/api/new-batch-record', { method: 'POST' });
        const response = await POST(request, { params: { templateName: 'Invalid Template' } });

        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json.error).toBe('Invalid template structure');
    });

    it('should create a new batch record and return 200', async () => {
        getServerSession.mockResolvedValue({ user: { id: 'user1' } });
        Template.findOne.mockResolvedValue({
            _id: 'template1',
            name: 'Valid Template',
            structure: [
                {
                    sectionName: 'Section 1',
                    fields: [{ name: 'Field 1', default: '', fieldType: 'text' }]
                }
            ]
        });
        BatchRecord.prototype.save.mockResolvedValue();
        BatchRecordData.prototype.save.mockResolvedValue();

        const request = new Request('http://localhost/api/new-batch-record', { method: 'POST' });
        const response = await POST(request, { params: { templateName: 'Valid Template' } });

        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json.message).toBe('Batch record created successfully');
        expect(json.templateName).toBe('Valid Template');
    });

    it('should return 500 if there is an error creating batch record data', async () => {
        getServerSession.mockResolvedValue({ user: { id: 'user1' } });
        Template.findOne.mockResolvedValue({
            _id: 'template1',
            name: 'Valid Template',
            structure: [
                {
                    sectionName: 'Section 1',
                    fields: [{ name: 'Field 1', default: '', fieldType: 'text' }]
                }
            ]
        });
        BatchRecord.prototype.save.mockResolvedValue();
        BatchRecordData.prototype.save.mockRejectedValue(new Error('Error creating batch record data'));

        const request = new Request('http://localhost/api/new-batch-record', { method: 'POST' });
        const response = await POST(request, { params: { templateName: 'Valid Template' } });

        expect(response.status).toBe(500);
        const json = await response.json();
        expect(json.error).toBe('Error creating batch record data');
    });
});