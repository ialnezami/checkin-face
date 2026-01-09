'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface StatusUpdate {
  id: string;
  status_text: string;
  status_type: string;
  duration_minutes: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

interface StatusUpdateProps {
  employeeId?: string;
  token?: string;
}

export default function StatusUpdate({ employeeId, token }: StatusUpdateProps) {
  const [statusText, setStatusText] = useState('');
  const [statusType, setStatusType] = useState('activity');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [currentStatus, setCurrentStatus] = useState<StatusUpdate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const authToken = token || localStorage.getItem('token');

  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  const fetchCurrentStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/employee-status/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCurrentStatus(response.data.status);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      await axios.post(
        `${API_URL}/api/employee-status`,
        {
          status_text: statusText,
          status_type: statusType,
          duration_minutes: durationMinutes,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setMessage('Status updated successfully!');
      setStatusText('');
      fetchCurrentStatus();
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearStatus = async () => {
    if (!currentStatus) return;

    try {
      await axios.delete(`${API_URL}/api/employee-status/${currentStatus.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCurrentStatus(null);
      setMessage('Status cleared successfully!');
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to clear status');
    }
  };

  const durationOptions = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 300, label: '5 hours' },
    { value: 480, label: '8 hours' },
    { value: 1440, label: '24 hours' },
  ];

  const statusTypes = [
    { value: 'activity', label: 'Activity' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'break', label: 'Break' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'training', label: 'Training' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg animate-fadeIn">
      <h3 className="text-xl font-semibold mb-4">Update Your Status</h3>

      {/* Current Status Display */}
      {currentStatus && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">{currentStatus.status_text}</p>
              <p className="text-sm text-blue-700 mt-1">
                Type: {currentStatus.status_type} | Duration: {currentStatus.duration_minutes} minutes
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Expires: {new Date(currentStatus.expires_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleClearStatus}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Status Update Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What are you doing?
          </label>
          <textarea
            value={statusText}
            onChange={(e) => setStatusText(e.target.value)}
            placeholder="e.g., Working on project X, In a meeting, On break..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-ring transition-smooth"
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Type
            </label>
            <select
              value={statusType}
              onChange={(e) => setStatusType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-ring transition-smooth"
            >
              {statusTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-ring transition-smooth"
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg ${
              message.includes('successfully')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !statusText.trim()}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth focus-ring"
        >
          {isSubmitting ? 'Updating...' : 'Update Status'}
        </button>
      </form>
    </div>
  );
}

