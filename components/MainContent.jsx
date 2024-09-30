'use client';

import React, { useState, useEffect } from 'react';
import { DataSheetGrid, keyColumn, textColumn, floatColumn, dateColumn } from 'react-datasheet-grid';

const MainContent = ({ initialData, onUpdate }) => {
  // State to hold the transformed form data
  const [formData, setFormData] = useState([]);
  // State to track form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (initialData?.fields) {
      // Find the maximum length of any array field value
      const rowCount = Math.max(
        ...initialData.fields
          .filter(field => Array.isArray(field.fieldValue))
          .map(field => field.fieldValue.length),
        1 // Ensure at least one row if no array fields
      );

      let transformedData;
      let newColumns;

      if (rowCount >= 3) {
        // Calculate max length for each field
        const maxLengths = initialData.fields.reduce((acc, field) => {
          const maxFieldLength = Math.max(
            field.fieldName.length,
            ...field.fieldValue.map(value => String(value).length)
          );
          acc[field.fieldName] = maxFieldLength;
          return acc;
        }, {});

        console.log("maxLengths", initialData.fields.map(field => maxLengths[field.fieldName]));

        // Create columns with adjusted minWidth and proper formatting
        newColumns = initialData.fields.map(field => {
          let columnType = textColumn;
          if (field.fieldName === 'Quantity' || field.fieldName === 'Lot Qty. Used' || field.fieldName === 'Scrap Qty.(must be identified by lot)') {
            columnType = floatColumn;
          } else if (field.fieldName === 'Date') {
            columnType = dateColumn;
          }

          return {
            ...keyColumn(field.fieldName, columnType),
            title: field.fieldName,
            minWidth: Math.max(100, maxLengths[field.fieldName] * 13), // Adjust multiplier as needed
          };
        });

        // Create an array of row objects
        transformedData = Array.from({ length: rowCount }, (_, rowIndex) => {
          const rowData = {
            id: `row_${rowIndex}` // Add a unique id to each row
          };
          // For each field, add its value to the row object
        initialData.fields.forEach(field => {
          rowData[field.fieldName] = Array.isArray(field.fieldValue) 
            ? (field.fieldValue[rowIndex] || '') // Use the value at this index if it exists, otherwise empty string
            : field.fieldValue || ''; // If not an array, use the single value or empty string
        });
          return rowData;
        }); 
      } else {
        // For less than 3 rows, adjust minWidth for fieldName and fieldValue individually
        const maxFieldNameLength = Math.max(...initialData.fields.map(f => f.fieldName.length));
        
        const fieldValueLengths = initialData.fields.map(f => 
          Array.isArray(f.fieldValue) 
            ? Math.max(...f.fieldValue.map(v => String(v).length))
            : String(f.fieldValue).length
        );
        const maxFieldValueLength = Math.max(...fieldValueLengths);

        newColumns = [
          { 
            ...keyColumn('fieldName', textColumn), 
            title: 'Field Name', 
            disabled: true,
            minWidth: maxFieldNameLength,
          },
          { 
            ...keyColumn('fieldValue', textColumn), 
            title: 'Field Value',
            minWidth: maxFieldValueLength,
          },
        ];

        transformedData = initialData.fields.map(field => ({
          fieldName: field.fieldName,
          fieldValue: Array.isArray(field.fieldValue) ? field.fieldValue.join(', ') : field.fieldValue || ''
        }));
      }

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
      // Transform the data back to the original structure before submitting
      const submissionData = initialData.fields.map(field => ({
        fieldName: field.fieldName,
        fieldValue: formData.map(row => row[field.fieldName] || '')
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
    <main className="flex flex-col w-full h-screen"> {/* Add h-screen */}
      <form onSubmit={handleSubmit} className="flex flex-col mt-10 h-full overflow-hidden"> {/* Add h-full and overflow-hidden */}
        <div className="flex-grow overflow-auto"> {/* Add this wrapper div */}
          <DataSheetGrid
            height={600}
            headerRowHeight={90}
            value={formData}
            onChange={setFormData}
            columns={columns}
          />
        </div>
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