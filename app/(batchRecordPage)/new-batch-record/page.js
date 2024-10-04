'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Header from "../../../components/Header";

export default function BatchRecordSystem() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templateNames, setTemplateNames] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    fetchTemplateNames();
  }, []);

  const fetchTemplateNames = async () => {
    try {
      const response = await fetch('/api/template-names');
      const data = await response.json();
      setTemplateNames(data);
    } catch (error) {
      console.error('Error fetching template names:', error);
    }
  };

  const handleTemplateSelect = (e) => {
    setSelectedTemplate(e.target.value);
  };

  const handleCreateBatchRecord = async () => {
    if (!selectedTemplate) {
      alert('Please select a template');
      return;
    }

    try {
      const response = await fetch(`/api/${selectedTemplate}/new-batch-record`, {
        method: 'POST',
      });
      const data = await response.json();
      
      // Redirect to the new batch record page
      router.push(`/${selectedTemplate}/${data.batchRecordId}`);
    } catch (error) {
      console.error('Error creating batch record:', error);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'LABELING')) {
    return <div className="text-red-500 font-bold text-center mt-4">Access Denied: You are not authorized to access this page</div>;
  }

  return (
    <div className="flex flex-col bg-white">
      <Header title="NEW BATCH RECORD" />
      <div className="self-center w-full max-w-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">Select a Template</h2>
        <select 
          className="w-full p-2 border rounded mb-4 text-black"
          value={selectedTemplate}
          onChange={handleTemplateSelect}
        >
          <option value="">Choose a template</option>
          {templateNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleCreateBatchRecord}
        >
          Create Batch Record
        </button>
      </div>
    </div>
  );
}