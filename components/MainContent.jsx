'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DataSheetGrid, keyColumn, textColumn, dateColumn } from 'react-datasheet-grid';

const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

const MainContent = ({ initialData, mode = 'create', batchId = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const buttonText = mode === 'create' ? 'Create' : 'Update';
  
  // default form data
  const defaultFormData = [
    { field: 'name', value: 'OXY BATCH RECORD' },
    { field: 'documentNumber', value: 'DO1862' },
    { field: 'revision', value: '4' },
    { field: 'date', value: getCurrentDate() },
    { field: 'family', value: 'Oxy ETCO2 (2.0)' },
    { field: 'partPrefix', value: 'SMI2/' },
    { field: 'partNumber', value: 'OM-2125-14SLM' },
    { field: 'description', value: "OxyMask II Adult EtCO2 14', SLM 15'" },
    { field: 'lotNumber', value: '' },
    { field: 'manufactureDate', value: getCurrentDate() },
  ];

  const [formData, setFormData] = useState(
    mode === 'create' 
      ? defaultFormData 
      : initialData 
        ? Object.entries(initialData).map(([field, value]) => ({ field, value }))
        : []
  );

  useEffect(() => {
    if (initialData) {
      setFormData(Object.entries(initialData).map(([field, value]) => ({ field, value })));
    }
  }, [initialData]);

  const columns = [
    { ...keyColumn('field', textColumn), title: 'Field', disabled: true },
    { ...keyColumn('value', textColumn), title: 'Value' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const submissionData = {
        ...Object.fromEntries(formData.map(item => [item.field, item.value])),
        updatedById: session.user.id,
      };

      if (mode === 'create') {
        submissionData.createdById = session.user.id;
      }

      const url = mode === 'create' ? '/api/batch-record' : `/api/batch-record/${batchId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/batch-record/${result.id}`);
      } else {
        const errorData = await response.json();
        alert('Error: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col ml-5 w-full">
      <form onSubmit={handleSubmit} className="flex flex-col mt-10">
        <DataSheetGrid
          value={formData}
          onChange={setFormData}
          columns={columns}
          lockRows
          disableExpandSelection
        />
        <div className="flex justify-end mt-4">
          <button 
            type="submit" 
            className={`px-16 py-4 rounded ${isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-teal-300'}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : buttonText}
          </button>
        </div>
      </form>
    </main>
  );
};

export default MainContent;