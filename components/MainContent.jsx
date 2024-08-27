'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

const MainContent = ({buttonText}) => {
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!session || !session.user || !session.user.id) {
      alert('You must be logged in to create a batch record.');
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        createdById: session.user.id,
        updatedById: session.user.id,
      };

      const response = await fetch('/api/batchRecords?action=createBatchRecord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
    
      const result = await response.json();
      if (response.ok) {
        alert('Batch record created successfully!');
        // Optionally reset form or redirect user
      } else {
        alert('Error creating batch record: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating batch record:', error);
      alert('Error creating batch record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col ml-5 w-full">
      <form onSubmit={handleSubmit} className="flex flex-col mt-10">
        {Object.entries(formData).map(([key, value]) => (
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