'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface BackupFile {
  filename: string;
  path: string;
  size: number;
  created: string;
}

export default function BackupRestore() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/admin/backups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBackups(response.data.backups || []);
    } catch (error) {
      console.error('Error fetching backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/backup`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage('Backup created successfully!');
      fetchBackups();
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Error creating backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backupPath: string) => {
    const filename = backupPath.split('/').pop() || backupPath;
    if (!confirm(`Are you sure you want to restore from ${filename}? This will overwrite current data!`)) {
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      await axios.post(
        `${API_URL}/api/admin/restore`,
        { backup_path: backupPath },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage('Backup restored successfully!');
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Error restoring backup');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Backup & Restore</h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.includes('Error')
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {message}
        </div>
      )}

      {/* Create Backup */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Create Backup</h3>
        <button
          onClick={handleCreateBackup}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create New Backup'}
        </button>
        <p className="mt-2 text-sm text-gray-600">
          Creates a backup of all employees, attendance records, and system data.
        </p>
      </div>

      {/* Backup List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Backups</h3>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : backups.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No backups found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Filename</th>
                  <th className="border p-2 text-left">Size</th>
                  <th className="border p-2 text-left">Created</th>
                  <th className="border p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border p-2">{backup.filename}</td>
                    <td className="border p-2">{formatFileSize(backup.size)}</td>
                    <td className="border p-2">
                      {new Date(backup.created).toLocaleString()}
                    </td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleRestore(backup.path)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Warning:</strong> Restoring a backup will overwrite all current data. Make sure to create a backup before restoring.
        </p>
      </div>
    </div>
  );
}

