/**
 * @fileoverview Action buttons component for batch record form operations.
 * Provides submit and sign-off functionality with proper state handling.
 * 
 * @module components/ActionButtons
 */

/**
 * Action buttons component for form operations
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isSignedOff - Whether the form is signed off
 * @param {boolean} props.hasUnsavedChanges - Whether there are unsaved changes
 * @param {Function} props.onSignoff - Handler for sign-off action
 * @returns {React.ReactElement} Action buttons component
 */
export const ActionButtons = ({ 
  isSignedOff, 
  hasUnsavedChanges, 
  onSignoff 
}) => (
  <div className="flex justify-end mt-4">
    <div className="flex gap-2">
      <button 
        type="submit" 
        className={`px-8 py-2 rounded ${
          isSignedOff || !hasUnsavedChanges
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-teal-300 hover:bg-teal-400'
        }`}
        disabled={isSignedOff || !hasUnsavedChanges}
      >
        Submit
      </button>
      <button 
        type="button" 
        onClick={onSignoff}
        className="px-8 py-2 rounded bg-blue-300 hover:bg-blue-400"
      >
        Sign Off
      </button>
    </div>
  </div>
);