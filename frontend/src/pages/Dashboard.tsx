'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import AbsenceAlerts from '@/components/admin/AbsenceAlerts';

interface DashboardStats {
  totalCheckedIn: number;
  totalCheckedOut: number;
  currentlyCheckedIn: number;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  check_in_time: string;
  check_out_time: string | null;
  auth_method_used: string;
  status: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchDashboardData();
    fetchRecentRecords();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/attendance/dashboard`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentRecords = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/attendance`, {
        params: {
          start_date: dateRange.start,
          end_date: dateRange.end,
          limit: 50,
        },
      });
      setRecentRecords(response.data.records || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 animate-fadeIn">
          Attendance Dashboard
        </h1>

        {/* Stats Cards */}
        {loading ? (
          <div className="text-center py-8 animate-pulse-slow">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg hover-lift transition-smooth animate-scaleIn">
              <h3 className="text-gray-600 text-xs md:text-sm font-medium mb-2">
                Total Check-Ins Today
              </h3>
              <p className="text-2xl md:text-3xl font-bold text-blue-600">
                {stats.totalCheckedIn}
              </p>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg hover-lift transition-smooth animate-scaleIn" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-gray-600 text-xs md:text-sm font-medium mb-2">
                Total Check-Outs Today
              </h3>
              <p className="text-2xl md:text-3xl font-bold text-green-600">
                {stats.totalCheckedOut}
              </p>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg hover-lift transition-smooth animate-scaleIn" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-gray-600 text-xs md:text-sm font-medium mb-2">
                Currently Checked In
              </h3>
              <p className="text-2xl md:text-3xl font-bold text-purple-600">
                {stats.currentlyCheckedIn}
              </p>
            </div>
          </div>
        ) : null}

        {/* Date Range Filter */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg mb-6 animate-slideIn">
          <h3 className="font-semibold mb-4 text-sm md:text-base">Filter by Date Range</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-ring transition-smooth"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-ring transition-smooth"
              />
            </div>
          </div>
        </div>

        {/* Absence Alerts Section */}
        <div className="mb-6 animate-fadeIn">
          <AbsenceAlerts autoRefresh={true} />
        </div>

        {/* Analytics Section */}
        <div className="mb-6 animate-fadeIn">
          <AnalyticsDashboard />
        </div>

        {/* Recent Records */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-slideIn">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg md:text-xl font-semibold">Recent Attendance Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Check-In Time
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                    Check-Out Time
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Method
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No records found
                    </td>
                  </tr>
                ) : (
                  recentRecords.map((record, index) => (
                    <tr 
                      key={record.id} 
                      className="hover:bg-gray-50 transition-colors animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                        {record.employee
                          ? `${record.employee.first_name} ${record.employee.last_name}`
                          : record.employee_id}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                        {format(new Date(record.check_in_time), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell">
                        {record.check_out_time
                          ? format(new Date(record.check_out_time), 'MMM dd, yyyy HH:mm')
                          : '-'}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          {record.auth_method_used}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            record.status === 'checked_in'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

