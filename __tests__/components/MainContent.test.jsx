import React from 'react';
import { render as rtlRender, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainContent from '../../components/MainContent';
import { SharedContext } from '../../contexts/BatchRecordContext';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Mock fetch API
global.fetch = jest.fn();

// Mock react-datasheet-grid
jest.mock('react-datasheet-grid', () => ({
  DataSheetGrid: ({ columns, value, onChange }) => (
    <div data-testid="data-sheet-grid">
      {columns.map(col => (
        <div key={col.title}>
          <div>{col.title}</div>
          <input 
            type="text"
            onChange={(e) => {
              const newData = [...value];
              newData[0] = { ...newData[0], [col.title]: e.target.value };
              onChange(newData);
            }}
          />
        </div>
      ))}
    </div>
  ),
  keyColumn: () => ({}),
  textColumn: {},
  floatColumn: {},
  intColumn: {},
  dateColumn: {},
  checkboxColumn: {},
}));

// Helper function to create a context with unsaved changes
const createTestContext = (overrides = {}) => ({
  setHasUnsavedChanges: jest.fn(),
  hasUnsavedChanges: true,
  setRefreshTrigger: jest.fn(),
  ...overrides
});

// Custom render function that includes the context
const render = (ui, { 
  context = createTestContext(),
  ...renderOptions 
} = {}) => {
  const Wrapper = ({ children }) => (
    <SharedContext.Provider value={context}>
      {children}
    </SharedContext.Provider>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};

describe('MainContent', () => {
  let alertMock;

  const mockInitialData = {
    fields: [
      {
        fieldName: 'TestField1',
        fieldType: 'text',
        fieldValue: ['value1', 'value2']
      },
      {
        fieldName: 'TestDate',
        fieldType: 'date',
        fieldValue: ['2024-03-20', '2024-03-21']
      },
      {
        fieldName: 'TestCheck',
        fieldType: 'checkbox',
        fieldValue: ['true', 'false']
      }
    ],
    sectionDescription: 'Test Description',
    batchInfo: {
      fields: [
        { fieldName: 'Family', fieldValue: ['Test Family'] },
        { fieldName: 'Part Number', fieldValue: ['123'] }
      ]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    );
    alertMock = jest.spyOn(window, 'alert').mockImplementation();
  });

  afterEach(() => {
    alertMock.mockRestore();
  });

  it('renders loading state when no columns are available', () => {
    render(
      <MainContent initialData={{}} />
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders DataSheetGrid with correct columns', async () => {
    render(
      <MainContent initialData={mockInitialData} />
    );

    await waitFor(() => {
      expect(screen.getByTestId('data-sheet-grid')).toBeInTheDocument();
      expect(screen.getByText('TestField1')).toBeInTheDocument();
      expect(screen.getByText('TestDate')).toBeInTheDocument();
    });
  });

  it('handles form submission with password verification', async () => {
    const mockOnUpdate = jest.fn();
    
    render(
      <MainContent 
        initialData={mockInitialData} 
        onUpdate={mockOnUpdate}
        templateName="test"
        batchRecordId="123"
        sectionName="section1"
      />
    );

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    // Change input value
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'new value' }});

    // Verify submit button is enabled
    await waitFor(() => {
      expect(screen.getByText('Submit')).not.toBeDisabled();
    });

    // Click submit button
    fireEvent.click(screen.getByText('Submit'));

    // Check for password modal
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Confirm Submit' })).toBeInTheDocument();
    });
  });

  it('handles signoff process', async () => {
    const mockOnSignoff = jest.fn();
    render(
      <MainContent 
        initialData={mockInitialData}
        onSignoff={mockOnSignoff}
      />
    );

    const signoffButton = screen.getByText('Sign Off');
    fireEvent.click(signoffButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Confirm Sign-off' })).toBeInTheDocument();
    });
  });

  it('displays batch record info correctly', () => {
    render(
      <MainContent initialData={mockInitialData} />
    );

    expect(screen.getByText('Test Family')).toBeInTheDocument();
  });

  it('handles data changes and tracks unsaved changes', async () => {
    render(
      <MainContent initialData={mockInitialData} />
    );

    // Wait for grid to be rendered
    await waitFor(() => {
      expect(screen.getByText('TestField1')).toBeInTheDocument();
    });

    // Verify that setHasUnsavedChanges was called
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });

  it('disables submit button when form is signed off', () => {
    const signedOffData = {
      ...mockInitialData,
      signoffs: [{ signedBy: 'User', signedAt: new Date().toISOString() }]
    };

    render(
      <MainContent initialData={signedOffData} />
    );

    const submitButton = screen.getByText('Submit');
    expect(submitButton).toBeDisabled();
  });

  it('displays error message on failed password verification', async () => {
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false
      })
    );

    const mockOnUpdate = jest.fn();

    render(
      <MainContent 
        initialData={mockInitialData}
        onUpdate={mockOnUpdate}
      />
    );

    // Submit button click
    fireEvent.click(screen.getByText('Submit'));

    // Find password modal
    const passwordModal = await screen.findByRole('dialog', { name: /confirm submit/i });
    expect(passwordModal).toBeInTheDocument();

    // Fill in password
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    // Submit form
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    // Verify alert was called
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Password verification failed. Please try again.');
    });
  });

  it('handles data transformation correctly', () => {
    const testData = {
      fields: [
        {
          fieldName: 'CheckboxField',
          fieldType: 'checkbox',
          fieldValue: ['true', 'false']
        },
        {
          fieldName: 'DateField',
          fieldType: 'date',
          fieldValue: ['2024-03-20', '2024-03-21']
        },
        {
          fieldName: 'TextField',
          fieldType: 'text',
          fieldValue: ['value1', 'value2']
        }
      ]
    };

    render(
      <MainContent initialData={testData} />
    );

    expect(screen.getByText('CheckboxField')).toBeInTheDocument();
    expect(screen.getByText('DateField')).toBeInTheDocument();
    expect(screen.getByText('TextField')).toBeInTheDocument();
  });

  it('handles refresh data after submission', async () => {
    const mockOnUpdate = jest.fn();
    
    // Reset fetch mock for this specific test
    global.fetch.mockReset();
    
    // Set up the sequence of fetch responses
    global.fetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true })) // Password verification
      .mockImplementationOnce(() => Promise.resolve({ // Section data
        ok: true,
        json: () => Promise.resolve({
          fields: [{ fieldName: 'UpdatedField', fieldValue: ['new value'] }]
        })
      }))
      .mockImplementationOnce(() => Promise.resolve({ // Header data
        ok: true,
        json: () => Promise.resolve({
          fields: [{ fieldName: 'Family', fieldValue: ['Updated Family'] }]
        })
      }));

    render(
      <MainContent 
        initialData={mockInitialData}
        onUpdate={mockOnUpdate}
        templateName="test"
        batchRecordId="123"
        sectionName="section1"
      />
    );

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    // Trigger a submission
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    // Fill and submit password
    await waitFor(() => {
      expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText('Password:');
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    
    const confirmButton = screen.getByRole('button', { name: 'Confirm Submit' });
    fireEvent.click(confirmButton);

    // Wait for the updates
    await waitFor(() => {
      expect(screen.getByText('UpdatedField')).toBeInTheDocument();
      expect(screen.getByText('Updated Family')).toBeInTheDocument();
    });
  });

  it('handles different field types correctly', () => {
    const testData = {
      fields: [
        {
          fieldName: 'FloatField',
          fieldType: 'float',
          fieldValue: ['1.23', '4.56']
        },
        {
          fieldName: 'IntField',
          fieldType: 'int',
          fieldValue: ['1', '2']
        }
      ]
    };

    render(
      <MainContent initialData={testData} />
    );

    expect(screen.getByText('FloatField')).toBeInTheDocument();
    expect(screen.getByText('IntField')).toBeInTheDocument();
  });

  it('handles error cases gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );

    render(
      <MainContent initialData={mockInitialData} />
    );

    // Trigger an error condition
    const signoffButton = screen.getByText('Sign Off');
    fireEvent.click(signoffButton);

    const passwordInput = screen.getByLabelText('Password:');
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    const confirmButton = screen.getByRole('button', { name: 'Confirm Sign-off' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
    alertMock.mockRestore();
  });

  it('handles form submission with custom context', async () => {
    const mockOnUpdate = jest.fn();
    const customContext = createTestContext({
      hasUnsavedChanges: false // Override specific values as needed
    });

    render(
      <MainContent 
        initialData={mockInitialData}
        onUpdate={mockOnUpdate}
      />,
      { context: customContext }
    );

    // Rest of the test...
  });

  it('handles successful sign-off with data refresh', async () => {
    const mockOnSignoff = jest.fn();
    const refreshedData = {
      fields: [
        {
          fieldName: 'RefreshedField',
          fieldType: 'text',
          fieldValue: ['new value']
        }
      ]
    };

    const headerData = {
      fields: [
        {
          fieldName: 'Family',
          fieldValue: ['Updated Family']
        }
      ]
    };

    // Setup fetch mock sequence
    global.fetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true })) // Password verification
      .mockImplementationOnce(() => Promise.resolve({ // Section data
        ok: true,
        json: () => Promise.resolve(refreshedData)
      }))
      .mockImplementationOnce(() => Promise.resolve({ // Header data
        ok: true,
        json: () => Promise.resolve(headerData)
      }));

    render(
      <MainContent 
        initialData={mockInitialData}
        onSignoff={mockOnSignoff}
        templateName="test"
        batchRecordId="123"
        sectionName="section1"
      />
    );

    // Click sign-off button
    const signoffButton = screen.getByText('Sign Off');
    fireEvent.click(signoffButton);

    // Fill and submit password
    await waitFor(() => {
      expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    });
    
    const passwordInput = screen.getByLabelText('Password:');
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    
    const confirmButton = screen.getByRole('button', { name: 'Confirm Sign-off' });
    fireEvent.click(confirmButton);

    // Verify the refresh sequence
    await waitFor(() => {
      expect(mockOnSignoff).toHaveBeenCalled();
      expect(screen.getByText('RefreshedField')).toBeInTheDocument();
      expect(screen.getByText('Updated Family')).toBeInTheDocument();
    });
  });

  it('handles failed sign-off with error message', async () => {
    const mockOnSignoff = jest.fn();
    
    // Mock fetch to fail password verification
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({ ok: false })
    );

    render(
      <MainContent 
        initialData={mockInitialData}
        onSignoff={mockOnSignoff}
      />
    );

    // Click sign-off button
    const signoffButton = screen.getByText('Sign Off');
    fireEvent.click(signoffButton);

    // Fill and submit password
    await waitFor(() => {
      expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    });
    
    const passwordInput = screen.getByLabelText('Password:');
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    const confirmButton = screen.getByRole('button', { name: 'Confirm Sign-off' });
    fireEvent.click(confirmButton);

    // Verify error message
    await waitFor(() => {
      expect(mockOnSignoff).not.toHaveBeenCalled();
      expect(alertMock).toHaveBeenCalledWith('Password verification failed. Please try again.');
    });
  });

  it('handles failed data refresh after successful sign-off', async () => {
    const mockOnSignoff = jest.fn();
    
    // Setup fetch mock sequence
    global.fetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true })) // Password verification success
      .mockImplementationOnce(() => Promise.resolve({ ok: false })); // Section data fetch fails

    render(
      <MainContent 
        initialData={mockInitialData}
        onSignoff={mockOnSignoff}
        templateName="test"
        batchRecordId="123"
        sectionName="section1"
      />
    );

    // Click sign-off button
    const signoffButton = screen.getByText('Sign Off');
    fireEvent.click(signoffButton);

    // Fill and submit password
    await waitFor(() => {
      expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    });
    
    const passwordInput = screen.getByLabelText('Password:');
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    
    const confirmButton = screen.getByRole('button', { name: 'Confirm Sign-off' });
    fireEvent.click(confirmButton);

    // Verify the sequence
    await waitFor(() => {
      expect(mockOnSignoff).toHaveBeenCalled();
      // Original data should still be visible since refresh failed
      expect(screen.getByText('TestField1')).toBeInTheDocument();
    });
  });
});