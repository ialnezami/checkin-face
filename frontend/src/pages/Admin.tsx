'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeManagement from '@/components/admin/EmployeeManagement';
import EnrollmentForm from '@/components/admin/EnrollmentForm';
import EmployeeSelector from '@/components/admin/EmployeeSelector';
import WorkScheduleManager from '@/components/admin/WorkScheduleManager';
import AbsenceAlerts from '@/components/admin/AbsenceAlerts';
import ReportsView from '@/components/reports/ReportsView';
import axios from 'axios';

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'employees' | 'enrollment' | 'reports' | 'audit' | 'backup' | 'sites' | 'schedules' | 'alerts'>('employees');
  const [absenceAlertsCount, setAbsenceAlertsCount] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      fetchAbsenceAlertsCount();
      // Refresh alerts count every 5 minutes
      const interval = setInterval(fetchAbsenceAlertsCount, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchAbsenceAlertsCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/absences/alerts/count`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` },
      });
      setAbsenceAlertsCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching absence alerts count:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });

      if (response.data.token) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setSelectedEmployee(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-600 text-center">
            Note: You need admin credentials to access this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="mb-6 border-b">
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setActiveTab('employees');
                setSelectedEmployee(null);
              }}
              className={`px-4 py-2 font-medium ${
                activeTab === 'employees'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Employee Management
            </button>
            <button
              onClick={() => setActiveTab('enrollment')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'enrollment'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Enrollment
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'reports'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'audit'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Audit Logs
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'backup'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Backup/Restore
            </button>
            <button
              onClick={() => setActiveTab('sites')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'sites'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sites
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'schedules'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Work Schedules
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'employees' && (
          <EmployeeManagement token={token || undefined} />
        )}

        {activeTab === 'reports' && (
          <ReportsView />
        )}

        {activeTab === 'audit' && (
          <div>
            {(() => {
              const AuditLogViewer = require('@/components/admin/AuditLogViewer').default;
              return <AuditLogViewer />;
            })()}
          </div>
        )}

        {activeTab === 'backup' && (
          <div>
            {(() => {
              const BackupRestore = require('@/components/admin/BackupRestore').default;
              return <BackupRestore />;
            })()}
          </div>
        )}

        {activeTab === 'sites' && (
          <div>
            {(() => {
              const SiteManagement = require('@/components/admin/SiteManagement').default;
              return <SiteManagement />;
            })()}
          </div>
        )}

        {activeTab === 'schedules' && (
          <WorkScheduleManager token={token || undefined} />
        )}

        {activeTab === 'enrollment' && (
          <div>
            {selectedEmployee ? (
              <div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="mb-4 px-4 py-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  ← Back to Employee Selection
                </button>
                <EnrollmentForm
                  employeeId={selectedEmployee.id}
                  employeeName={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                  onComplete={() => setSelectedEmployee(null)}
                />
              </div>
            ) : (
              <EmployeeSelector
                onSelect={(employee) => setSelectedEmployee(employee)}
                token={token || undefined}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
