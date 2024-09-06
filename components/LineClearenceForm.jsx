'use client'

import React, { useState, useEffect } from 'react';

const LineClearanceForm = ({ batchId }) => {
  const [formData, setFormData] = useState({
    productionLineCleared: false,
    singleLot: false,
    equipmentCleaned: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/line-clearence/${batchId}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setFormData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [batchId]);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Form Data:", formData);
      const response = await fetch(`/api/line-clearence/${batchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to save data');
      alert('Line clearance form saved successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Line Clearance Form</h2>
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="productionLineCleared"
              checked={formData.productionLineCleared}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700">The production line has been cleared of any/all parts or components not specified in the BOM</span>
          </label>
        </div>
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="singleLot"
              checked={formData.singleLot}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700">There is only a SINGLE lot of any component present on the line</span>
          </label>
        </div>
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="equipmentCleaned"
              checked={formData.equipmentCleaned}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700">All working surfaces and equipment have been wiped down with 70% isopropyl alcohol and wipes. Daily operator duties will continue as per WI0002C.</span>
          </label>
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Save Line Clearance
        </button>
      </form>
    </div>
  );
};

export default LineClearanceForm;
