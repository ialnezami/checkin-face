'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface FingerprintScannerProps {
  onSuccess?: (employeeId: string, employeeName: string) => void;
  onError?: (error: string) => void;
  mode?: 'checkin' | 'enrollment';
  employeeId?: string;
}

export default function FingerprintScanner({
  onSuccess,
  onError,
  mode = 'checkin',
  employeeId,
}: FingerprintScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [fingerprintData, setFingerprintData] = useState<string>('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Simulate fingerprint capture
  // In production, this would connect to actual fingerprint scanner hardware
  const simulateFingerprintCapture = (): string => {
    // Generate a simulated fingerprint template
    // In real implementation, this would come from hardware scanner
    const template = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
    return template;
  };

  const handleScan = async () => {
    setIsScanning(true);
    setMessage('Place your finger on the scanner...');

    // Simulate scanning delay
    setTimeout(async () => {
      try {
        const capturedData = simulateFingerprintCapture();
        setFingerprintData(capturedData);
        setMessage('Fingerprint captured! Processing...');

        if (mode === 'checkin') {
          await checkInWithFingerprint(capturedData);
        } else {
          await enrollFingerprint(capturedData);
        }
      } catch (error: any) {
        setMessage('Error capturing fingerprint. Please try again.');
        onError?.(error.message || 'Fingerprint capture failed');
      } finally {
        setIsScanning(false);
      }
    }, 2000);
  };

  const checkInWithFingerprint = async (fingerprintData: string) => {
    setIsProcessing(true);
    try {
      const response = await axios.post(`${API_URL}/api/attendance/checkin/fingerprint`, {
        fingerprint_data: fingerprintData,
      });

      if (response.data && response.data.employee) {
        setMessage(`Welcome, ${response.data.employee.name}!`);
        onSuccess?.(
          response.data.employee.id,
          response.data.employee.name
        );
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Fingerprint not recognized';
      setMessage(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const enrollFingerprint = async (fingerprintData: string) => {
    if (!employeeId) {
      setMessage('Employee ID is required for enrollment');
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/employees/${employeeId}/enroll`,
        {
          method_type: 'fingerprint',
          method_data: { template: fingerprintData },
          is_primary: false,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage('Fingerprint enrolled successfully!');
      // Call onSuccess with fingerprint data for enrollment callback
      if (onSuccess) {
        onSuccess(employeeId, fingerprintData);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Fingerprint enrollment failed';
      setMessage(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto animate-fadeIn">
      <h3 className="text-xl font-semibold mb-4 text-center">
        {mode === 'checkin' ? 'Fingerprint Check-In' : 'Fingerprint Enrollment'}
      </h3>

      <div className="space-y-6">
        {/* Scanner Display */}
        <div className="relative">
          <div
            className={`w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-4 flex items-center justify-center transition-all ${
              isScanning
                ? 'border-blue-500 animate-pulse-slow'
                : 'border-gray-300'
            }`}
          >
            {isScanning ? (
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg
                    className="w-16 h-16 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <p className="text-blue-600 font-medium">Scanning...</p>
              </div>
            ) : isProcessing ? (
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center animate-spin">
                  <svg
                    className="w-16 h-16 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <p className="text-green-600 font-medium">Processing...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <p className="text-gray-600">Ready to scan</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`p-3 rounded-lg text-center ${
              message.includes('Error') || message.includes('not recognized')
                ? 'bg-red-100 text-red-700'
                : message.includes('Welcome') || message.includes('successfully')
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {message}
          </div>
        )}

        {/* Scan Button */}
        <button
          onClick={handleScan}
          disabled={isScanning || isProcessing}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth focus-ring"
        >
          {isScanning
            ? 'Scanning...'
            : isProcessing
            ? 'Processing...'
            : mode === 'checkin'
            ? 'Scan Fingerprint to Check-In'
            : 'Capture Fingerprint'}
        </button>

        {/* Info Text */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>
            {mode === 'checkin'
              ? 'Place your enrolled finger on the scanner'
              : 'Place your finger on the scanner to enroll'}
          </p>
          <p className="italic">
            Note: This is a simulation. In production, connect to actual fingerprint scanner hardware.
          </p>
        </div>
      </div>
    </div>
  );
}

