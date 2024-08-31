'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

const MainContent = ({ initialData, mode = 'create', batchId = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const buttonText = mode === 'create' ? 'Create' : 'Update';
  
  // default form data
  const defaultFormData = {
    name: 'OXY BATCH RECORD',
    documentNumber: 'DO1862',
    revision: '4',
    date: getCurrentDate(),
    family: 'Oxy ETCO2 (2.0)',
    partPrefix: 'SMI2/',
    partNumber: 'OM-2125-14SLM',
    description: "OxyMask II Adult EtCO2 14', SLM 15'",
    lotNumber: '',
    manufactureDate: getCurrentDate(),
  };

  const [formData, setFormData] = useState(mode === 'create' ? defaultFormData : initialData || {});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
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
        {Object.entries(formData)
          .filter(([key]) => key in defaultFormData)
          .map(([key, value]) => (
            <div key={key} className="flex flex-col mb-4">
              <label className="mb-1 font-semibold text-gray-700" htmlFor={key}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}:
              </label>
              {key === 'description' ? (
                <textarea
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 text-black"
                />
              ) : (
                <input
                  id={key}
                  type={key === 'date' || key === 'manufactureDate' ? 'date' : 'text'}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 text-black"
                  readOnly={key === 'date'}
                />
              )}
            </div>
          ))}
        <div className="flex justify-end">
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