/**
 * @fileoverview Jest setup configuration for SMI Electronic Batch Records testing.
 * This file provides mock authentication sessions for different user roles and
 * configures the test environment with necessary testing libraries.
 * It allows tests to simulate different user roles by providing mock session data
 * that mimics next-auth behavior.
 */

import '@testing-library/jest-dom'

/**
 * @typedef {Object} UserData
 * @property {string} name - The user's full name
 * @property {string} email - The user's email address
 * @property {'ADMIN' | 'PRODUCTION' | 'QA' | 'TEAM_LEADER' | 'LABELING'} role - The user's role
 */

/**
 * @typedef {Object} MockSession
 * @property {Object} data - Session data containing user information
 * @property {UserData} data.user - User data
 * @property {'authenticated'} status - Authentication status
 */

/**
 * Collection of mock sessions for different user roles
 * @type {Object.<string, MockSession>}
 */
const mockSessions = {
  ADMIN: {
    data: {
      user: { 
        name: 'Admin User', 
        email: 'admin@example.com',
        role: 'ADMIN'
      }
    },
    status: 'authenticated'
  },
  PRODUCTION: {
    data: {
      user: {
        name: 'Production User',
        email: 'production@example.com',
        role: 'PRODUCTION'
      }
    },
    status: 'authenticated'
  },
  QA: {
    data: {
      user: {
        name: 'QA User',
        email: 'qa@example.com',
        role: 'QA'
      }
    },
    status: 'authenticated'
  },
  TEAM_LEADER: {
    data: {
      user: {
        name: 'Team Leader',
        email: 'leader@example.com',
        role: 'TEAM_LEADER'
      }
    },
    status: 'authenticated'
  },
  LABELING: {
    data: {
      user: {
        name: 'Labeling User',
        email: 'labeling@example.com',
        role: 'LABELING'
      }
    },
    status: 'authenticated'
  }
};

/** @type {MockSession} */
let currentMockSession = mockSessions.ADMIN;

/**
 * Sets the current test user role for mocking authentication
 * @global
 * @param {'ADMIN' | 'PRODUCTION' | 'QA' | 'TEAM_LEADER' | 'LABELING'} role - The role to set for the current test
 * @returns {void}
 */
global.setTestUserRole = (role) => {
  currentMockSession = mockSessions[role];
};

/**
 * Mock implementation of next-auth/react
 * @type {Object}
 */
jest.mock('next-auth/react', () => ({
  useSession: () => currentMockSession
}));