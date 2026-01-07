'use client';

import { useState } from 'react';
import FaceRecognition from '@/components/auth/FaceRecognition';
import NameSearch from '@/components/auth/NameSearch';
import RFIDScanner from '@/components/auth/RFIDScanner';

type AuthMethod = 'face' | 'rfid' | 'manual';

export default function CheckInPage() {
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod | null>(null);
  const [checkInSuccess, setCheckInSuccess] = useState<string | null>(null);

  const handleSuccess = (employeeId: string, employeeName: string) => {
    setCheckInSuccess(`Successfully checked in: ${employeeName}`);
    // Reset after 3 seconds
    setTimeout(() => {
      setCheckInSuccess(null);
      setSelectedMethod(null);
    }, 3000);
  };

  const handleError = (error: string) => {
    console.error('Check-in error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Employee Check-In</h1>

        {checkInSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
            {checkInSuccess}
          </div>
        )}

        {!selectedMethod ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setSelectedMethod('face')}
              className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center"
            >
              <div className="text-4xl mb-4">👤</div>
              <h2 className="text-xl font-semibold mb-2">Face Recognition</h2>
              <p className="text-gray-600">Check in using facial recognition</p>
            </button>

            <button
              onClick={() => setSelectedMethod('rfid')}
              className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center"
            >
              <div className="text-4xl mb-4">📱</div>
              <h2 className="text-xl font-semibold mb-2">RFID/NFC Tag</h2>
              <p className="text-gray-600">Tap your RFID card</p>
            </button>

            <button
              onClick={() => setSelectedMethod('manual')}
              className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center"
            >
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold mb-2">Name Search</h2>
              <p className="text-gray-600">Search and check in manually</p>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedMethod(null)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              ← Back to Method Selection
            </button>

            {selectedMethod === 'face' && (
              <FaceRecognition
                onSuccess={handleSuccess}
                onError={handleError}
                mode="checkin"
              />
            )}

            {selectedMethod === 'rfid' && (
              <RFIDScanner
                onSuccess={handleSuccess}
                onError={handleError}
              />
            )}

            {selectedMethod === 'manual' && (
              <NameSearch
                onCheckIn={(employeeId) => handleSuccess(employeeId, '')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

