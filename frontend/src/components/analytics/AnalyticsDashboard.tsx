'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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

interface AttendanceReport {
  date: string;
  totalEmployees: number;
  checkedIn: number;
  checkedOut: number;
  currentlyCheckedIn: number;
  lateArrivals: number;
  absences: number;
}

interface DepartmentReport {
  department: string;
  totalEmployees: number;
  checkedIn: number;
  attendanceRate: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsDashboard() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [lateArrivals, setLateArrivals] = useState<LateArrivalRecord[]>([]);
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [weeklyData, setWeeklyData] = useState<AttendanceReport[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentReport[]>([]);
  const [dailyData, setDailyData] = useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

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

  const fetchWeeklyReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/reports/weekly`, {
        params: { start_date: startDate },
        headers: { Authorization: `Bearer ${token}` },
      });
      setWeeklyData(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching weekly report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const response = await axios.get(`${API_URL}/api/reports/monthly`, {
        params: {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setWeeklyData(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching monthly report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/reports/daily`, {
        params: { date },
        headers: { Authorization: `Bearer ${token}` },
      });
      setDailyData(response.data);
    } catch (error) {
      console.error('Error fetching daily report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/reports/department`, {
        params: { date },
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartmentData(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching department report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLateArrivals();
    fetchDailyReport();
    fetchDepartmentReport();
  }, [date]);

  useEffect(() => {
    if (chartType === 'weekly') {
      fetchWeeklyReport();
    } else if (chartType === 'monthly') {
      fetchMonthlyReport();
    }
  }, [chartType, startDate]);

  // Prepare chart data
  const attendanceTrendData = weeklyData.map((report) => ({
    date: new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    checkedIn: report.checkedIn,
    checkedOut: report.checkedOut,
    lateArrivals: report.lateArrivals,
    absences: report.absences,
  }));

  const departmentChartData = departmentData.map((dept) => ({
    name: dept.department,
    attendanceRate: Math.round(dept.attendanceRate),
    checkedIn: dept.checkedIn,
    totalEmployees: dept.totalEmployees,
  }));

  const attendanceDistributionData = dailyData
    ? [
        { name: 'Checked In', value: dailyData.checkedIn },
        { name: 'Absent', value: dailyData.absences },
        { name: 'Late Arrivals', value: dailyData.lateArrivals },
      ]
    : [];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold mb-6">Attendance Analytics Dashboard</h2>

      {/* Chart Type Selector */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium">Chart Period:</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          {chartType !== 'daily' && (
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          )}
        </div>
      </div>

      {/* Attendance Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Attendance Trends</h3>
        {attendanceTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="checkedIn" stroke="#0088FE" name="Checked In" />
              <Line type="monotone" dataKey="checkedOut" stroke="#00C49F" name="Checked Out" />
              <Line type="monotone" dataKey="lateArrivals" stroke="#FF8042" name="Late Arrivals" />
              <Line type="monotone" dataKey="absences" stroke="#FF0000" name="Absences" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {loading ? 'Loading...' : 'No data available. Select a date range to view trends.'}
          </div>
        )}
      </div>

      {/* Department-wise Analytics */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Department-wise Attendance</h3>
        {departmentChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="attendanceRate" fill="#0088FE" name="Attendance Rate (%)" />
              <Bar dataKey="checkedIn" fill="#00C49F" name="Checked In" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {loading ? 'Loading...' : 'No department data available.'}
          </div>
        )}
      </div>

      {/* Attendance Distribution Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Today's Attendance Distribution</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        {attendanceDistributionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={attendanceDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {attendanceDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {loading ? 'Loading...' : 'No data available for selected date.'}
          </div>
        )}
      </div>

      {/* Late Arrivals Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Late Arrivals</h3>
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
      <div className="bg-white p-6 rounded-lg shadow-lg">
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
              <div className="text-3xl font-bold text-orange-600">
                {Math.round(stats.averageMinutesLate)}
              </div>
            </div>
            {stats.mostLateEmployee && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-600">Most Late Employee</div>
                <div className="text-lg font-bold text-yellow-600">
                  {stats.mostLateEmployee.name}
                </div>
                <div className="text-sm text-gray-500">{stats.mostLateEmployee.count} times</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

