'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    collection: '',
    operation: '',
    startDate: format(new Date().setDate(new Date().getDate() - 7), 'yyyy-MM-dd'),
    endDate: format(new Date().setDate(new Date().getDate() + 1), 'yyyy-MM-dd'),
    userId: '',
    userRole: '',
    page: 1
  });

  const [filterOptions, setFilterOptions] = useState({
    users: [],
    roles: [],
    collections: []
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {})
      );
      queryParams.append('limit', '50');
      
      const response = await fetch(`/api/audit-logs?${queryParams}`);
      const data = await response.json();
      
      if (response.ok) {
        setLogs(data.logs);
        setFilterOptions({
          users: data.filters?.users || [],
          roles: data.filters?.roles || [],
          collections: data.filters?.collections || []
        });
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
    const timer = setTimeout(() => {
      fetchLogs();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const renderUserInfo = (metadata) => {
    if (!metadata?.user) return 'N/A';
    const { user } = metadata;
    return (
      <div className="space-y-1">
        <div className="font-medium">{user.name}</div>
        <div className="text-sm text-gray-500">{user.email}</div>
        <div className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1 inline-block">
          {user.role}
        </div>
        {metadata.clientInfo && (
          <div className="text-xs text-gray-400 mt-1">
            <div>IP: {metadata.clientInfo.ip}</div>
          </div>
        )}
      </div>
    );
  };

  const renderChanges = (log) => {
    if (log.operationType === 'insert') {
      return <span className="text-green-600">New document created</span>;
    }

    if (log.operationType === 'delete') {
      return <span className="text-red-600">Document deleted</span>;
    }

    if (log.updateDescription?.fields) {
      return (
        <div className="space-y-2">
          {log.updateDescription.fields.map((change, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-2 py-1">
              <div className="text-sm ">
                <span className="text-sx text-blue-800 pr-2 py-1">Section:</span>
                <span className="font-medium">{change.sectionName}</span>
              </div>
              <div className="text-sm ">
                <span className="text-sx text-blue-800 pr-2 py-1">Row:</span>
                <span className="font-medium">{change.label}</span>
              </div>
              <div className="text-sm">
                <span className="text-sx text-blue-800 pr-2 py-1">Column:</span>
                <span className="font-medium">{change.fieldName}:</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="text-red-600">
                    Old: {change.old || '(empty)'}
                  </div>
                  <div className="text-green-600">
                    New: {change.new || '(empty)'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-gray-500">No changes recorded</span>;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4 text-gray-900">
        <h2 className="text-lg font-semibold">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select
            value={filters.collection}
            onChange={(e) => setFilters(prev => ({ ...prev, collection: e.target.value, page: 1 }))}
            className="border p-2 rounded"
          >
            <option value="">All Collections</option>
            {filterOptions.collections.map((collection) => (
              <option key={collection} value={collection}>
                {collection}
              </option>
            ))}
          </select>

          <select
            value={filters.userRole}
            onChange={(e) => setFilters(prev => ({ ...prev, userRole: e.target.value, page: 1 }))}
            className="border p-2 rounded"
          >
            <option value="">All Roles</option>
            {filterOptions.roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            value={filters.userId}
            onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value, page: 1 }))}
            className="border p-2 rounded"
          >
            <option value="">All Users</option>
            {filterOptions.users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
              className="border p-2 rounded flex-1"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
              className="border p-2 rounded flex-1"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto text-gray-900">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${log.operationType === 'insert' ? 'bg-green-100 text-green-800' : ''}
                    ${log.operationType === 'update' ? 'bg-blue-100 text-blue-800' : ''}
                    ${log.operationType === 'delete' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {log.operationType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.collectionName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{log.documentId}</td>
                <td className="px-6 py-4 text-sm">{renderUserInfo(log.metadata)}</td>
                <td className="px-6 py-4">
                  <div className="text-sm">{renderChanges(log)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
