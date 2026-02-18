import axios from 'axios';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 학생 API
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// 강사(조교) API
export const instructorAPI = {
  getAll: (params) => api.get('/instructors', { params }),
  getById: (id) => api.get(`/instructors/${id}`),
  create: (data) => api.post('/instructors', data),
  update: (id, data) => api.put(`/instructors/${id}`, data),
  delete: (id) => api.delete(`/instructors/${id}`),
};

// 수업 시간표 API
export const classScheduleAPI = {
  getAll: (params) => api.get('/class-schedules', { params }),
  getById: (id) => api.get(`/class-schedules/${id}`),
  create: (data) => api.post('/class-schedules', data),
  update: (id, data) => api.put(`/class-schedules/${id}`, data),
  delete: (id) => api.delete(`/class-schedules/${id}`),
};

// 자습 시간 API
export const studySessionAPI = {
  getAll: (params) => api.get('/study-sessions', { params }),
  getById: (id) => api.get(`/study-sessions/${id}`),
  create: (data) => api.post('/study-sessions', data),
  update: (id, data) => api.put(`/study-sessions/${id}`, data),
  delete: (id) => api.delete(`/study-sessions/${id}`),
};

// 조교 배치 API ⭐ 핵심
export const instructorAssignmentAPI = {
  getAll: (params) => api.get('/instructor-assignments', { params }),
  getById: (id) => api.get(`/instructor-assignments/${id}`),
  getWeekly: (startDate) => api.get('/instructor-assignments/by-week', { params: { start_date: startDate } }),
  create: (data) => api.post('/instructor-assignments', data),
  update: (id, data) => api.put(`/instructor-assignments/${id}`, data),
  delete: (id) => api.delete(`/instructor-assignments/${id}`),
};

// 출석 API
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getById: (id) => api.get(`/attendance/${id}`),
  create: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
};

// 성적 API
export const gradeAPI = {
  getAll: (params) => api.get('/grades', { params }),
  getById: (id) => api.get(`/grades/${id}`),
  getByStudent: (studentId) => api.get(`/grades/student/${studentId}`),
  create: (data) => api.post('/grades', data),
  update: (id, data) => api.put(`/grades/${id}`, data),
  delete: (id) => api.delete(`/grades/${id}`),
};

export default api;
