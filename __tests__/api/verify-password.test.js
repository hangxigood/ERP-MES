import { POST } from '@/app/api/verify-password/route';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth/next';

/**
 * @fileoverview Tests for the verify-password API endpoint.
 * This test suite verifies the functionality of password verification,
 * including authentication checks and various response scenarios.
 */


// Mock external dependencies
jest.mock('next-auth/next');
jest.mock('@/models/User');
jest.mock('bcrypt');
jest.mock('@/lib/mongoose', () => jest.fn());

describe('POST /api/verify-password', () => {
    const mockUserId = '123';
    const mockPassword = 'testPassword';
    const mockHashedPassword = 'hashedPassword';

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    test('should return 401 when no session exists', async () => {
        getServerSession.mockResolvedValue(null);

        const req = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ password: mockPassword }),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.message).toBe('Unauthorized');
    });

    test('should return 404 when user is not found', async () => {
        getServerSession.mockResolvedValue({
            user: { id: mockUserId }
        });
        User.findById.mockResolvedValue(null);

        const req = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ password: mockPassword }),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.message).toBe('User not found');
    });

    test('should return 200 when password is valid', async () => {
        getServerSession.mockResolvedValue({
            user: { id: mockUserId }
        });
        User.findById.mockResolvedValue({
            password: mockHashedPassword
        });
        bcrypt.compare.mockResolvedValue(true);

        const req = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ password: mockPassword }),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('Password verified');
    });

    test('should return 401 when password is invalid', async () => {
        getServerSession.mockResolvedValue({
            user: { id: mockUserId }
        });
        User.findById.mockResolvedValue({
            password: mockHashedPassword
        });
        bcrypt.compare.mockResolvedValue(false);

        const req = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ password: mockPassword }),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.message).toBe('Invalid password');
    });

    test('should return 500 when an error occurs', async () => {
        getServerSession.mockRejectedValue(new Error('Database error'));

        const req = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ password: mockPassword }),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Error verifying password');
    });
});