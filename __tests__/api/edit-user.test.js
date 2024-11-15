import { NextResponse } from 'next/server';
import { POST } from '../../../app/api/users/edit/route';
import User from '../../../models/User';
import bcrypt from 'bcrypt';
import { getToken } from 'next-auth/jwt';

/**
 * @fileoverview Tests for the user edit API endpoint
 * Testing unauthorized access, validation, and successful updates
 */


jest.mock('../../../lib/mongoose');
jest.mock('../../../models/User');
jest.mock('next-auth/jwt');
jest.mock('bcrypt');

describe('POST /api/users/edit', () => {
    const mockRequest = (body) => ({
        json: () => Promise.resolve(body)
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        getToken.mockResolvedValue(null);
        
        const response = await POST(mockRequest({}));
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ message: 'Unauthorized' });
    });

    it('should return 401 if user is not admin', async () => {
        getToken.mockResolvedValue({ role: 'PRODUCTION' });
        
        const response = await POST(mockRequest({}));
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ message: 'Unauthorized' });
    });

    it('should return 401 if admin password is invalid', async () => {
        getToken.mockResolvedValue({ role: 'ADMIN' });
        bcrypt.compare.mockResolvedValue(false);
        User.findById.mockResolvedValue({ password: 'hashedpass' });

        const response = await POST(mockRequest({
            adminId: '123',
            adminPassword: 'wrongpass',
            userEmail: 'user@test.com',
            updatedFields: {}
        }));

        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ message: 'Invalid admin password' });
    });

    it('should return 404 if user to update is not found', async () => {
        getToken.mockResolvedValue({ role: 'ADMIN' });
        bcrypt.compare.mockResolvedValue(true);
        User.findById.mockResolvedValue({ password: 'hashedpass' });
        User.findOne.mockResolvedValue(null);

        const response = await POST(mockRequest({
            adminId: '123',
            adminPassword: 'correctpass',
            userEmail: 'nonexistent@test.com',
            updatedFields: {}
        }));

        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({ message: 'User not found' });
    });

    it('should successfully update user fields', async () => {
        getToken.mockResolvedValue({ role: 'ADMIN' });
        bcrypt.compare.mockResolvedValue(true);
        User.findById.mockResolvedValue({ password: 'hashedpass' });

        const mockUser = {
            email: 'user@test.com',
            name: 'Old Name',
            toObject: () => ({ 
                email: 'user@test.com',
                name: 'New Name'
            }),
            save: jest.fn()
        };
        User.findOne.mockResolvedValue(mockUser);

        const response = await POST(mockRequest({
            adminId: '123',
            adminPassword: 'correctpass',
            userEmail: 'user@test.com',
            updatedFields: { name: 'New Name' }
        }));

        expect(response.status).toBe(200);
        expect(mockUser.save).toHaveBeenCalled();
        expect(await response.json()).toEqual({
            message: 'User updated successfully',
            user: { email: 'user@test.com', name: 'New Name' }
        });
    });
});