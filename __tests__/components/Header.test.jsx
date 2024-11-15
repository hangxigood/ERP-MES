/**
 * @fileoverview Test suite for the Header component
 * Tests header rendering, user session display, and logout functionality
 * for different user roles using mock authentication data.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../../components/Header';

describe('Header Component', () => {
    const mockTitle = 'Test Title';

    beforeEach(() => {
        // Start with admin role by default
        global.setTestUserRole('ADMIN');
    });

    test('renders header with title', () => {
        render(<Header title={mockTitle} />);
        expect(screen.getByText(mockTitle)).toBeInTheDocument();
    });

    test('displays user name when session exists', () => {
        render(<Header title={mockTitle} />);
        expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    test('displays logout button when session exists', () => {
        render(<Header title={mockTitle} />);
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    test('renders correctly for different user roles', () => {
        const roles = ['PRODUCTION', 'QA', 'TEAM_LEADER', 'LABELING'];
        
        roles.forEach(role => {
            global.setTestUserRole(role);
            render(<Header title={mockTitle} />);
            
            // Verify user name is displayed correctly for each role
            const expectedNames = {
                PRODUCTION: 'Production User',
                QA: 'QA User',
                TEAM_LEADER: 'Team Leader',
                LABELING: 'Labeling User'
            };
            
            expect(screen.getByText(expectedNames[role])).toBeInTheDocument();
        });
    });

    test('title links to home page', () => {
        render(<Header title={mockTitle} />);
        const titleLink = screen.getByText(mockTitle);
        expect(titleLink.closest('a')).toHaveAttribute('href', '/');
    });

    test('has correct styling classes', () => {
        render(<Header title={mockTitle} />);
        const headerElement = screen.getByRole('banner');
        expect(headerElement).toHaveClass('bg-neutral-700', 'text-white');
    });
});