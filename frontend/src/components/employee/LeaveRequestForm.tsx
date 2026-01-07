'use client';

import { useState } from 'react';
import axios from 'axios';

interface LeaveRequestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function LeaveRequestForm({ onSuccess, onCancel }: LeaveRequestFormProps) {
  const [formData, setFormData] = useState({
    leave_type: 'vacation' as 'vacation' | 'sick' | 'personal' | 'other',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('employeeToken');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/api/leave-requests`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error submitting leave request');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Request Leave</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Leave Type</label>
          <select
            value={formData.leave_type}
            onChange={(e) => setFormData({ ...formData, leave_type: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="vacation">Vacation (Congé/Vacances)</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              min={formData.start_date || new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
        </div>

        {calculateDays() > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              Days Requested: {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Reason (Optional)</label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Please provide a reason for your leave request..."
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

