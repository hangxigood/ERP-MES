'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from "../../../../../components/Header";
import { useSession } from "next-auth/react";
import Sidebar from "../../../../../components/Sidebar";
import { createContext } from 'react';

/**
 * Context for managing refresh state across components
 * @type {React.Context}
 */
export const RefreshContext = createContext();

/**
 * Context for sharing state between components
 * @type {React.Context}
 */
export const SharedContext = createContext();

/**
 * BatchRecordLayout Component
 * 
 * A layout component that provides the structure for batch record pages.
 * It manages the sidebar navigation, authentication state, and shared context
 * for child components.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render within the layout
 * 
 * @example
 * return (
 *   <BatchRecordLayout>
 *     <YourPageContent />
 *   </BatchRecordLayout>
 * )
 */
export default function BatchRecordLayout({ children }) {
  const { status } = useSession();
  const params = useParams();
  const templateName = params.templateName;
  const batchRecordId = params.batchRecordId;

  /**
   * State for managing available sections in the sidebar
   * @type {[Array, Function]}
   */
  const [availableSections, setAvailableSections] = useState([]);

  /**
   * State for triggering sidebar refresh
   * Incrementing this value will cause the sections to be refetched
   * @type {[number, Function]}
   */
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * State for tracking unsaved changes in the form
   * @type {[boolean, Function]}
   */
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * Fetches available sections when component mounts or when dependencies change
   * 
   * Dependencies:
   * - templateName: Current template name from URL
   * - batchRecordId: Current batch record ID from URL
   * - refreshTrigger: Manual refresh trigger
   * - status: Authentication status
   */
  useEffect(() => {
    // Don't fetch if still authenticating
    if (status === "loading") return;

    /**
     * Fetches and sorts sections from the API
     * @async
     * @function
     */
    const fetchSections = async () => {
      try {
        const response = await fetch(`/api/${templateName}/${batchRecordId}/sections`);
        if (!response.ok) {
          throw new Error('Failed to fetch sections');
        }
        const sectionsData = await response.json();
        // Sort sections by order property
        const sortedSections = sectionsData.sort((a, b) => a.order - b.order);
        setAvailableSections(sortedSections);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    // Only fetch if we have required parameters
    if (templateName && batchRecordId) {
      fetchSections();
    }
  }, [templateName, batchRecordId, refreshTrigger, status]);

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
