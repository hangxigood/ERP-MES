export const ActionButtons = ({ 
  isSignedOff, 
  hasUnsavedChanges, 
  onSignoff 
}) => (
  <div className="flex justify-between mt-4">
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