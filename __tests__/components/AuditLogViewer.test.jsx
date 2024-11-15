/**
 * @fileoverview Test suite for AuditLogViewer component
 * Tests cover access control, data display, and error handling scenarios
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuditLogViewer from '@/components/AuditLogViewer'

describe('AuditLogViewer', () => {
  // Mock data representing a typical audit log entry
  const mockLogs = [
    {
      _id: '1',
      timestamp: '2024-03-20T10:00:00Z',
      operationType: 'update',
      collectionName: 'BatchRecord',
      documentId: 'doc123',
      metadata: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          role: 'ADMIN'
        },
        clientInfo: { ip: '127.0.0.1' }
      },
      updateDescription: {
        fields: [{
          sectionName: 'Header',
          label: 'Row 1',
          fieldName: 'Status',
          old: 'Draft',
          new: 'Completed'
        }]
      }
    }
  ];

  /**
   * Common test setup
   */
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Access Control Tests
   * Verifies component behavior based on user roles
   */
  describe('Access Control', () => {
    /**
     * Verifies that admin users can access the audit log viewer
     */
    it('renders for admin users', async () => {
      global.setTestUserRole('ADMIN');
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ logs: [], filters: { users: [], roles: [], collections: [] } })
      });

      render(<AuditLogViewer />);
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    /**
     * Verifies that non-admin users are shown access denied message
     */
    it('shows access denied for non-admin users', () => {
      global.setTestUserRole('LABELING');
      render(<AuditLogViewer />);
      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    });
  });

  /**
   * Data Display Tests
   * Verifies correct rendering of audit log entries
   */
  describe('Data Display', () => {
    beforeEach(() => {
      global.setTestUserRole('ADMIN');
    });

    /**
     * Verifies that log entries are correctly rendered with all expected fields
     */
    it('renders log entries correctly', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          logs: mockLogs,
          filters: { users: [], roles: [], collections: [] }
        })
      });

      render(<AuditLogViewer />);
      
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('update')).toBeInTheDocument();
        expect(screen.getByText('BatchRecord')).toBeInTheDocument();
      });
    });
  });

  /**
   * Error Handling Tests
   * Verifies component behavior under error conditions
   */
  describe('Error Handling', () => {
    beforeEach(() => {
      global.setTestUserRole('ADMIN');
    });

    /**
     * Verifies that API errors are handled appropriately
     * and error messages are logged
     */
    it('handles API errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      global.fetch.mockRejectedValueOnce(new Error('API Error'));

      render(<AuditLogViewer />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });
  });
});