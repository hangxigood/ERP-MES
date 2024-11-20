'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Header from "../../../../../components/Header";
import { useSession } from "next-auth/react";
import Sidebar from "../../../../../components/Sidebar";
import EditHistorySidebar from "../../../../../components/EditHistorySidebar";
import { SharedContext } from '../../../../../contexts/BatchRecordContext';

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
   * State for managing the visibility of the history sidebar
   * @type {[boolean, Function]}
   */
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

  // Add keyboard shortcut handler
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Escape' && isHistoryOpen) {
      setIsHistoryOpen(false);
    }
    // Optional: Add Ctrl/Cmd + H to toggle
    if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
      event.preventDefault();
      setIsHistoryOpen(prev => !prev);
    }
  }, [isHistoryOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <SharedContext.Provider value={{ 
      refreshTrigger, 
      setRefreshTrigger,
      hasUnsavedChanges,
      setHasUnsavedChanges 
    }}>
      <div className="flex flex-col min-h-screen">
        <Header title={`BATCH RECORD: ${decodeURIComponent(templateName)}`} />
        <div className="flex flex-1 relative">
          <Sidebar availableSections={availableSections} />
          <main className="flex-grow p-6 overflow-auto">
            {children}
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-2 py-4 rounded-l-md hover:bg-blue-600"
              title={`${isHistoryOpen ? 'Hide' : 'Show'} History (Ctrl+H)`}
            >
              {isHistoryOpen ? '>' : '<'}
            </button>
          </main>
          <EditHistorySidebar
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            templateName={templateName}
            batchRecordId={batchRecordId}
            sectionName={params.sectionName}
          />
        </div>
      </div>
    </SharedContext.Provider>
  );
}
