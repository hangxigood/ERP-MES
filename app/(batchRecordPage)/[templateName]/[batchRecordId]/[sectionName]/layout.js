'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from "../../../../../components/Header";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Sidebar from "../../../../../components/Sidebar";
import { createContext } from 'react';

// Create a context for the refresh state
export const RefreshContext = createContext();

// Create a context for the shared state
export const SharedContext = createContext();

export default function BatchRecordLayout({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const params = useParams();
  const templateName = params.templateName;
  const batchRecordId = params.batchRecordId;
  const [availableSections, setAvailableSections] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    const fetchSections = async () => {
      try {
        const response = await fetch(`/api/${templateName}/${batchRecordId}/sections`);
        if (!response.ok) {
          throw new Error('Failed to fetch sections');
        }
        const sectionsData = await response.json();
        // Sort the sections based on the order field
        const sortedSections = sectionsData.sort((a, b) => a.order - b.order);
        setAvailableSections(sortedSections);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    if (templateName && batchRecordId) {
      fetchSections();
    }
  }, [session, status, router, templateName, batchRecordId, refreshTrigger]);

  return (
    <SharedContext.Provider value={{ 
      refreshTrigger, 
      setRefreshTrigger,
      hasUnsavedChanges,
      setHasUnsavedChanges 
    }}>
      <div className="flex flex-col min-h-screen">
        <Header title={`BATCH RECORD: ${decodeURIComponent(templateName)}`} />
        <div className="flex flex-1">
          <Sidebar availableSections={availableSections} />
          <main className="flex-grow p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SharedContext.Provider>
  );
}
