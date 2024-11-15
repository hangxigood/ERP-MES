// jest.setup.js
import '@testing-library/jest-dom'

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

// Default to ADMIN role
let currentMockSession = mockSessions.ADMIN;

// Allow tests to set the role
global.setTestUserRole = (role) => {
  currentMockSession = mockSessions[role];
};

jest.mock('next-auth/react', () => ({
  useSession: () => currentMockSession
}));