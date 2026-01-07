'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface FaceRecognitionProps {
  onSuccess?: (employeeId: string, employeeName: string) => void;
  onError?: (error: string) => void;
  mode?: 'checkin' | 'enrollment';
  employeeId?: string;
}

export default function FaceRecognition({
  onSuccess,
  onError,
  mode = 'checkin',
  employeeId,
}: FaceRecognitionProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    return () => {
      // Cleanup: stop camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setMessage('Camera started. Position your face in the frame.');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setMessage('Error accessing camera. Please check permissions.');
      onError?.('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setMessage('');
  };

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    setIsProcessing(true);
    setMessage('Processing...');

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        if (mode === 'checkin') {
          // Check-in mode: recognize face
          await checkInWithFace(imageData);
        } else {
          // Enrollment mode: enroll face
          await enrollFace(imageData);
        }
      }
    } catch (error: any) {
      console.error('Error processing face:', error);
      setMessage('Error processing face. Please try again.');
      onError?.(error.message || 'Face processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const checkInWithFace = async (imageData: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/attendance/checkin/face`, {
        image: imageData,
      });

      if (response.data && response.data.employee) {
        setMessage(`Welcome, ${response.data.employee.name}!`);
        onSuccess?.(
          response.data.employee.id,
          response.data.employee.name
        );
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Face not recognized';
      setMessage(errorMessage);
      onError?.(errorMessage);
    }
  };

  const enrollFace = async (imageData: string) => {
    if (!employeeId) {
      throw new Error('Employee ID is required for enrollment');
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/employees/${employeeId}/enroll`,
        {
          method_type: 'face',
          method_data: imageData,
          is_primary: true,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setMessage('Face enrolled successfully!');
      onSuccess?.(employeeId, '');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Enrollment failed';
      setMessage(errorMessage);
      onError?.(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold">
        {mode === 'checkin' ? 'Face Recognition Check-In' : 'Face Enrollment'}
      </h3>

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full max-w-md rounded-lg ${
            isStreaming ? 'border-4 border-green-500' : 'border-4 border-gray-300'
          }`}
          style={{ display: isStreaming ? 'block' : 'none' }}
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {!isStreaming && (
          <div className="w-full max-w-md h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Camera not started</p>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.includes('Error') || message.includes('not recognized')
              ? 'bg-red-100 text-red-700'
              : message.includes('success')
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex space-x-4">
        {!isStreaming ? (
          <button
            onClick={startCamera}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Start Camera
          </button>
        ) : (
          <>
            <button
              onClick={captureAndProcess}
              disabled={isProcessing}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : mode === 'checkin' ? 'Check In' : 'Capture Face'}
            </button>
            <button
              onClick={stopCamera}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Stop Camera
            </button>
          </>
        )}
      </div>
    </div>
  );
}

