'use client';

import { useState } from 'react';
import axios from 'axios';

interface ReportData {
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

export default function ReportsView() {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'department'>('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [reportData, setReportData] = useState<ReportData | ReportData[] | DepartmentReport[] | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('token');

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = '';
      let params: any = {};

      switch (reportType) {
        case 'daily':
          url = `${API_URL}/api/reports/daily`;
          params = { date };
          break;
        case 'weekly':
          url = `${API_URL}/api/reports/weekly`;
          params = { start_date: startDate };
          break;
        case 'monthly':
          url = `${API_URL}/api/reports/monthly`;
          params = { year, month };
          break;
        case 'department':
          url = `${API_URL}/api/reports/department`;
          params = { date };
          break;
      }

      const response = await axios.get(url, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (reportType === 'department') {
        setReportData(response.data.reports);
      } else if (reportType === 'weekly' || reportType === 'monthly') {
        setReportData(response.data.reports);
      } else {
        setReportData(response.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Error fetching report. Please check your permissions.');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'csv' | 'json') => {
    try {
      const endDate = reportType === 'daily' ? date : 
                     reportType === 'weekly' ? new Date(new Date(startDate).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
                     new Date(year, month, 0).toISOString().split('T')[0];

      const url = `${API_URL}/api/reports/export/${format}`;
      const response = await axios.get(url, {
        params: {
          start_date: reportType === 'daily' ? date : 
                     reportType === 'weekly' ? startDate :
                     `${year}-${String(month).padStart(2, '0')}-01`,
          end_date: endDate,
        },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url2 = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url2;
      a.download = `attendance-report-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url2);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Attendance Reports</h2>

      {/* Report Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Report Type</label>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value as any)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="daily">Daily Report</option>
          <option value="weekly">Weekly Report</option>
          <option value="monthly">Monthly Report</option>
          <option value="department">Department Report</option>
        </select>
      </div>

      {/* Date Selection */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        {reportType === 'daily' && (
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        )}

        {reportType === 'weekly' && (
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        )}

        {reportType === 'monthly' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Month</label>
              <input
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        )}

        {reportType === 'department' && (
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={fetchReport}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Generate Report'}
        </button>
        {reportData && (
          <>
            <button
              onClick={() => exportReport('csv')}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Export CSV
            </button>
            <button
              onClick={() => exportReport('json')}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Export JSON
            </button>
          </>
        )}
      </div>

      {/* Report Display */}
      {reportData && (
        <div className="mt-6">
          {reportType === 'department' ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Department</th>
                    <th className="border p-2 text-left">Total Employees</th>
                    <th className="border p-2 text-left">Checked In</th>
                    <th className="border p-2 text-left">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData as DepartmentReport[]).map((dept, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{dept.department}</td>
                      <td className="border p-2">{dept.totalEmployees}</td>
                      <td className="border p-2">{dept.checkedIn}</td>
                      <td className="border p-2">{dept.attendanceRate.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : Array.isArray(reportData) ? (
            <div className="space-y-4">
              {(reportData as ReportData[]).map((day, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">{day.date}</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>Total Employees: {day.totalEmployees}</div>
                    <div>Checked In: {day.checkedIn}</div>
                    <div>Checked Out: {day.checkedOut}</div>
                    <div>Currently In: {day.currentlyCheckedIn}</div>
                    <div>Late Arrivals: {day.lateArrivals}</div>
                    <div>Absences: {day.absences}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-4">{(reportData as ReportData).date}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-sm text-gray-600">Total Employees</div>
                  <div className="text-2xl font-bold">{(reportData as ReportData).totalEmployees}</div>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <div className="text-sm text-gray-600">Checked In</div>
                  <div className="text-2xl font-bold">{(reportData as ReportData).checkedIn}</div>
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <div className="text-sm text-gray-600">Currently In</div>
                  <div className="text-2xl font-bold">{(reportData as ReportData).currentlyCheckedIn}</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded">
                  <div className="text-sm text-gray-600">Late Arrivals</div>
                  <div className="text-2xl font-bold">{(reportData as ReportData).lateArrivals}</div>
                </div>
                <div className="p-3 bg-red-50 rounded">
                  <div className="text-sm text-gray-600">Absences</div>
                  <div className="text-2xl font-bold">{(reportData as ReportData).absences}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Checked Out</div>
                  <div className="text-2xl font-bold">{(reportData as ReportData).checkedOut}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

