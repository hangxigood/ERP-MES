import { NextResponse } from 'next/server';
import { POST } from '../../../app/api/users/create/route';
import User from '../../../models/User';
import dbConnect from '../../../lib/mongoose';
import { sendPasswordSetupEmail } from '../../../lib/sendEmail';
import { getToken } from 'next-auth/jwt';

/**
 * @fileoverview Tests for the create user API endpoint
 * This file contains tests to verify the functionality of creating new users
 * including authentication, validation, and error handling
 */


// Mock dependencies
jest.mock('next-auth/jwt');
jest.mock('../../../lib/mongoose');
jest.mock('../../../models/User');
jest.mock('../../../lib/sendEmail');

describe('POST /api/users/create', () => {
    const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'PRODUCTION',
        createdById: '123',
        updatedById: '123'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if not authenticated', async () => {
        getToken.mockResolvedValue(null);
        
        const request = new Request('http://localhost:3000/api/users/create', {
            method: 'POST',
            body: JSON.stringify(mockUser)
        });

        const response = await POST(request);
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ message: 'Unauthorized' });
    });

    it('should create a new user successfully', async () => {
        getToken.mockResolvedValue({ role: 'ADMIN' });
        User.findOne.mockResolvedValue(null);
        
        const savedUser = {
            ...mockUser,
            passwordSetupToken: 'token123',
            passwordSetupExpires: Date.now() + 24 * 3600000,
            toObject: () => ({
                ...mockUser,
                passwordSetupToken: 'token123',
                passwordSetupExpires: Date.now() + 24 * 3600000
            })
        };
        
        User.prototype.save.mockResolvedValue(savedUser);
        sendPasswordSetupEmail.mockResolvedValue(true);

        const request = new Request('http://localhost:3000/api/users/create', {
            method: 'POST',
            body: JSON.stringify(mockUser)
        });

        const response = await POST(request);
        expect(response.status).toBe(201);
        
        const responseData = await response.json();
        expect(responseData).toEqual(expect.objectContaining({
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role
        }));
        expect(responseData.passwordSetupToken).toBeUndefined();
    });

    it('should return 400 if user already exists', async () => {
        getToken.mockResolvedValue({ role: 'ADMIN' });
        User.findOne.mockResolvedValue({ email: mockUser.email });

        const request = new Request('http://localhost:3000/api/users/create', {
            method: 'POST',
            body: JSON.stringify(mockUser)
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ message: 'User already exists' });
    });

    it('should return 500 on database error', async () => {
        getToken.mockResolvedValue({ role: 'ADMIN' });
        User.findOne.mockRejectedValue(new Error('Database error'));

        const request = new Request('http://localhost:3000/api/users/create', {
            method: 'POST',
            body: JSON.stringify(mockUser)
        });

        const response = await POST(request);
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({
            message: 'Error creating user',
            error: 'Database error'
        });
    });
});