import { POST } from '../../../app/api/password-setup/route';
import User from '../../../models/User';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongoose';

/**
 * @fileoverview Tests for password setup API endpoint
 * Tests validation, error handling, and successful password updates
 */


jest.mock('../../../lib/mongoose');
jest.mock('../../../models/User');
jest.mock('bcrypt');

describe('Password Setup API', () => {
    const mockRequest = (body) => ({
        json: () => Promise.resolve(body)
    });

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.SALT_ROUNDS = '10';
    });

    it('should reject invalid passwords', async () => {
        const req = mockRequest({ token: 'validToken', password: 'weak' });
        const response = await POST(req);
        const data = await response.json();
        
        expect(response.status).toBe(400);
        expect(data.error).toBe('Password does not meet security requirements');
    });

    it('should reject expired or invalid tokens', async () => {
        const req = mockRequest({ 
            token: 'invalidToken', 
            password: 'StrongP@ss123' 
        });
        
        User.findOne.mockResolvedValue(null);
        
        const response = await POST(req);
        const data = await response.json();
        
        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid or expired password setup token');
    });

    it('should successfully update password', async () => {
        const mockUser = {
            save: jest.fn()
        };

        const req = mockRequest({
            token: 'validToken',
            password: 'StrongP@ss123'
        });

        User.findOne.mockResolvedValue(mockUser);
        bcrypt.hash.mockResolvedValue('hashedPassword');

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('Password set successfully');
        expect(mockUser.password).toBe('hashedPassword');
        expect(mockUser.passwordSetupToken).toBeUndefined();
        expect(mockUser.passwordSetupExpires).toBeUndefined();
        expect(mockUser.save).toHaveBeenCalled();
    });

    it('should handle server configuration errors', async () => {
        const req = mockRequest({
            token: 'validToken',
            password: 'StrongP@ss123'
        });

        delete process.env.SALT_ROUNDS;

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Server configuration error');
    });

    it('should handle database errors', async () => {
        const req = mockRequest({
            token: 'validToken',
            password: 'StrongP@ss123'
        });

        dbConnect.mockRejectedValue(new Error('Database connection failed'));

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('An error occurred while setting the password');
    });
});