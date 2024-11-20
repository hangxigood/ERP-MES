import { useState, useEffect } from 'react';
import { format, isValid } from 'date-fns'; // Add isValid import

export default function EditHistorySidebar({ isOpen, onClose, templateName, batchRecordId, sectionName }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/${templateName}/${batchRecordId}/${sectionName}/history`
        );
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, templateName, batchRecordId, sectionName]);

  const formatValue = (value, type) => {
    if (value === null || value === undefined) return 'N/A';
    if (type === 'date') {
      const date = new Date(value);
      return isValid(date) ? format(date, 'yyyy-MM-dd HH:mm') : 'Invalid Date';
    }
    if (type === 'checkbox') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    return value.toString();
  };

  const formatFieldName = (change) => {
    const baseName = change.label || change.fieldName;
    if (change.rowInfo) {
      return `${baseName} (Row ${change.rowInfo.index + 1})`;
    }
    return baseName;
  };

  return (
    <div className={`fixed right-0 top-0 h-full bg-white shadow-lg w-96 transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    } overflow-y-auto`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit History</h2>
          <div className="flex items-center gap-2">
            {loading && <span className="text-sm text-gray-500">Loading...</span>}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              title="Close (Esc)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          {history.map((entry) => (
            entry.changes.length > 0 && (
              <div key={entry.version} className="border-b pb-4">
                <div className="bg-gray-50 p-3 rounded-t-md">
                  <p className="font-semibold text-sm">
                    {entry.user?.name || 'Unknown User'}
                    {entry.user?.role && <span className="text-gray-500 ml-2">({entry.user.role})</span>}
                  </p>
                  <p className="text-xs text-gray-600">
                    {format(new Date(entry.timestamp), 'PPpp')}
                  </p>
                </div>
                
                <div className="mt-2 space-y-2">
                  {entry.changes.map((change, idx) => (
                    <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                      <p className="font-medium text-gray-700">
                        {formatFieldName(change)}
                      </p>
                      <div className="mt-1 text-sm">
                        <div className="text-red-600 line-through">
                          {formatValue(change.oldValue, change.fieldType)}
                        </div>
                        <div className="text-green-600">
                          {formatValue(change.newValue, change.fieldType)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
          
          {(!history.length || !history.some(e => e.changes.length)) && !loading && (
            <p className="text-gray-500 text-center">No changes found</p>
          )}
        </div>
      </div>
    </div>
  );
}