'use client';

import React, { useState, useEffect } from 'react';
import { DataSheetGrid, keyColumn, textColumn, floatColumn, intColumn, dateColumn, checkboxColumn } from 'react-datasheet-grid';

const MainContent = ({ initialData, onUpdate, onSignoff }) => {
  // State to hold the transformed form data
  const [formData, setFormData] = useState([]);
  // State to track form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (initialData?.fields) {
      const rowCount = Math.max(
        ...initialData.fields
          .filter(field => Array.isArray(field.fieldValue))
          .map(field => field.fieldValue.length),
        1
      );

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

      const newColumns = initialData.fields.map(field => {
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
        };
      });

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
    } else {
      setColumns([]);
      setFormData([]);
    }
  }, [initialData]);

  console.log(columns);

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

  const handleSignoff = async () => {
    const comment = prompt("Enter a comment for this sign-off (optional):");
    await onSignoff(comment);
  };

  if (columns.length === 0) {
    return <div>Loading...</div>; // Or any loading indicator
  }

  return (
    <main className="flex flex-col w-full h-full">
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
        <div className="flex-grow">
          <DataSheetGrid
            value={formData}
            onChange={setFormData}
            columns={columns}
            height="100%"
            headerRowHeight={90}
          />
        </div>
        <div className="flex justify-between mt-4">
          <button 
            type="submit" 
            className={`px-8 py-2 rounded ${isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-teal-300'}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button 
            type="button" 
            onClick={handleSignoff}
            className="px-8 py-2 rounded bg-blue-300"
          >
            Sign Off
          </button>
        </div>
      </form>
    </main>
  );
};

export default MainContent;
