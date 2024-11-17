'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataSheetGrid, keyColumn, textColumn, floatColumn, intColumn, dateColumn, checkboxColumn } from 'react-datasheet-grid';
import PasswordModal from './PasswordModal';
import { useContext } from 'react';
import { SharedContext } from '../contexts/BatchRecordContext';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import BatchRecordInfo from './BatchRecordInfo';

const MainContent = ({ initialData: propInitialData, onUpdate, onSignoff, sectionName, templateName, batchRecordId }) => {
  // Add initialData state
  const [initialData, setInitialData] = useState(propInitialData);
  const [formData, setFormData] = useState([]);
  // State to track form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [columns, setColumns] = useState([]);
  const [sectionDescription, setSectionDescription] = useState('');
  const [isSignedOff, setIsSignedOff] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSubmitPasswordModal, setShowSubmitPasswordModal] = useState(false);
  const [pendingSubmissionData, setPendingSubmissionData] = useState(null);
  const [initialFormData, setInitialFormData] = useState([]);

  // Update useEffect dependency to use initialData instead of propInitialData
  useEffect(() => {
    setInitialData(propInitialData);
  }, [propInitialData]);
  const { setHasUnsavedChanges, hasUnsavedChanges, setRefreshTrigger } = useContext(SharedContext);
  const { routerPush } = useUnsavedChanges(hasUnsavedChanges);

  // Build the columns for the DataSheetGrid, based on the field types
  const createColumns = useCallback((fields, isSignedOff) => {
    return fields.map(field => {
      let columnType;
      switch (field.fieldType) {
        case 'float':
          columnType = floatColumn;
          break;
        case 'date':
          columnType = {
            ...dateColumn,
          parseDate: (value) => value ? new Date(value) : null,
          formatDate: (date) => date ? date.toISOString().split('T')[0] : '',
          };
        break;
        case 'checkbox':
          columnType = checkboxColumn;
          break;
        case 'int':
          columnType = intColumn;
          break;
        default:
          columnType = textColumn;
      }
  
      return {
        ...keyColumn(field.fieldName, columnType),
        title: field.fieldName,
        minWidth: Math.max(100, maxLengths[field.fieldName] * 13),
        disabled: isSignedOff, // Disable all fields if the section is signed off
      };
    });
  }, []);

  // Calculate the maximum length of the field names and field values
  const maxLengths = initialData?.fields?.reduce((acc, field) => {
    const maxFieldLength = Math.max(
      field.fieldName.length,
      ...(Array.isArray(field.fieldValue) 
        ? field.fieldValue.map(value => String(value).length)
        : [String(field.fieldValue).length])
    );
    acc[field.fieldName] = maxFieldLength;
    return acc;
  }, {}) || {};

  /**
   * This useEffect is used to transform the initial data into a format that the DataSheetGrid can use.
   * It also sets the columns and formData state variables.
   */
  useEffect(() => {
    // Add null check at the start of useEffect
    if (!initialData?.fields) {
      setColumns([]);
      setFormData([]);
      setIsSignedOff(false);
      return;
    }

    // Calculate the maximum number of rows based on the field values(array)
    const rowCount = Math.max(
      ...initialData.fields
        .filter(field => Array.isArray(field.fieldValue))
        .map(field => field.fieldValue.length),
      1
    );

    // Check if the section is signed off
    const newIsSignedOff = initialData.signoffs && initialData.signoffs.length > 0;

    const newColumns = createColumns(initialData.fields, newIsSignedOff);

    /**
     * This code transforms the initial data into a format that the DataSheetGrid can use.
     * It creates a new row for each field value array and sets the field value for each row.
     * If the field value is a checkbox, it sets the field value to 'true' or 'false'.
     * If the field value is a date, it sets the field value to a Date object.
     * Otherwise, it sets the field value to the field value itself.
       */
    const transformedData = Array.from({ length: rowCount }, (_, rowIndex) => {
      const rowData = { id: `row_${rowIndex}` };
      initialData.fields.forEach(field => {
        if (field.fieldType === 'checkbox') {
          rowData[field.fieldName] = Array.isArray(field.fieldValue) 
            ? (field.fieldValue[rowIndex] === 'true' || field.fieldValue[rowIndex] === true)
            : (field.fieldValue === 'true' || field.fieldValue === true);
        } else if (field.fieldType === 'date') {
          const dateValue = Array.isArray(field.fieldValue) ? field.fieldValue[rowIndex] : field.fieldValue;
          rowData[field.fieldName] = dateValue ? new Date(dateValue) : null;
        } else {
          rowData[field.fieldName] = Array.isArray(field.fieldValue) 
            ? (field.fieldValue[rowIndex] ?? '')
            : (field.fieldValue ?? '');
        }
      });
      return rowData;
    });

    setColumns(newColumns);
    setFormData(transformedData);
    setInitialFormData(transformedData); // Store initial state
    setHasUnsavedChanges(false); // Reset changes flag
    setSectionDescription(initialData.sectionDescription || '');
    setIsSignedOff(newIsSignedOff);
  }, [initialData, createColumns, setHasUnsavedChanges]);

  // Add function to check for changes
  const handleDataChange = useCallback((newData) => {
    setFormData(newData);
    
    // Compare new data with initial data
    const hasDataChanged = JSON.stringify(newData) !== JSON.stringify(initialFormData);
    
    // Only update if the change state is different
    if (hasDataChanged !== hasUnsavedChanges) {
      setHasUnsavedChanges(hasDataChanged);
    }
  }, [initialFormData, setHasUnsavedChanges, hasUnsavedChanges]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const submissionData = initialData.fields.map(field => ({
      fieldName: field.fieldName,
      fieldType: field.fieldType,
      fieldValue: formData.map(row => {
        if (field.fieldType === 'checkbox') {
          return row[field.fieldName] ? 'true' : 'false';
        } else if (field.fieldType === 'date') {
          return row[field.fieldName] ? row[field.fieldName].toISOString().split('T')[0] : '';
        }
        return row[field.fieldName] || '';
      })
    }));

    setPendingSubmissionData(submissionData);
    setShowSubmitPasswordModal(true);
  };

  const handleSubmitPasswordVerify = async (password, comment) => {
    if (!password || !pendingSubmissionData) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        await onUpdate(pendingSubmissionData, 'In Progress');
        setShowSubmitPasswordModal(false);
        setHasUnsavedChanges(false); // Reset the shared context

        // Refresh the data
        const refreshResponse = await fetch(`/api/${templateName}/${batchRecordId}/${sectionName}`);
        if (refreshResponse.ok) {
          const refreshedData = await refreshResponse.json();
          
          // Always fetch the header data regardless of section
          const headerResponse = await fetch(`/api/${templateName}/${batchRecordId}/Header`);
          if (headerResponse.ok) {
            const headerData = await headerResponse.json();
            refreshedData.batchInfo = {
              fields: headerData.fields
            };
          }
          
          // Update the initialData state with the refreshed data
          setInitialData(refreshedData);
          
          // Transform the refreshed data into the correct format
          const rowCount = Math.max(
            ...refreshedData.fields
              .filter(field => Array.isArray(field.fieldValue))
              .map(field => field.fieldValue.length),
            1
          );

          const transformedData = Array.from({ length: rowCount }, (_, rowIndex) => {
            const rowData = { id: `row_${rowIndex}` };
            refreshedData.fields.forEach(field => {
              if (field.fieldType === 'checkbox') {
                rowData[field.fieldName] = Array.isArray(field.fieldValue) 
                  ? (field.fieldValue[rowIndex] === 'true' || field.fieldValue[rowIndex] === true)
                  : (field.fieldValue === 'true' || field.fieldValue === true);
              } else if (field.fieldType === 'date') {
                const dateValue = Array.isArray(field.fieldValue) ? field.fieldValue[rowIndex] : field.fieldValue;
                rowData[field.fieldName] = dateValue ? new Date(dateValue) : null;
              } else {
                rowData[field.fieldName] = Array.isArray(field.fieldValue) 
                  ? (field.fieldValue[rowIndex] ?? '')
                  : (field.fieldValue ?? '');
              }
            });
            return rowData;
          });

          // Update all necessary states with refreshed data
          setFormData(transformedData);
          setInitialFormData(transformedData);
          setHasUnsavedChanges(false);
          setRefreshTrigger(prev => prev + 1);
        }
      } else {
        alert('Password verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    } finally {
      setIsSubmitting(false);
      setPendingSubmissionData(null);
    }
  };

  const handleSignoff = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (password, comment) => {
    if (password) {
      try {
        const response = await fetch('/api/verify-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });

        if (response.ok) {
          await onSignoff(comment);
          setShowPasswordModal(false);

          // Add refresh logic here
          const refreshResponse = await fetch(`/api/${templateName}/${batchRecordId}/${sectionName}`);
          if (refreshResponse.ok) {
            const refreshedData = await refreshResponse.json();
            
            // Always fetch the header data regardless of section
            const headerResponse = await fetch(`/api/${templateName}/${batchRecordId}/Header`);
            if (headerResponse.ok) {
              const headerData = await headerResponse.json();
              refreshedData.batchInfo = {
                fields: headerData.fields
              };
            }
            
            // Update the initialData state with the refreshed data
            setInitialData(refreshedData);
            
            // Transform the refreshed data into the correct format
            const rowCount = Math.max(
              ...refreshedData.fields
                .filter(field => Array.isArray(field.fieldValue))
                .map(field => field.fieldValue.length),
              1
            );

            const transformedData = Array.from({ length: rowCount }, (_, rowIndex) => {
              const rowData = { id: `row_${rowIndex}` };
              refreshedData.fields.forEach(field => {
                if (field.fieldType === 'checkbox') {
                  rowData[field.fieldName] = Array.isArray(field.fieldValue) 
                    ? (field.fieldValue[rowIndex] === 'true' || field.fieldValue[rowIndex] === true)
                    : (field.fieldValue === 'true' || field.fieldValue === true);
                } else if (field.fieldType === 'date') {
                  const dateValue = Array.isArray(field.fieldValue) ? field.fieldValue[rowIndex] : field.fieldValue;
                  rowData[field.fieldName] = dateValue ? new Date(dateValue) : null;
                } else {
                  rowData[field.fieldName] = Array.isArray(field.fieldValue) 
                    ? (field.fieldValue[rowIndex] ?? '')
                    : (field.fieldValue ?? '');
                }
              });
              return rowData;
            });

            // Update all necessary states with refreshed data
            setFormData(transformedData);
            setInitialFormData(transformedData);
            setHasUnsavedChanges(false);
            setRefreshTrigger(prev => prev + 1);
          }
        } else {
          alert('Password verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Error verifying password:', error);
        alert('An error occurred while verifying your password. Please try again.');
      }
    } else {
      alert('Password is required for sign-off.');
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/${templateName}/${batchRecordId}/${sectionName}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate section');
      }

      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error duplicating section:', error);
      alert('Error duplicating section');
    }
  };

  const handleDelete = async () => {
    if (!initialData.isDuplicate) {
      alert('Cannot delete the main section');
      return;
    }
    
    try {
      const response = await fetch(`/api/${templateName}/${batchRecordId}/${sectionName}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete section');
      }

      // Navigate back to the main section using routerPush
      const mainSectionName = sectionName.split(' ')[0];
      routerPush(`/${templateName}/${batchRecordId}/${mainSectionName}`);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Error deleting section');
    }
  };

  // get field value from initialData
  const getHeaderFieldValue = (fieldName) => {
    if (!initialData?.batchInfo?.fields) return '';
    const field = initialData.batchInfo.fields.find(f => f.fieldName === fieldName);
    // Return the full value from the array
    return Array.isArray(field?.fieldValue) ? field.fieldValue[0] : field?.fieldValue || '';
  };

  if (columns.length === 0) {
    return <div>Loading...</div>; // Or any loading indicator
  }

  return (
    <main className="flex flex-col w-full h-full">

      {initialData.signoffs && initialData.signoffs.length > 0 && (
        <div className="mt-4 mb-4 p-4 bg-gray-100 rounded text-gray-500">
          <h3 className="font-bold">Sign-offs</h3>
          {initialData.signoffs.map((signoff, index) => (
            <div key={index} className="mb-2 pb-2 border-b last:border-b-0">
              <p>By: {signoff.signedBy}</p>
              <p>At: {new Date(signoff.signedAt).toLocaleString()}</p>
              {signoff.comment && (
                <p>Comment: {signoff.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Pass the header data from initialData */}
      <BatchRecordInfo
        family={getHeaderFieldValue('Family')}
        partPrefix={getHeaderFieldValue('Part Prefix')}
        partNumber={getHeaderFieldValue('Part Number')}
        lotNumber={getHeaderFieldValue('Lot Number')}
        documentNumber={getHeaderFieldValue('Document Number')}
        revision={getHeaderFieldValue('Revision')}
        date={getHeaderFieldValue('Date')}
        dateOfManufacture={getHeaderFieldValue('Date of Manufacture')}
        description={getHeaderFieldValue('Description')}
        />
        {sectionDescription && (
          <div className="mb-4 mt-6 p-3 bg-gray-500 rounded">
            <p className="text-base text-white whitespace-pre-line">{sectionDescription}</p>
          </div>
        )}
      
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        
        {/* DataSheetGrid */}
        <div className="flex-grow">
          <DataSheetGrid
            key={isSignedOff}
            value={formData}
            onChange={handleDataChange}
            columns={columns}
            height="100%"
            headerRowHeight={60}
            lockRows="true"
            className="batch-record-grid"
            style={{
              height: '100%',
              width: '100%'
            }}
          />
        </div>
        <div className="flex justify-between mt-4">
          <div className="flex gap-2">
            <button 
              type="submit" 
              className={`px-8 py-2 rounded ${
                isSubmitting || initialData.signoffs?.length > 0 || !hasUnsavedChanges
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-teal-300 hover:bg-teal-400'
              }`}
              disabled={isSubmitting || initialData.signoffs?.length > 0 || !hasUnsavedChanges}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button 
              type="button" 
              onClick={handleSignoff}
              className="px-8 py-2 rounded bg-blue-300 hover:bg-blue-400"
            >
              Sign Off
            </button>
          </div>
        </div>
      </form>
      
      {showPasswordModal && (
        <PasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handlePasswordSubmit}
          title="Confirm Sign-off"
        />
      )}
      
      {showSubmitPasswordModal && (
        <PasswordModal
          onClose={() => {
            setShowSubmitPasswordModal(false);
            setPendingSubmissionData(null);
          }}
          onSubmit={handleSubmitPasswordVerify}
          title="Confirm Submit"
        />
      )}
    </main>
  )
}

export default MainContent;
