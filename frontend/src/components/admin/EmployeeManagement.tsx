'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import FaceRecognition from '@/components/auth/FaceRecognition';
import FaceImageManager from './FaceImageManager';

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
  position?: string;
  status: 'active' | 'inactive';
  authMethods?: Array<{
    method_type: string;
    is_active: boolean;
  }>;
}

interface EmployeeManagementProps {
  token?: string;
}

type FormStep = 'details' | 'face' | 'face-management' | 'complete';

export default function EmployeeManagement({ token }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState<FormStep>('details');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [capturedFaceImage, setCapturedFaceImage] = useState<string | null>(null);
  const [newEmployeeId, setNewEmployeeId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    position: '',
    status: 'active' as 'active' | 'inactive',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const authToken = token || localStorage.getItem('token');

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get(`${API_URL}/api/employees`, {
        params,
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });

      // Fetch auth methods for each employee to show face enrollment status
      const employeesWithMethods = await Promise.all(
        (response.data.employees || []).map(async (emp: Employee) => {
          try {
            const empResponse = await axios.get(`${API_URL}/api/employees/${emp.id}`, {
              headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            });
            return { ...emp, authMethods: empResponse.data.authMethods || [] };
          } catch {
            return { ...emp, authMethods: [] };
          }
        })
      );

      setEmployees(employeesWithMethods);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.employee_id || !formData.first_name || !formData.last_name || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    // Move to face capture step
    setFormStep('face');
  };

  const handleFaceCapture = async (imageData: string) => {
    setCapturedFaceImage(imageData);
    // After face is captured, create employee and enroll face
    await createEmployeeWithFace(imageData);
  };

  const createEmployeeWithFace = async (faceImage: string) => {
    try {
      setLoading(true);
      
      // First create the employee
      const createResponse = await axios.post(`${API_URL}/api/employees`, formData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const employee = createResponse.data;
      setNewEmployeeId(employee.id);

      // Then enroll the face
      if (faceImage) {
        try {
          await axios.post(
            `${API_URL}/api/employees/${employee.id}/enroll`,
            {
              method_type: 'face',
              method_data: faceImage,
              is_primary: true,
            },
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
        } catch (enrollError: any) {
          console.error('Face enrollment error:', enrollError);
          // Employee created but face enrollment failed - show warning
          alert('Employee created successfully, but face enrollment failed. You can enroll face later.');
        }
      }

      // Move to complete step
      setFormStep('complete');
      fetchEmployees();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error creating employee');
      setFormStep('details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEmployee) {
      // Update employee details first, then go to face capture step
      try {
        await axios.put(
          `${API_URL}/api/employees/${editingEmployee.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        // After updating, move to face capture step
        setNewEmployeeId(editingEmployee.id);
        setFormStep('face');
      } catch (error: any) {
        alert(error.response?.data?.error || 'Error updating employee');
      }
    } else {
      // For new employees, go to face capture step
      handleDetailsSubmit(e);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_id: employee.employee_id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      department: employee.department || '',
      position: employee.position || '',
      status: employee.status,
    });
    setFormStep('details');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      await axios.delete(`${API_URL}/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      fetchEmployees();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting employee');
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      first_name: '',
      last_name: '',
      email: '',
      department: '',
      position: '',
      status: 'active',
    });
    setFormStep('details');
    setCapturedFaceImage(null);
    setNewEmployeeId(null);
    setMessage('');
  };

  const handleSkipFace = async () => {
    // Create employee without face
    await createEmployeeWithFace('');
  };

  const updateEmployeeFace = async (employeeId: string, faceImage: string) => {
    try {
      setLoading(true);
      
      // Enroll/update the face (this will replace existing face data if it exists)
      await axios.post(
        `${API_URL}/api/employees/${employeeId}/enroll`,
        {
          method_type: 'face',
          method_data: faceImage,
          is_primary: true,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setMessage('Face recognition updated successfully!');
      setFormStep('complete');
      fetchEmployees();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error updating face recognition');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    setShowForm(false);
    setEditingEmployee(null);
    resetForm();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Employee Management</h2>
        <button
          onClick={() => {
            resetForm();
            setEditingEmployee(null);
            setShowForm(true);
            setFormStep('details');
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search employees..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          {/* Step Indicator */}
          {!editingEmployee && (
            <div className="mb-4 flex items-center justify-center space-x-4">
              <div className={`flex items-center ${formStep === 'details' ? 'text-blue-600 font-semibold' : formStep === 'face' || formStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formStep === 'details' ? 'bg-blue-500 text-white' : formStep === 'face' || formStep === 'complete' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                  1
                </div>
                <span className="ml-2">Details</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center ${formStep === 'face' ? 'text-blue-600 font-semibold' : formStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formStep === 'face' ? 'bg-blue-500 text-white' : formStep === 'complete' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                  2
                </div>
                <span className="ml-2">Face</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center ${formStep === 'complete' ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formStep === 'complete' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                  ✓
                </div>
                <span className="ml-2">Complete</span>
              </div>
            </div>
          )}

          {/* Details Step */}
          {formStep === 'details' && (
            <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-semibold mb-4">
                {editingEmployee ? 'Edit Employee' : 'Step 1: Employee Details'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee ID *</label>
                  <input
                    type="text"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value.toUpperCase() })}
                    required
                    disabled={!!editingEmployee}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="EMP001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  {editingEmployee ? 'Update & Add/Update Face' : 'Next: Capture Face'}
                </button>
                {editingEmployee && (
                  <button
                    type="button"
                    onClick={async () => {
                      // Update without face
                      try {
                        await axios.put(
                          `${API_URL}/api/employees/${editingEmployee.id}`,
                          formData,
                          {
                            headers: { Authorization: `Bearer ${authToken}` },
                          }
                        );
                        setShowForm(false);
                        setEditingEmployee(null);
                        resetForm();
                        fetchEmployees();
                      } catch (error: any) {
                        alert(error.response?.data?.error || 'Error updating employee');
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Update Without Face
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEmployee(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Face Capture Step */}
          {formStep === 'face' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingEmployee ? 'Update Face Recognition' : 'Step 2: Face Recognition Enrollment'}
                </h3>
                <button
                  onClick={() => {
                    if (editingEmployee) {
                      // For editing, go back to details and complete
                      setShowForm(false);
                      setEditingEmployee(null);
                      resetForm();
                      fetchEmployees();
                    } else {
                      setFormStep('details');
                    }
                  }}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  {editingEmployee ? 'Skip' : '← Back to Details'}
                </button>
              </div>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Employee:</strong> {formData.first_name} {formData.last_name} ({formData.employee_id})
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {editingEmployee 
                    ? 'Capture a new face image to update the face recognition data. This will replace the existing face data.'
                    : 'Position the employee\'s face in the camera frame and click "Capture Face"'}
                </p>
              </div>
              <FaceRecognition
                mode="enrollment"
                employeeId={newEmployeeId || editingEmployee?.id || 'temp'}
                onCapture={async (imageData) => {
                  setCapturedFaceImage(imageData);
                  if (editingEmployee && newEmployeeId) {
                    // Update face for existing employee (after details were updated)
                    await updateEmployeeFace(newEmployeeId, imageData);
                  } else if (!editingEmployee) {
                    // Create new employee with face
                    handleFaceCapture(imageData);
                  }
                }}
                onSuccess={(employeeId, employeeName) => {
                  // Success handled in handleFaceCapture or updateEmployeeFace
                }}
                onError={(error) => {
                  console.error('Face capture error:', error);
                  setMessage('Face capture failed: ' + error);
                }}
              />
              <div className="mt-4 flex space-x-2">
                {!editingEmployee && (
                  <button
                    onClick={handleSkipFace}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Skip Face Enrollment (Add Later)
                  </button>
                )}
                {editingEmployee && (
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingEmployee(null);
                      resetForm();
                      fetchEmployees();
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Skip Face Update
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Face Management Step */}
          {formStep === 'face-management' && editingEmployee && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Manage Face Images</h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingEmployee(null);
                    resetForm();
                  }}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  ← Back to List
                </button>
              </div>
              <FaceImageManager
                employeeId={editingEmployee.id}
                employeeName={`${editingEmployee.first_name} ${editingEmployee.last_name}`}
                onUpdate={() => {
                  fetchEmployees();
                }}
              />
            </div>
          )}

          {/* Complete Step */}
          {formStep === 'complete' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-semibold mb-2 text-green-600">
                {editingEmployee ? 'Employee Updated Successfully!' : 'Employee Created Successfully!'}
              </h3>
              <p className="text-gray-600 mb-4">
                {formData.first_name} {formData.last_name} ({formData.employee_id}) has been {editingEmployee ? 'updated' : 'added'}.
                {capturedFaceImage ? ' Face recognition has been enrolled.' : ' You can enroll face recognition later.'}
              </p>
              {message && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  {message}
                </div>
              )}
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}

      {/* Employee List */}
      {loading && !showForm ? (
        <div className="text-center py-8">Loading...</div>
      ) : employees.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No employees found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">ID</th>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Department</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="border p-2">{employee.employee_id}</td>
                  <td className="border p-2">
                    {employee.first_name} {employee.last_name}
                  </td>
                  <td className="border p-2">{employee.email}</td>
                  <td className="border p-2">{employee.department || '-'}</td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        employee.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td className="border p-2 text-center">
                    {employee.authMethods?.some(m => m.method_type === 'face' && m.is_active) ? (
                      <span className="text-green-600 font-semibold">✓</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="border p-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setEditingEmployee(employee);
                          setFormStep('face-management');
                          setShowForm(true);
                        }}
                        className="px-2 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                        title="Manage face images"
                      >
                        👤 Faces
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
