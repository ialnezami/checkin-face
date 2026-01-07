import api from './api';

export const attendanceService = {
  checkInWithFace: async (imageData: string) => {
    const response = await api.post('/api/attendance/checkin/face', { image: imageData });
    return response.data;
  },

  checkInWithRFID: async (tagId: string) => {
    const response = await api.post('/api/attendance/checkin/rfid', { tag_id: tagId });
    return response.data;
  },

  checkInManual: async (employeeId: string, pin?: string) => {
    const response = await api.post('/api/attendance/checkin/manual', {
      employee_id: employeeId,
      pin,
    });
    return response.data;
  },

  checkOut: async (employeeId: string) => {
    const response = await api.post(`/api/attendance/checkout/${employeeId}`);
    return response.data;
  },

  getRecords: async (params?: {
    employee_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/api/attendance', { params });
    return response.data;
  },

  getDashboardData: async () => {
    const response = await api.get('/api/attendance/dashboard');
    return response.data;
  },
};

