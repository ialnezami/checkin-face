'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    user_id: '',
    action: '',
    resource_type: '',
    start_date: '',
    end_date: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 100,
    offset: 0,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.offset]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: pagination.limit,
        offset: pagination.offset,
      };

      if (filters.user_id) params.user_id = filters.user_id;
      if (filters.action) params.action = filters.action;
      if (filters.resource_type) params.resource_type = filters.resource_type;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const response = await axios.get(`${API_URL}/api/admin/audit-logs`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setLogs(response.data.logs || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, offset: 0 });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Audit Logs</h2>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">User ID</label>
          <input
            type="text"
            value={filters.user_id}
            onChange={(e) => handleFilterChange('user_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Filter by user"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Action</label>
          <input
            type="text"
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Filter by action"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Resource Type</label>
          <input
            type="text"
            value={filters.resource_type}
            onChange={(e) => handleFilterChange('resource_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="employee, attendance, etc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => handleFilterChange('start_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => handleFilterChange('end_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No audit logs found</div>
      ) : (
        <>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Timestamp</th>
                  <th className="border p-2 text-left">User</th>
                  <th className="border p-2 text-left">Action</th>
                  <th className="border p-2 text-left">Resource</th>
                  <th className="border p-2 text-left">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="border p-2">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="border p-2">{log.user_id || 'System'}</td>
                    <td className="border p-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {log.action}
                      </span>
                    </td>
                    <td className="border p-2">
                      {log.resource_type && (
                        <span className="text-gray-600">
                          {log.resource_type}
                          {log.resource_id && ` (${log.resource_id.substring(0, 8)}...)`}
                        </span>
                      )}
                    </td>
                    <td className="border p-2 text-xs text-gray-500">{log.ip_address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination({ ...pagination, offset: Math.max(0, pagination.offset - pagination.limit) })}
                disabled={pagination.offset === 0}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, offset: pagination.offset + pagination.limit })}
                disabled={pagination.offset + pagination.limit >= pagination.total}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

