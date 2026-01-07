'use client';

import { useState } from 'react';
import FaceRecognition from '@/components/auth/FaceRecognition';
import axios from 'axios';

interface EnrollmentFormProps {
  employeeId: string;
  employeeName: string;
  onComplete?: () => void;
}

export default function EnrollmentForm({
  employeeId,
  employeeName,
  onComplete,
}: EnrollmentFormProps) {
  const [currentStep, setCurrentStep] = useState<'method' | 'face' | 'rfid' | 'pin'>('method');
  const [enrolledMethods, setEnrolledMethods] = useState<string[]>([]);
  const [rfidTag, setRfidTag] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('token');

  const handleMethodSelect = (method: 'face' | 'rfid' | 'pin') => {
    setCurrentStep(method);
  };

  const handleFaceEnrollment = async (imageData: string) => {
    try {
      await axios.post(
        `${API_URL}/api/employees/${employeeId}/enroll`,
        {
          method_type: 'face',
          method_data: imageData,
          is_primary: enrolledMethods.length === 0,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEnrolledMethods([...enrolledMethods, 'face']);
      setCurrentStep('method');
      alert('Face enrolled successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Face enrollment failed');
    }
  };

  const handleRFIDEnrollment = async () => {
    if (!rfidTag.trim()) {
      alert('Please enter RFID tag ID');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/employees/${employeeId}/enroll`,
        {
          method_type: 'rfid',
          method_data: rfidTag.trim(),
          is_primary: enrolledMethods.length === 0,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEnrolledMethods([...enrolledMethods, 'rfid']);
      setRfidTag('');
      setCurrentStep('method');
      alert('RFID tag enrolled successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'RFID enrollment failed');
    }
  };

  const handlePINEnrollment = async () => {
    if (!pin || pin.length < 4) {
      alert('PIN must be at least 4 characters');
      return;
    }

    if (pin !== confirmPin) {
      alert('PINs do not match');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/employees/${employeeId}/enroll`,
        {
          method_type: 'pin',
          method_data: pin,
          is_primary: enrolledMethods.length === 0,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEnrolledMethods([...enrolledMethods, 'pin']);
      setPin('');
      setConfirmPin('');
      setCurrentStep('method');
      alert('PIN enrolled successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'PIN enrollment failed');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Enroll Authentication Methods for {employeeName}
      </h2>

      {enrolledMethods.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800 mb-2">Enrolled Methods:</p>
          <div className="flex flex-wrap gap-2">
            {enrolledMethods.map((method) => (
              <span
                key={method}
                className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm"
              >
                {method.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'method' && (
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Select an authentication method to enroll for this employee.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setCurrentStep('face')}
              disabled={enrolledMethods.includes('face')}
              className={`p-6 border-2 rounded-lg text-center transition-colors ${
                enrolledMethods.includes('face')
                  ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                  : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="text-4xl mb-2">👤</div>
              <h3 className="font-semibold">Face Recognition</h3>
              {enrolledMethods.includes('face') && (
                <p className="text-xs text-green-600 mt-1">✓ Enrolled</p>
              )}
            </button>

            <button
              onClick={() => setCurrentStep('rfid')}
              disabled={enrolledMethods.includes('rfid')}
              className={`p-6 border-2 rounded-lg text-center transition-colors ${
                enrolledMethods.includes('rfid')
                  ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                  : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="text-4xl mb-2">📱</div>
              <h3 className="font-semibold">RFID/NFC Tag</h3>
              {enrolledMethods.includes('rfid') && (
                <p className="text-xs text-green-600 mt-1">✓ Enrolled</p>
              )}
            </button>

            <button
              onClick={() => setCurrentStep('pin')}
              disabled={enrolledMethods.includes('pin')}
              className={`p-6 border-2 rounded-lg text-center transition-colors ${
                enrolledMethods.includes('pin')
                  ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                  : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="text-4xl mb-2">🔒</div>
              <h3 className="font-semibold">PIN</h3>
              {enrolledMethods.includes('pin') && (
                <p className="text-xs text-green-600 mt-1">✓ Enrolled</p>
              )}
            </button>
          </div>

          {enrolledMethods.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={onComplete}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Complete Enrollment
              </button>
            </div>
          )}
        </div>
      )}

      {currentStep === 'face' && (
        <div className="space-y-4">
          <button
            onClick={() => setCurrentStep('method')}
            className="text-blue-500 hover:text-blue-700"
          >
            ← Back
          </button>
          <FaceRecognition
            mode="enrollment"
            employeeId={employeeId}
            onSuccess={handleFaceEnrollment}
            onError={(error) => alert(error)}
          />
        </div>
      )}

      {currentStep === 'rfid' && (
        <div className="space-y-4">
          <button
            onClick={() => setCurrentStep('method')}
            className="text-blue-500 hover:text-blue-700"
          >
            ← Back
          </button>
          <div className="p-4 border rounded-lg">
            <label className="block text-sm font-medium mb-2">RFID Tag ID</label>
            <input
              type="text"
              value={rfidTag}
              onChange={(e) => setRfidTag(e.target.value)}
              placeholder="Enter or scan RFID tag ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleRFIDEnrollment}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Enroll RFID Tag
            </button>
          </div>
        </div>
      )}

      {currentStep === 'pin' && (
        <div className="space-y-4">
          <button
            onClick={() => setCurrentStep('method')}
            className="text-blue-500 hover:text-blue-700"
          >
            ← Back
          </button>
          <div className="p-4 border rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN (min 4 characters)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm PIN</label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Confirm PIN"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              onClick={handlePINEnrollment}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Enroll PIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

