'use client';

import React, { useState, useEffect } from 'react';
import { DataSheetGrid, keyColumn, textColumn, floatColumn, intColumn, dateColumn, checkboxColumn } from 'react-datasheet-grid';

const MainContent = ({ initialData, onUpdate }) => {
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
      setIntroText([]);
      setSectionDescription('');
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

  if (columns.length === 0) {
    return <div>Loading...</div>; // Or any loading indicator
  }

  return (
    <main className="flex flex-col w-full h-full">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        
        {/* DataSheetGrid */}
        <div className="flex-grow">
          <DataSheetGrid
            value={formData}
            onChange={setFormData}
            columns={columns}
            height="100%"
            headerRowHeight={90}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-4">
          <button 
            type="submit" 
            className={`px-8 py-2 rounded ${isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-teal-300'}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default MainContent;
