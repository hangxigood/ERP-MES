/**
 * @fileoverview Main form component for batch record data entry and management.
 * Handles form display, data grid, and interactions with password verification.
 * 
 * @module components/MainContent
 */

'use client';

import React from 'react';
import { DataSheetGrid } from 'react-datasheet-grid';
import PasswordModal from './PasswordModal';
import BatchRecordInfo from './BatchRecordInfo';
import { useMainContentState } from '../hooks/useMainContentState';
import { SignoffsList } from './SignoffsList';
import { ActionButtons } from './ActionButtons';

/**
 * Main content component for batch record form
 * 
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial form data
 * @param {Function} props.onUpdate - Handler for form updates
 * @param {Function} props.onSignoff - Handler for sign-offs
 * @param {string} props.sectionName - Current section name
 * @param {string} props.templateName - Template name
 * @param {string} props.batchRecordId - Batch record ID
 * @returns {React.ReactElement} Main content component
 */
const MainContent = ({ 
  initialData: propInitialData, 
  onUpdate, 
  onSignoff, 
  sectionName, 
  templateName, 
  batchRecordId 
}) => {
  const {
    formData,
    initialData,
    columns,
    sectionDescription,
    isSignedOff,
    showPasswordModal,
    showSubmitPasswordModal,
    handleDataChange,
    handleSubmit,
    handleSignoff,
    handlePasswordSubmit,
    handleSubmitPasswordVerify,
    getHeaderFieldValue,
    ...stateHelpers // setHasUnsavedChanges, hasUnsavedChanges, setRefreshTrigger...
  } = useMainContentState({
    propInitialData,
    onUpdate,
    onSignoff,
    sectionName,
    templateName,
    batchRecordId
  });

  if (columns.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex flex-col w-full h-full">
      <SignoffsList signoffs={initialData.signoffs} />
      
      <BatchRecordInfo
        family={getHeaderFieldValue('Family')}
        partPrefix={getHeaderFieldValue('Part Prefix')}
        partNumber={getHeaderFieldValue('Part Number')}
        lotNumber={getHeaderFieldValue('Lot Number')}
        documentNumber={getHeaderFieldValue('Document Number')}
        revision={getHeaderFieldValue('Revision')}
        date={getHeaderFieldValue('Date')}
        dateOfManufacture={getHeaderFieldValue('Date of Manufacture')}
        description={getHeaderFieldValue('Description')}
      />

      {sectionDescription && (
        <div className="mb-4 mt-6 p-3 bg-gray-500 rounded">
          <p className="text-base text-white whitespace-pre-line">{sectionDescription}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-grow">
          <DataSheetGrid
            key={isSignedOff}
            value={formData}
            onChange={handleDataChange}
            columns={columns}
            height="100%"
            headerRowHeight={60}
            rowHeight={40}
            lockRows="true"
            className="batch-record-grid"
            style={{ height: '100%', width: '100%' }}
            autoRowHeight={true}
            rightElementProps={{
              style: { overflowY: 'auto' }
            }}
          />
        </div>

        <ActionButtons
          isSignedOff={Boolean(initialData.signoffs?.length)}
          hasUnsavedChanges={stateHelpers.hasUnsavedChanges}
          onSignoff={handleSignoff}
        />
      </form>
      
      <PasswordModal
        show={showPasswordModal}
        onClose={() => stateHelpers.setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
        title="Confirm Sign-off"
      />
      
      <PasswordModal
        show={showSubmitPasswordModal}
        onClose={() => stateHelpers.setShowSubmitPasswordModal(false)}
        onSubmit={handleSubmitPasswordVerify}
        title="Confirm Submit"
      />
    </main>
  );
};

export default React.memo(MainContent);
