import { POST } from '../../../app/api/forgot-password/route';
import dbConnect from '../../../lib/mongoose';
import User from '../../../models/User';
import { sendPasswordResetEmail } from '../../../lib/sendEmail';

/**
 * @fileoverview Tests for the forgot password API endpoint
 * Tests password reset token generation and email sending functionality
 */


jest.mock('../../../lib/mongoose');
jest.mock('../../../lib/sendEmail');
jest.mock('../../../models/User');

describe('POST /api/forgot-password', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if email is not provided', async () => {
        const request = {
            json: async () => ({})
        };

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Email is required');
    });

    it('should return 404 if user is not found', async () => {
        User.findOne.mockResolvedValue(null);

        const request = {
            json: async () => ({ email: 'nonexistent@example.com' })
        };

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('No account found with this email');
    });

    it('should generate reset token and send email for valid user', async () => {
        const mockUser = {
            email: 'test@example.com',
            save: jest.fn()
        };
        User.findOne.mockResolvedValue(mockUser);
        sendPasswordResetEmail.mockResolvedValue(true);

        const request = {
            json: async () => ({ email: 'test@example.com' })
        };

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('Password reset link has been sent. Please check your email.');
        expect(mockUser.save).toHaveBeenCalled();
        expect(sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com', expect.any(String));
    });

    it('should return 500 if an error occurs', async () => {
        User.findOne.mockRejectedValue(new Error('Database error'));

        const request = {
            json: async () => ({ email: 'test@example.com' })
        };

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('An error occurred while processing your request');
    });
});