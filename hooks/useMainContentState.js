/**
 * @fileoverview Hook for managing the state and logic of the batch record form content.
 * Handles form data, submissions, password verification, and data refresh operations.
 * 
 * @module hooks/useMainContentState
 */

import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { SharedContext } from '../contexts/BatchRecordContext';
import { useColumns } from './useColumns';  // Updated import path
import { transformFormData, refreshFormData, transformSubmissionData } from '../utils/formDataTransformers';

/**
 * Custom hook for managing batch record form state and operations
 * 
 * @param {Object} props - The properties object
 * @param {Object} props.propInitialData - Initial data for the form
 * @param {Function} props.onUpdate - Callback function for form updates
 * @param {Function} props.onSignoff - Callback function for signing off
 * @param {string} props.sectionName - Name of the current section
 * @param {string} props.templateName - Name of the template
 * @param {string} props.batchRecordId - ID of the batch record
 * @returns {Object} State and handler functions for the form
 */
export function useMainContentState({
  propInitialData,
  onUpdate,
  onSignoff,
  sectionName,
  templateName,
  batchRecordId
}) {
  const [initialData, setInitialData] = useState(propInitialData);
  const [formData, setFormData] = useState([]);
  const [isSignedOff, setIsSignedOff] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSubmitPasswordModal, setShowSubmitPasswordModal] = useState(false);
  const [initialFormData, setInitialFormData] = useState([]);

  const { setHasUnsavedChanges, hasUnsavedChanges, setRefreshTrigger } = useContext(SharedContext);

  const columns = useColumns(initialData?.fields, isSignedOff);
  const sectionDescription = initialData?.sectionDescription || '';

  useEffect(() => {
    setInitialData(propInitialData);
  }, [propInitialData]);

  // Update form data and check for unsaved changes
  useEffect(() => {
    if (!initialData?.fields) {
      setFormData([]);
      setIsSignedOff(false);
      return;
    }

    const transformedData = transformFormData(initialData);
    setFormData(transformedData);
    setInitialFormData(transformedData);
    setHasUnsavedChanges(false);
    setIsSignedOff(Boolean(initialData.signoffs?.length));
  }, [initialData]);

  /**
   * Handle form data changes and check for unsaved changes
   * 
   * @param {Array} newData - Updated form data
   * @returns {void}
   */
  const handleDataChange = useCallback((newData) => {
    // Validate input
    if (!newData || !Array.isArray(newData)) {
        return;
    }

    // Update form data immediately
    setFormData(newData);

    // Skip change detection if already marked as changed
    if (hasUnsavedChanges) {
        return;
    }

    // Quick length comparison first
    if (newData.length !== initialFormData.length) {
        setHasUnsavedChanges(true);
        return;
    }

    // Efficient field-by-field comparison
    const hasChanges = newData.some((row, index) => {
        const initialRow = initialFormData[index];
        return Object.keys(row).some(key => row[key] !== initialRow[key]);
    });

    if (hasChanges) {
        setHasUnsavedChanges(true);
    }
    }, [initialFormData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = transformSubmissionData(initialData.fields, formData);
    setShowSubmitPasswordModal(true);
    handleSubmitPasswordVerify.current = async (password) => {
      try {
        const response = await fetch('/api/verify-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });

        if (response.ok) {
          await onUpdate(submissionData, 'In Progress');
          setShowSubmitPasswordModal(false);
          setHasUnsavedChanges(false);
          await refreshData();
        } else {
          alert('Password verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('Error submitting form');
      }
    };
  };

  const refreshData = async () => {
    const refreshResponse = await fetch(`/api/${templateName}/${batchRecordId}/${sectionName}`);
    if (refreshResponse.ok) {
      const refreshedData = await refreshResponse.json();
      const headerResponse = await fetch(`/api/${templateName}/${batchRecordId}/Header`);
      if (headerResponse.ok) {
        const headerData = await headerResponse.json();
        refreshedData.batchInfo = { fields: headerData.fields };
      }
      setInitialData(refreshedData);
      const transformedData = refreshFormData(refreshedData);
      setFormData(transformedData);
      setInitialFormData(transformedData);
      setHasUnsavedChanges(false);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleSubmitPasswordVerify = useRef(null);

  const handleSignoff = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (password, comment) => {
    if (password) {
      try {
        const response = await fetch('/api/verify-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });

        if (response.ok) {
          await onSignoff(comment);
          setShowPasswordModal(false);

          const refreshResponse = await fetch(`/api/${templateName}/${batchRecordId}/${sectionName}`);
          if (refreshResponse.ok) {
            const refreshedData = await refreshResponse.json();
            const headerResponse = await fetch(`/api/${templateName}/${batchRecordId}/Header`);
            if (headerResponse.ok) {
              const headerData = await headerResponse.json();
              refreshedData.batchInfo = {
                fields: headerData.fields
              };
            }
            setInitialData(refreshedData);
            const transformedData = refreshFormData(refreshedData);
            setFormData(transformedData);
            setInitialFormData(transformedData);
            setHasUnsavedChanges(false);
            setRefreshTrigger(prev => prev + 1);
          }
        } else {
          alert('Password verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Error verifying password:', error);
        alert('An error occurred while verifying your password. Please try again.');
      }
    } else {
      alert('Password is required for sign-off.');
    }
  };

  const getHeaderFieldValue = (fieldName) => {
    if (!initialData?.batchInfo?.fields) return '';
    const field = initialData.batchInfo.fields.find(f => f.fieldName === fieldName);
    return Array.isArray(field?.fieldValue) ? field.fieldValue[0] : field?.fieldValue || '';
  };

  return {
    formData,
    initialData,
    columns,
    sectionDescription,
    isSignedOff,
    showPasswordModal,
    showSubmitPasswordModal,
    handleSubmitPasswordVerify: handleSubmitPasswordVerify.current,
    handleDataChange,
    handleSubmit,
    handleSignoff,
    handlePasswordSubmit,
    getHeaderFieldValue,
    setShowPasswordModal,
    setShowSubmitPasswordModal,
    hasUnsavedChanges
  };
}