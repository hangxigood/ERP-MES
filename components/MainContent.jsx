'use client';

import React, { useState, useEffect } from 'react';
import { DataSheetGrid, keyColumn, textColumn } from 'react-datasheet-grid';

const MainContent = ({ initialData, onUpdate }) => {
  // State to hold the transformed form data
  const [formData, setFormData] = useState([]);
  // State to track form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('Initial Data:', initialData); // Log the initial data for debugging

    // Check if initialData and its fields property exist and fields is an array
    if (initialData && initialData.fields && Array.isArray(initialData.fields)) {
      // Find the first field that has an array as its fieldValue
      const fieldWithArrayValue = initialData.fields.find(field => Array.isArray(field.fieldValue));
      
      if (fieldWithArrayValue) {
        // If we found a field with an array value, use its length to determine the number of rows
        const rowCount = fieldWithArrayValue.fieldValue.length;
        
        // Create an array of row objects
        const transformedData = Array.from({ length: rowCount }, (_, rowIndex) => {
          const rowData = {};
          // For each field, add its value to the row object
          initialData.fields.forEach(field => {
            rowData[field.fieldName] = Array.isArray(field.fieldValue) 
              ? (field.fieldValue[rowIndex] || '') // Use the value at this index if it exists, otherwise empty string
              : field.fieldValue || ''; // If not an array, use the single value or empty string
          });
          return rowData;
        });
        
        // Update the state with the transformed data
        setFormData(transformedData);
      } else {
        // If no field has an array value, exchange row and column
        const transformedData = [
          initialData.fields.reduce((acc, field) => {
            acc[field.fieldName] = field.fieldValue || '';
            return acc;
          }, {})
        ];
        setFormData(transformedData);
      }
    }
    console.log('Form Data:', formData);
  }, [initialData]); // Re-run this effect if initialData changes

  // Create column definitions for the DataSheetGrid
  const columns = initialData?.fields?.map(field => ({
    ...keyColumn(field.fieldName, textColumn),
    title: field.fieldName,
  })) || [];

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

  return (
    <main className="flex flex-col w-full">
      <form onSubmit={handleSubmit} className="flex flex-col mt-10">
        <DataSheetGrid
          height={900}
          headerRowHeight={90}
          value={formData}
          onChange={setFormData}
          columns={columns}
          lockRows
        />
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