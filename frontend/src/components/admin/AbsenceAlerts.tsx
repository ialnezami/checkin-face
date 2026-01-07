'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface AbsenceAlert {
  id: string;
  employee_id: string;
  employee_name: string;
  site_id: string;
  site_name: string;
  expected_check_in_time: string;
  minutes_overdue: number;
  department?: string;
  shift_type: string;
}

interface AbsenceAlertsProps {
  token?: string;
  autoRefresh?: boolean;
}

export default function AbsenceAlerts({ token, autoRefresh = true }: AbsenceAlertsProps) {
  const [alerts, setAlerts] = useState<AbsenceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const authToken = token || localStorage.getItem('token');

  useEffect(() => {
    fetchAlerts();
    
    if (autoRefresh) {
      // Refresh every 5 minutes
      const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/api/absences/alerts`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      setAlerts(response.data.alerts || []);
    } catch (error: any) {
      console.error('Error fetching absence alerts:', error);
      setError(error.response?.data?.error || 'Failed to load absence alerts');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMinutesOverdue = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading absence alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Absence Alerts</h2>
          <p className="text-sm text-gray-600 mt-1">
            Employees who haven't checked in 30+ minutes after their expected time
          </p>
        </div>
        <div className="flex items-center gap-4">
          {alerts.length > 0 && (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-semibold">
              {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={fetchAlerts}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="text-center py-12 bg-green-50 rounded-lg border-2 border-green-200">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">No Absence Alerts</h3>
          <p className="text-green-600">
            All employees have checked in on time or are not expected to work today.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 border-2 border-red-300 bg-red-50 rounded-lg hover:border-red-400 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">⚠️</span>
                    <div>
                      <h3 className="font-bold text-lg text-red-900">
                        {alert.employee_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        ID: {alert.employee_id}
                        {alert.department && ` • ${alert.department}`}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-600">Site:</span>
                      <span className="ml-2 font-medium">{alert.site_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Expected:</span>
                      <span className="ml-2 font-medium">{formatTime(alert.expected_check_in_time)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Shift:</span>
                      <span className="ml-2 font-medium capitalize">{alert.shift_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Overdue:</span>
                      <span className="ml-2 font-bold text-red-700">
                        {formatMinutesOverdue(alert.minutes_overdue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Alerts are generated 30 minutes after the expected check-in time. 
            Employees may still check in later, but they will be marked as late.
          </p>
        </div>
      )}
    </div>
  );
}

