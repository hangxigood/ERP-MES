'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataSheetGrid, keyColumn, textColumn, floatColumn, intColumn, dateColumn, checkboxColumn } from 'react-datasheet-grid';
import PasswordModal from './PasswordModal';
import { useContext } from 'react';
import { RefreshContext } from '../app/(batchRecordPage)/[templateName]/[batchRecordId]/[sectionName]/layout';
import { useRouter } from 'next/navigation';

const MainContent = ({ initialData, batchRecordId, templateName, sectionName, onUpdate, onSignoff }) => {
  // State to hold the transformed form data
  const [formData, setFormData] = useState([]);
  // State to track form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [columns, setColumns] = useState([]);
  const [sectionDescription, setSectionDescription] = useState('');
  const [isSignedOff, setIsSignedOff] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { setRefreshTrigger } = useContext(RefreshContext);
  const router = useRouter();

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
  const maxLengths = initialData.fields.reduce((acc, field) => {
    const maxFieldLength = Math.max(
      field.fieldName.length,
      ...(Array.isArray(field.fieldValue) 
        ? field.fieldValue.map(value => String(value).length)
        : [String(field.fieldValue).length])
    );
    acc[field.fieldName] = maxFieldLength;
    return acc;
  }, {});

  /**
   * This useEffect is used to transform the initial data into a format that the DataSheetGrid can use.
   * It also sets the columns and formData state variables.
   */
  useEffect(() => {
   
    if (initialData?.fields) {
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

      // Set the section description directly
      setSectionDescription(initialData.sectionDescription || '');

      // Check if the section is signed off
      setIsSignedOff(newIsSignedOff);
    } else {
      setColumns([]);
      setFormData([]);
      setIsSignedOff(false);
    }
  }, [initialData, createColumns]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);

    try {
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
      await onUpdate(submissionData, 'submitted');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    } finally {
      setIsSubmitting(false);
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
          // Trigger a refresh of the sidebar
          setRefreshTrigger(prev => prev + 1);
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
    if (!initialData.isDuplicate) return;
    
    try {
      const response = await fetch(`/api/${templateName}/${batchRecordId}/${sectionName}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete section');
      }

      router.back();
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Error deleting section');
    }
  };

  if (columns.length === 0) {
    return <div>Loading...</div>; // Or any loading indicator
  }

  return (
    <main className="flex flex-col w-full h-full">
      {sectionDescription && (
        <div className="mb-4 p-3 bg-gray-500 rounded">
          <p className="text-base text-white whitespace-pre-line">{sectionDescription}</p>
        </div>
      )}
      {initialData.signoffs && initialData.signoffs.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded text-gray-500">
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
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        
        {/* DataSheetGrid */}
        <div className="flex-grow">
          <DataSheetGrid
            key={isSignedOff}
            value={formData}
            onChange={setFormData}
            columns={columns}
            height="100%"
            headerRowHeight={90}
            lockRows={isSignedOff}
          />
        </div>
        <div className="flex justify-between mt-4">
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={handleDuplicate}
              className="px-4 py-2 rounded bg-teal-300 hover:bg-teal-400"
            >
              +
            </button>
            <button 
              type="button"
              onClick={handleDelete}
              disabled={!initialData.isDuplicate}
              className={`px-4 py-2 rounded ${
                initialData.isDuplicate 
                  ? 'bg-red-300 hover:bg-red-400' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              -
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              className={`px-8 py-2 rounded ${
                isSubmitting || initialData.signoffs?.length > 0 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-teal-300 hover:bg-teal-400'
              }`}
              disabled={isSubmitting || initialData.signoffs?.length > 0}
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
        />
      )}
    </main>
  )
}

export default MainContent;
