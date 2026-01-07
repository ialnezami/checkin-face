'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface WorkSchedule {
  id: string;
  site_id: string;
  employee_id?: string | null;
  shift_type: 'morning' | 'afternoon' | 'night' | 'flexible' | 'custom';
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  grace_period_minutes: number;
  is_active: boolean;
}

interface Site {
  id: string;
  name: string;
  code: string;
}

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
}

interface WorkScheduleManagerProps {
  employeeId?: string;
  employeeName?: string;
  token?: string;
}

const DAYS_OF_WEEK = [
  { value: null, label: 'All Days' },
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const SHIFT_TYPES = [
  { value: 'morning', label: 'Morning Shift', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon Shift', icon: '☀️' },
  { value: 'night', label: 'Night Shift', icon: '🌙' },
  { value: 'flexible', label: 'Flexible', icon: '🔄' },
  { value: 'custom', label: 'Custom', icon: '⚙️' },
];

export default function WorkScheduleManager({
  employeeId,
  employeeName,
  token,
}: WorkScheduleManagerProps) {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    site_id: '',
    shift_type: 'morning' as WorkSchedule['shift_type'],
    day_of_week: null as number | null,
    start_time: '09:00:00',
    end_time: '17:00:00',
    grace_period_minutes: 15,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const authToken = token || localStorage.getItem('token');
  const isSiteMode = !employeeId;

  useEffect(() => {
    fetchSites();
    if (employeeId) {
      fetchEmployeeSchedules();
    } else if (selectedSite) {
      fetchSiteSchedules();
    }
  }, [employeeId, selectedSite]);

  const fetchSites = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/sites`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      setSites(response.data.sites || []);
      if (response.data.sites?.length > 0 && !selectedSite) {
        setSelectedSite(response.data.sites[0].id);
        setFormData({ ...formData, site_id: response.data.sites[0].id });
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchEmployeeSchedules = async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/schedules/employee/${employeeId}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      setSchedules(response.data.schedules || []);
    } catch (error) {
      console.error('Error fetching employee schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteSchedules = async () => {
    if (!selectedSite) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/schedules/site/${selectedSite}/defaults`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      setSchedules(response.data.schedules || []);
    } catch (error) {
      console.error('Error fetching site schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSiteMode) {
        // Create/update site default schedule
        if (editingSchedule) {
          await axios.put(
            `${API_URL}/api/schedules/site/defaults/${editingSchedule.id}`,
            formData,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
        } else {
          await axios.post(
            `${API_URL}/api/schedules/site/${selectedSite}/defaults`,
            formData,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
        }
      } else {
        // Create/update employee schedule
        if (editingSchedule) {
          await axios.put(
            `${API_URL}/api/schedules/employee/${editingSchedule.id}`,
            formData,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
        } else {
          await axios.post(
            `${API_URL}/api/schedules/employee/${employeeId}`,
            formData,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
        }
      }
      setShowForm(false);
      setEditingSchedule(null);
      resetForm();
      if (employeeId) {
        fetchEmployeeSchedules();
      } else {
        fetchSiteSchedules();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error saving schedule');
    }
  };

  const handleEdit = (schedule: WorkSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      site_id: schedule.site_id,
      shift_type: schedule.shift_type,
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      grace_period_minutes: schedule.grace_period_minutes,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      if (isSiteMode) {
        await axios.delete(`${API_URL}/api/schedules/site/defaults/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } else {
        await axios.delete(`${API_URL}/api/schedules/employee/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
      if (employeeId) {
        fetchEmployeeSchedules();
      } else {
        fetchSiteSchedules();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting schedule');
    }
  };

  const resetForm = () => {
    setFormData({
      site_id: selectedSite || '',
      shift_type: 'morning',
      day_of_week: null,
      start_time: '09:00:00',
      end_time: '17:00:00',
      grace_period_minutes: 15,
    });
    setEditingSchedule(null);
  };

  const getShiftIcon = (shiftType: string) => {
    return SHIFT_TYPES.find(s => s.value === shiftType)?.icon || '⚙️';
  };

  const getDayLabel = (dayOfWeek: number | null) => {
    return DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || 'All Days';
  };

  if (loading) {
    return <div className="text-center py-8">Loading schedules...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {isSiteMode ? 'Site Default Schedules' : `Work Schedules - ${employeeName}`}
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + Add Schedule
        </button>
      </div>

      {isSiteMode && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Site:</label>
          <select
            value={selectedSite}
            onChange={(e) => {
              setSelectedSite(e.target.value);
              setFormData({ ...formData, site_id: e.target.value });
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name} ({site.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Schedule Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
          </h3>

          {!isSiteMode && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Site *</label>
              <select
                value={formData.site_id}
                onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Site</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} ({site.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Shift Type *</label>
              <select
                value={formData.shift_type}
                onChange={(e) => setFormData({ ...formData, shift_type: e.target.value as WorkSchedule['shift_type'] })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {SHIFT_TYPES.map((shift) => (
                  <option key={shift.value} value={shift.value}>
                    {shift.icon} {shift.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Day of Week</label>
              <select
                value={formData.day_of_week === null ? '' : formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value === '' ? null : parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.value === null ? 'all' : day.value} value={day.value === null ? '' : day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Start Time *</label>
              <input
                type="time"
                value={formData.start_time.substring(0, 5)}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value + ':00' })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Time *</label>
              <input
                type="time"
                value={formData.end_time.substring(0, 5)}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value + ':00' })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Grace Period (minutes) *</label>
              <input
                type="number"
                min="0"
                max="60"
                value={formData.grace_period_minutes}
                onChange={(e) => setFormData({ ...formData, grace_period_minutes: parseInt(e.target.value) })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Employees can check in up to {formData.grace_period_minutes} minutes after start time without being marked late
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              {editingSchedule ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No schedules configured</p>
          <p className="text-sm mt-2">
            {isSiteMode
              ? 'Add default schedules for this site'
              : 'Add work schedules for this employee'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getShiftIcon(schedule.shift_type)}</span>
                    <h3 className="font-semibold text-lg capitalize">{schedule.shift_type} Shift</h3>
                    {!isSiteMode && (
                      <span className="text-sm text-gray-500">
                        ({sites.find(s => s.id === schedule.site_id)?.name || 'Unknown Site'})
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Day:</span>
                      <span className="ml-2 font-medium">{getDayLabel(schedule.day_of_week)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Start:</span>
                      <span className="ml-2 font-medium">{schedule.start_time.substring(0, 5)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">End:</span>
                      <span className="ml-2 font-medium">{schedule.end_time.substring(0, 5)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Grace:</span>
                      <span className="ml-2 font-medium">{schedule.grace_period_minutes} min</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(schedule)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

