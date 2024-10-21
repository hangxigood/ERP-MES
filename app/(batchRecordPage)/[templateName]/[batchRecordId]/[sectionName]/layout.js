'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";
import { createContext, useContext } from 'react';

// Create a context for the refresh state
export const RefreshContext = createContext();

export default function BatchRecordLayout({ children, params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sections, setSections] = useState([]);
  const { templateName, batchRecordId } = params;
  const decodedTemplateName = decodeURIComponent(templateName);
  const decodedBatchRecordId = decodeURIComponent(batchRecordId);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (status === "loading") return;

    const fetchSections = async () => {
      try {
        const response = await fetch(`/api/${decodedTemplateName}/${decodedBatchRecordId}/sections`);
        if (!response.ok) {
          throw new Error('Failed to fetch sections');
        }
        const sectionsData = await response.json();
        setSections(sectionsData);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    fetchSections();
  }, [session, status, router, templateName, batchRecordId, refreshTrigger]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <RefreshContext.Provider value={{ refreshTrigger, setRefreshTrigger }}>
      <div className="flex flex-col min-h-screen bg-white">
        <Header title={`BATCH RECORD: ${decodeURIComponent(templateName)}`} />
        <div className="flex flex-1">
          <Sidebar availableSections={sections} />
          {/* after adding overflow-hidden, the shaking is gone */}
          <main className="flex-grow p-6 overflow-hidden"> 
            {children}
          </main>
        </div>
      </div>
    </RefreshContext.Provider>
  );
}
