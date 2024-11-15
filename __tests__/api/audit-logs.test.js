import { GET, POST } from '../../../src/pages/api/audit-logs';
import { createMocks } from 'node-mocks-http';
import dbConnect from '../../../src/lib/mongoose';
import FieldValueHistory from '../../../src/models/FieldValueHistory';
import User from '../../../src/models/User';

/**
 * @fileoverview Jest tests for the audit logs API endpoint.
 * This file contains tests for the GET and POST endpoints of the audit logs API.
 * It uses mock authentication sessions to simulate different user roles and
 * verifies the correct behavior of the API based on the user's role and request parameters.
 */


jest.mock('../../../src/lib/mongoose');
jest.mock('../../../src/models/FieldValueHistory');
jest.mock('../../../src/models/User');

describe('Audit Logs API', () => {
    beforeAll(async () => {
        await dbConnect();
    });

    describe('GET /api/audit-logs', () => {
        it('should return 401 if the user is not authenticated', async () => {
            global.setTestUserRole('PRODUCTION');
            const { req, res } = createMocks({
                method: 'GET',
                url: '/api/audit-logs'
            });

            await GET(req, res);

            expect(res.statusCode).toBe(401);
            expect(res._getJSONData()).toEqual({ error: 'Unauthorized' });
        });

        it('should return audit logs for an admin user', async () => {
            global.setTestUserRole('ADMIN');
            FieldValueHistory.find.mockResolvedValueOnce([]);
            FieldValueHistory.countDocuments.mockResolvedValueOnce(0);
            User.find.mockResolvedValueOnce([]);
            FieldValueHistory.distinct.mockResolvedValueOnce([]);

            const { req, res } = createMocks({
                method: 'GET',
                url: '/api/audit-logs'
            });

            await GET(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                logs: [],
                pagination: {
                    total: 0,
                    pages: 0,
                    currentPage: 1,
                    limit: 50
                },
                filters: {
                    collections: ['BatchRecordData'],
                    users: [],
                    roles: [],
                    operations: ['update', 'insert']
                },
                stats: {
                    totalLogs: 0,
                    uniqueCollections: 1,
                    uniqueUsers: 0,
                    recentActivity: {
                        today: 0,
                        thisWeek: 0
                    }
                }
            });
        });
    });

    describe('POST /api/audit-logs', () => {
        it('should return 401 if the user is not authenticated', async () => {
            global.setTestUserRole('PRODUCTION');
            const { req, res } = createMocks({
                method: 'POST',
                body: { logId: '60d21b4667d0d8992e610c85' }
            });

            await POST(req, res);

            expect(res.statusCode).toBe(401);
            expect(res._getJSONData()).toEqual({ error: 'Unauthorized' });
        });

        it('should return log details for an admin user', async () => {
            global.setTestUserRole('ADMIN');
            const mockLog = {
                _id: '60d21b4667d0d8992e610c85',
                metadata: {
                    userId: {
                        _id: '60d21b4667d0d8992e610c86',
                        name: 'Admin User',
                        email: 'admin@example.com',
                        role: 'ADMIN'
                    }
                }
            };
            FieldValueHistory.findById.mockResolvedValueOnce(mockLog);

            const { req, res } = createMocks({
                method: 'POST',
                body: { logId: '60d21b4667d0d8992e610c85' }
            });

            await POST(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                log: {
                    ...mockLog,
                    metadata: {
                        ...mockLog.metadata,
                        user: {
                            id: '60d21b4667d0d8992e610c86',
                            name: 'Admin User',
                            email: 'admin@example.com',
                            role: 'ADMIN'
                        }
                    }
                }
            });
        });

        it('should return 400 for an invalid log ID', async () => {
            global.setTestUserRole('ADMIN');
            const { req, res } = createMocks({
                method: 'POST',
                body: { logId: 'invalid-id' }
            });

            await POST(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ error: 'Invalid log ID' });
        });

        it('should return 404 if the log is not found', async () => {
            global.setTestUserRole('ADMIN');
            FieldValueHistory.findById.mockResolvedValueOnce(null);

            const { req, res } = createMocks({
                method: 'POST',
                body: { logId: '60d21b4667d0d8992e610c85' }
            });

            await POST(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ error: 'Log not found' });
        });
    });
});