'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DataSheetGrid, keyColumn, textColumn } from 'react-datasheet-grid';

const MainContent = ({ initialData, onUpdate }) => {
  const [formData, setFormData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData?.fields) {
      const rowCount = Math.max(
        ...initialData.fields
          .filter(field => Array.isArray(field.fieldValue))
          .map(field => field.fieldValue.length),
        1
      );

      let transformedData;

      if (rowCount >= 3) {
        transformedData = Array.from({ length: rowCount }, (_, rowIndex) => {
          const rowData = { id: `row_${rowIndex}` };
          initialData.fields.forEach(field => {
            rowData[field.fieldName] = Array.isArray(field.fieldValue)
              ? (field.fieldValue[rowIndex] || '')
              : field.fieldValue || '';
          });
          return rowData;
        });
      } else {
        transformedData = initialData.fields.map(field => ({
          fieldName: field.fieldName,
          fieldValue: Array.isArray(field.fieldValue) ? field.fieldValue.join(', ') : field.fieldValue || ''
        }));
      }

      setFormData(transformedData);
    } else {
      setFormData([]);
    }
  }, [initialData]);

  const columns = useMemo(() => {
    if (formData.length === 0) return [];

    if ('fieldName' in formData[0]) {
      // Case for less than 3 rows
      return [
        { ...keyColumn('fieldName', textColumn), title: 'Field Name', disabled: true },
        { ...keyColumn('fieldValue', textColumn), title: 'Field Value' },
      ];
    } else {
      // Case for 3 or more rows
      return Object.keys(formData[0])
        .filter(key => key !== 'id')
        .map(key => ({
          ...keyColumn(key, textColumn),
          title: key,
        }));
    }
  }, [formData]);

  console.log('columns', columns);
  console.log('formData', formData);

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
          key={JSON.stringify(formData)} 
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