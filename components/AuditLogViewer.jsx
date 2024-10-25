'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    collection: '',
    operation: '',
    startDate: '',
    endDate: '',
    page: 1
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        limit: 50
      });
      
      const response = await fetch(`/api/audit-logs?${queryParams}`);
      const data = await response.json();
      
      if (response.ok) {
        setLogs(data.logs);
      } else {
        console.error('Error fetching logs:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  return (
    <div className="p-4 text-gray-800">
      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <select
          value={filters.collection}
          onChange={(e) => setFilters(prev => ({ ...prev, collection: e.target.value, page: 1 }))}
          className="border p-2 rounded"
        >
          <option value="">All Collections</option>
          <option value="batchrecords">Batch Records</option>
          <option value="users">Users</option>
        </select>
        
        {/* Add more filters as needed */}
      </div>

      {/* Logs Table */}
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border p-2">Timestamp</th>
            <th className="border p-2">Operation</th>
            <th className="border p-2">Collection</th>
            <th className="border p-2">Document ID</th>
            <th className="border p-2">Changes</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td className="border p-2">
                {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
              </td>
              <td className="border p-2">{log.operationType}</td>
              <td className="border p-2">{log.collectionName}</td>
              <td className="border p-2">{log.documentId}</td>
              <td className="border p-2">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(log.updateDescription || log.fullDocument, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
