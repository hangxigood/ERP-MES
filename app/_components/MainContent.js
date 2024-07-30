'use client';

import React, { useState } from 'react';

// Function to get the current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MainContent = () => {
  const [formData, setFormData] = useState({
    name: 'OXY BATCH RECORD',
    documentNumber: 'DO1862',
    revision: '4',
    date: getCurrentDate(),
    family: '​​Oxy ETCO2 (2.0)​',
    partPrefix: '​​SMI2/​',
    partNumber: '​​OM-2125-14SLM​',
    description: "OxyMask II Adult EtCO2 14', SLM 15'",
    lotNumber: '',
    manufactureDate: 'DO1862',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/submitForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
    

      const result = await response.json();
      if (response.ok) {
        alert('Form submitted successfully!');
      } else {
        alert('Error submitting form: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    }
  };

  return (
    <main className="flex flex-col ml-5 w-full">
      <form onSubmit={handleSubmit} className="flex flex-col mt-10">
        <div className="flex flex-col mb-4">
          <label className="mb-1 font-semibold text-gray-700" htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border rounded px-2 py-1 text-black"
          />
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-1 font-semibold text-gray-700" htmlFor="documentNumber">Document Number:</label>
          <input
            id="documentNumber"
            type="text"
            name="documentNumber"
            value={formData.documentNumber}
            onChange={handleChange}
            className="border rounded px-2 py-1 text-black"
          />
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-1 font-semibold text-gray-700" htmlFor="revision">Revision:</label>
          <input
            id="revision"
            type="text"
            name="revision"
            value={formData.revision}
            onChange={handleChange}
            className="border rounded px-2 py-1 text-black"
          />
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-1 font-semibold text-gray-700" htmlFor="date">Date:</label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            readOnly
            onChange={handleChange}
            className="border rounded px-2 py-1 text-black"
          />
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-1 font-semibold text-gray-700" htmlFor="family">Family:</label>
          <input
            id="family"
            type="text"
            name="family"
            value={formData.family}
            onChange={handleChange}
            className="border rounded px-2 py-1 text-black"
          />
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-1 font-semibold text-gray-700" htmlFor="partPrefix">Part Prefix:</label>
          <input
            id="partPrefix"
            type="text"
            name="partPrefix"
            value={formData.partPrefix}
            onChange={handleChange}
            className="border rounded px-2 py-1 text-black"
          />
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-1 font-semibold text-gray-700" htmlFor="partNumber">Part Number:</label>
          <input
            id="partNumber"
            type="text"
            name="partNumber"
            value={formData.partNumber}
            onChange={handleChange}
            className="border rounded px-2 py-1 text-black"
          />
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-1 font-semibold text-gray-700" htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="border rounded px-2 py-1 text-black"
          />
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-1 font-semibold text-gray-700" htmlFor="lotNumber">Lot Number:</label>
          <input
            id="lotNumber"
            type="text"
            name="lotNumber"
            value={formData.lotNumber}
            onChange={handleChange}
            className="border rounded px-2 py-1 text-black"
          />
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-1 font-semibold text-gray-700" htmlFor="manufactureDate">Date of Manufacture:</label>
          <input
            id="manufactureDate"
            type="text"
            name="manufactureDate"
            value={formData.manufactureDate}
            onChange={handleChange}
            className="border rounded px-2 py-1 text-black"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-16 py-4 bg-teal-300 rounded">NEXT - Line Clearance</button>
      </div>
      </form>
    </main>
  );
};

export default MainContent;
