'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";
import { createContext, useContext } from 'react';

// Create a context for the refresh state
export const RefreshContext = createContext();

export default function BatchRecordLayout({ children }) {
  const params = useParams();
  const templateName = params.templateName;
  const batchRecordId = params.batchRecordId;

  const [availableSections, setAvailableSections] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`/api/${templateName}/${batchRecordId}/sections`);
        if (!response.ok) {
          throw new Error('Failed to fetch sections');
        }
        const sectionsData = await response.json();
        setAvailableSections(sectionsData);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    if (templateName && batchRecordId) {
      fetchSections();
    }
  }, [session, status, router, templateName, batchRecordId, refreshTrigger]);

  return (
    <RefreshContext.Provider value={{ refreshTrigger, setRefreshTrigger }}>
      <div className="flex flex-col min-h-screen">
        <Header title={`BATCH RECORD: ${decodeURIComponent(templateName)}`} />
        <div className="flex flex-1">
          <Sidebar availableSections={availableSections} />
            <main className="flex-grow p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </RefreshContext.Provider>
  );
}
