import api from './api';

export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
  position?: string;
  status: 'active' | 'inactive';
}

export interface CreateEmployeeInput {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
  position?: string;
}

export const employeeService = {
  getAll: async (params?: { limit?: number; offset?: number; search?: string }) => {
    const response = await api.get('/api/employees', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/employees/${id}`);
    return response.data;
  },

  create: async (data: CreateEmployeeInput) => {
    const response = await api.post('/api/employees', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateEmployeeInput>) => {
    const response = await api.put(`/api/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/employees/${id}`);
    return response.data;
  },

  enrollAuthMethod: async (employeeId: string, methodData: {
    method_type: 'face' | 'fingerprint' | 'rfid' | 'pin';
    method_data: any;
    is_primary?: boolean;
  }) => {
    const response = await api.post(`/api/employees/${employeeId}/enroll`, methodData);
    return response.data;
  },
};

