'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import FaceRecognition from '@/components/auth/FaceRecognition';

interface FaceImageManagerProps {
  employeeId: string;
  employeeName: string;
  onUpdate?: () => void;
}

export default function FaceImageManager({
  employeeId,
  employeeName,
  onUpdate,
}: FaceImageManagerProps) {
  const [faceImages, setFaceImages] = useState<Array<{ index: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string>('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchFaceImages();
  }, [employeeId]);

  const fetchFaceImages = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/api/employees/${employeeId}/face-images`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFaceImages(response.data.encodings || []);
    } catch (error: any) {
      console.error('Error fetching face images:', error);
      setError(error.response?.data?.error || 'Failed to load face images');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFace = async (imageData: string) => {
    setAdding(true);
    setError('');
    try {
      await axios.post(
        `${API_URL}/api/employees/${employeeId}/enroll`,
        {
          method_type: 'face',
          method_data: imageData,
          is_primary: false,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowAddForm(false);
      fetchFaceImages();
      onUpdate?.();
    } catch (error: any) {
      console.error('Error adding face image:', error);
      setError(error.response?.data?.error || 'Failed to add face image');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveFace = async (index: number) => {
    if (!confirm(`Are you sure you want to remove face image #${index + 1}?`)) {
      return;
    }

    setError('');
    try {
      await axios.delete(`${API_URL}/api/employees/${employeeId}/face-images/${index}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFaceImages();
      onUpdate?.();
    } catch (error: any) {
      console.error('Error removing face image:', error);
      setError(error.response?.data?.error || 'Failed to remove face image');
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-center py-4">Loading face images...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Face Recognition Images</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
        >
          {showAddForm ? 'Cancel' : '+ Add Face Image'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Face Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Add New Face Image</h4>
          <p className="text-sm text-gray-600 mb-4">
            Capture a new face image for {employeeName}. Multiple images improve recognition accuracy.
          </p>
          <FaceRecognition
            mode="enrollment"
            employeeId={employeeId}
            onCapture={handleAddFace}
            onSuccess={() => {
              // Success handled in handleAddFace
            }}
            onError={(err) => {
              setError('Face capture failed: ' + err);
            }}
          />
        </div>
      )}

      {/* Face Images List */}
      {faceImages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No face images enrolled</p>
          <p className="text-sm">Add face images to enable face recognition check-in</p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            {faceImages.length} face image{faceImages.length !== 1 ? 's' : ''} enrolled
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {faceImages.map((image, index) => (
              <div
                key={index}
                className="relative p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <div className="text-4xl">👤</div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Image #{index + 1}</p>
                  {faceImages.length > 1 && (
                    <button
                      onClick={() => handleRemoveFace(index)}
                      className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {faceImages.length === 1 && (
            <p className="mt-4 text-sm text-blue-600">
              💡 Tip: Add more face images from different angles to improve recognition accuracy
            </p>
          )}
        </div>
      )}
    </div>
  );
}

