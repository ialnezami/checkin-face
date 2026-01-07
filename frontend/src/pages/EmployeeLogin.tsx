'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function EmployeeLoginPage() {
  const [loginMethod, setLoginMethod] = useState<'pin' | 'password'>('pin');
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (loginMethod === 'pin') {
        response = await axios.post(`${API_URL}/api/employee/auth/login`, {
          employee_id: employeeId,
          pin: pin,
        });
      } else {
        response = await axios.post(`${API_URL}/api/employee/auth/login`, {
          username: username,
          password: password,
        });
      }

      if (response.data.token) {
        localStorage.setItem('employeeToken', response.data.token);
        localStorage.setItem('employeeData', JSON.stringify(response.data.employee));
        router.push('/employee/dashboard');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Employee Portal</h2>

        {/* Login Method Toggle */}
        <div className="mb-6 flex space-x-4 border-b">
          <button
            onClick={() => {
              setLoginMethod('pin');
              setError('');
            }}
            className={`px-4 py-2 font-medium ${
              loginMethod === 'pin'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Employee ID + PIN
          </button>
          <button
            onClick={() => {
              setLoginMethod('password');
              setError('');
            }}
            className={`px-4 py-2 font-medium ${
              loginMethod === 'password'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Username + Password
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {loginMethod === 'pin' ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Employee ID</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="EMP001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="4-6 digit PIN"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Don't have credentials? Contact your administrator.
        </p>
      </div>
    </div>
  );
}

