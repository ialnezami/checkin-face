'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface AnalyticsData {
  totalLateArrivals: number;
  averageMinutesLate: number;
  mostLateEmployee: {
    employee_id: string;
    name: string;
    count: number;
  } | null;
}

interface LateArrivalRecord {
  employee_id: string;
  employee_name: string;
  check_in_time: string;
  minutes_late: number;
  department?: string;
}

export default function AnalyticsDashboard() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [lateArrivals, setLateArrivals] = useState<LateArrivalRecord[]>([]);
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('token');

  const fetchLateArrivals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/late-arrivals`, {
        params: { date },
        headers: { Authorization: `Bearer ${token}` },
      });
      setLateArrivals(response.data.lateArrivals || []);
    } catch (error) {
      console.error('Error fetching late arrivals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/late-arrivals/stats`, {
        params: { start_date: startDate, end_date: endDate },
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLateArrivals();
  }, [date]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Attendance Analytics</h2>

      {/* Late Arrivals Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Late Arrivals</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : lateArrivals.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No late arrivals found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Employee</th>
                  <th className="border p-2 text-left">Department</th>
                  <th className="border p-2 text-left">Check-In Time</th>
                  <th className="border p-2 text-left">Minutes Late</th>
                </tr>
              </thead>
              <tbody>
                {lateArrivals.map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border p-2">{record.employee_name}</td>
                    <td className="border p-2">{record.department || '-'}</td>
                    <td className="border p-2">
                      {new Date(record.check_in_time).toLocaleTimeString()}
                    </td>
                    <td className="border p-2">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                        {record.minutes_late} min
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Late Arrival Statistics</h3>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="mb-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Get Statistics
        </button>

        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-gray-600">Total Late Arrivals</div>
              <div className="text-3xl font-bold text-red-600">{stats.totalLateArrivals}</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-sm text-gray-600">Average Minutes Late</div>
              <div className="text-3xl font-bold text-orange-600">{stats.averageMinutesLate}</div>
            </div>
            {stats.mostLateEmployee && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-600">Most Late Employee</div>
                <div className="text-lg font-bold text-yellow-600">{stats.mostLateEmployee.name}</div>
                <div className="text-sm text-gray-500">{stats.mostLateEmployee.count} times</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

