import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import BatchRecordPage from '../../app/(batchRecordPage)/[templateName]/[batchRecordId]/page';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

// Mock the next-auth/react module
jest.mock('next-auth/react', () => ({
    useSession: jest.fn()
}));

describe('BatchRecordPage', () => {
    const mockRouter = {
        push: jest.fn()
    };
    
    beforeEach(() => {
        useRouter.mockReturnValue(mockRouter);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('shows loading state when session status is loading', () => {
        useSession.mockReturnValue({
            data: null,
            status: 'loading'
        });

        render(<BatchRecordPage params={{ templateName: 'test', batchRecordId: '123' }} />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('redirects to Header section when session is loaded', () => {
        useSession.mockReturnValue({
            data: { user: { name: 'Test User' }},
            status: 'authenticated'
        });

        render(<BatchRecordPage params={{ templateName: 'test', batchRecordId: '123' }} />);
        expect(mockRouter.push).toHaveBeenCalledWith('/test/123/Header');
        expect(screen.getByText('Redirecting to Header section...')).toBeInTheDocument();
    });

    it('displays correct batch record title', () => {
        useSession.mockReturnValue({
            data: { user: { name: 'Test User' }},
            status: 'authenticated'
        });

        render(<BatchRecordPage params={{ templateName: 'TestTemplate', batchRecordId: '123' }} />);
        expect(screen.getByText('BATCH RECORD: TestTemplate')).toBeInTheDocument();
    });
});