'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface NameSearchProps {
  onSelect?: (employee: Employee) => void;
  onCheckIn?: (employeeId: string) => void;
}

export default function NameSearch({ onSelect, onCheckIn }: NameSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Employee[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [pin, setPin] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchEmployees();
    } else {
      setResults([]);
    }
  }, [searchTerm]);

  const searchEmployees = async () => {
    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/employees`, {
        params: { search: searchTerm, limit: 10 },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setResults(response.data.employees || []);
    } catch (error) {
      console.error('Error searching employees:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSearchTerm(`${employee.first_name} ${employee.last_name}`);
    setResults([]);
    onSelect?.(employee);
  };

  const handleCheckIn = async () => {
    if (!selectedEmployee) return;

    setIsCheckingIn(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/attendance/checkin/manual`,
        {
          employee_id: selectedEmployee.employee_id,
          pin: pin || undefined,
        }
      );

      if (response.data) {
        alert(`Checked in successfully! Welcome, ${selectedEmployee.first_name}`);
        onCheckIn?.(selectedEmployee.id);
        // Reset form
        setSelectedEmployee(null);
        setSearchTerm('');
        setPin('');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Check-in failed';
      alert(errorMessage);
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4">Manual Check-In</h3>

      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Employee
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type employee name or ID..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!!selectedEmployee}
          />
        </div>

        {/* Search Results */}
        {!selectedEmployee && searchTerm.length >= 2 && (
          <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            ) : results.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {results.map((employee) => (
                  <li
                    key={employee.id}
                    onClick={() => handleSelectEmployee(employee)}
                    className="p-3 hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="font-medium">
                      {employee.first_name} {employee.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {employee.employee_id} | {employee.email}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No employees found
              </div>
            )}
          </div>
        )}

        {/* Selected Employee */}
        {selectedEmployee && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="font-medium text-lg mb-2">
              {selectedEmployee.first_name} {selectedEmployee.last_name}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Employee ID: {selectedEmployee.employee_id}
            </div>

            {/* PIN Input (Optional) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN (Optional)
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN if required"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleCheckIn}
                disabled={isCheckingIn}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {isCheckingIn ? 'Checking In...' : 'Check In'}
              </button>
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setSearchTerm('');
                  setPin('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

