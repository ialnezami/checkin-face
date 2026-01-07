'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface RFIDScannerProps {
  onSuccess?: (employeeId: string, employeeName: string) => void;
  onError?: (error: string) => void;
}

export default function RFIDScanner({ onSuccess, onError }: RFIDScannerProps) {
  const [tagId, setTagId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Simulate RFID tag reading (in production, this would connect to hardware)
  useEffect(() => {
    // Listen for manual tag input or simulate tag reading
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && tagId) {
        handleCheckIn();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [tagId]);

  const handleCheckIn = async () => {
    if (!tagId.trim()) {
      setMessage('Please enter or scan RFID tag');
      return;
    }

    setIsProcessing(true);
    setMessage('Processing...');

    try {
      const response = await axios.post(`${API_URL}/api/attendance/checkin/rfid`, {
        tag_id: tagId.trim(),
      });

      if (response.data && response.data.employee) {
        setMessage(`Welcome, ${response.data.employee.name}!`);
        onSuccess?.(
          response.data.employee.id,
          response.data.employee.name
        );
        setTagId(''); // Clear after success
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'RFID tag not recognized';
      setMessage(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4">RFID/NFC Check-In</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scan or Enter RFID Tag ID
          </label>
          <input
            type="text"
            value={tagId}
            onChange={(e) => setTagId(e.target.value)}
            placeholder="Tap RFID card or enter tag ID..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
            autoFocus
            disabled={isProcessing}
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg ${
              message.includes('Error') || message.includes('not recognized')
                ? 'bg-red-100 text-red-700'
                : message.includes('Welcome')
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {message}
          </div>
        )}

        <button
          onClick={handleCheckIn}
          disabled={isProcessing || !tagId.trim()}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Check In'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Tap your RFID card on the reader or manually enter the tag ID
        </p>
      </div>
    </div>
  );
}

