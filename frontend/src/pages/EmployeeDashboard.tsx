'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import LeaveRequestForm from '@/components/employee/LeaveRequestForm';
import AttendanceChart from '@/components/employee/AttendanceChart';

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
}

interface AttendanceStats {
  year: number;
  month: number;
  totalDays: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  checkInCount: number;
  checkOutCount: number;
  attendanceRate: number;
}

interface LeaveStats {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  totalDaysRequested: number;
  totalDaysApproved: number;
}

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [leaveStats, setLeaveStats] = useState<LeaveStats | null>(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('employeeToken');

  useEffect(() => {
    if (!token) {
      router.push('/employee/login');
      return;
    }
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeeRes, attendanceRes, leaveRes] = await Promise.all([
        axios.get(`${API_URL}/api/employee/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/attendance/my-stats`, {
          params: { month: selectedMonth, year: selectedYear },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/leave-requests/my-stats`, {
          params: { year: selectedYear },
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setEmployee(employeeRes.data);
      setAttendanceStats(attendanceRes.data);
      setLeaveStats(leaveRes.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('employeeToken');
        router.push('/employee/login');
      }
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeData');
    router.push('/employee/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Employee Portal</h1>
            {employee && (
              <p className="text-sm text-gray-600">
                {employee.first_name} {employee.last_name} ({employee.employee_id})
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Attendance Rate</div>
            <div className="text-3xl font-bold text-blue-600">
              {attendanceStats?.attendanceRate.toFixed(1) || 0}%
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Present Days</div>
            <div className="text-3xl font-bold text-green-600">
              {attendanceStats?.presentDays || 0}
            </div>
            <div className="text-xs text-gray-500">out of {attendanceStats?.totalDays || 0} days</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Absent Days</div>
            <div className="text-3xl font-bold text-red-600">
              {attendanceStats?.absentDays || 0}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Leave Days Approved</div>
            <div className="text-3xl font-bold text-purple-600">
              {leaveStats?.totalDaysApproved || 0}
            </div>
            <div className="text-xs text-gray-500">
              {leaveStats?.pendingRequests || 0} pending
            </div>
          </div>
        </div>

        {/* Month/Year Selector */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border rounded-lg"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {new Date(selectedYear, month - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <label className="text-sm font-medium">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border rounded-lg"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Attendance Overview</h2>
            <AttendanceChart stats={attendanceStats} />
          </div>

          {/* Leave Requests */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Leave Requests</h2>
              <button
                onClick={() => setShowLeaveForm(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                + Request Leave
              </button>
            </div>
            <LeaveRequestsList />
          </div>
        </div>

        {/* Leave Request Form Modal */}
        {showLeaveForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <LeaveRequestForm
                onSuccess={() => {
                  setShowLeaveForm(false);
                  fetchData();
                }}
                onCancel={() => setShowLeaveForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaveRequestsList() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('employeeToken');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/leave-requests/my-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (requests.length === 0) {
    return <div className="text-center py-4 text-gray-500">No leave requests</div>;
  }

  return (
    <div className="space-y-2">
      {requests.slice(0, 5).map((request) => (
        <div key={request.id} className="p-3 border rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium capitalize">{request.leave_type}</div>
              <div className="text-sm text-gray-600">
                {new Date(request.start_date).toLocaleDateString()} -{' '}
                {new Date(request.end_date).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-500">{request.days_requested} days</div>
            </div>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${statusColors[request.status] || ''}`}
            >
              {request.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

