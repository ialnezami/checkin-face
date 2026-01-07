'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
  position?: string;
  status: 'active' | 'inactive';
}

interface EmployeeSelectorProps {
  onSelect: (employee: Employee) => void;
  token?: string;
}

export default function EmployeeSelector({ onSelect, token }: EmployeeSelectorProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const authToken = token || localStorage.getItem('token');

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = employees.filter(
        (emp) =>
          emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/employees`, {
        params: { limit: 100 },
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });

      const activeEmployees = (response.data.employees || []).filter(
        (emp: Employee) => emp.status === 'active'
      );
      setEmployees(activeEmployees);
      setFilteredEmployees(activeEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Select Employee for Enrollment</h2>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, employee ID, or email..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Employee List */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? (
            <div>
              <p className="mb-2">No employees found matching "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-500 hover:text-blue-700"
              >
                Clear search
              </button>
            </div>
          ) : (
            <p>No active employees found</p>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredEmployees.map((employee) => (
            <button
              key={employee.id}
              onClick={() => onSelect(employee)}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {employee.first_name} {employee.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">ID: {employee.employee_id}</p>
                  <p className="text-sm text-gray-600">{employee.email}</p>
                  {(employee.department || employee.position) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {employee.department && `${employee.department}`}
                      {employee.department && employee.position && ' • '}
                      {employee.position}
                    </p>
                  )}
                </div>
                <div className="text-blue-500 font-semibold">→</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {employees.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing {filteredEmployees.length} of {employees.length} active employees
        </div>
      )}
    </div>
  );
}

