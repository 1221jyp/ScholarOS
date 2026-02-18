import axios from 'axios';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 401 응답 시 자동 로그아웃
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      // 로그인 모달을 열기 위해 커스텀 이벤트 발생
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(error);
  }
);

// 인증 API
export const authAPI = {
  staffLogin: (data) => api.post('/auth/staff/login', data),
  studentLogin: (data) => api.post('/auth/student/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/me/password', data),
  // 직원 계정 관리 (원장 전용)
  listStaffUsers: () => api.get('/auth/staff-users'),
  createStaffUser: (data) => api.post('/auth/staff-users', data),
  updateStaffUser: (id, data) => api.put(`/auth/staff-users/${id}`, data),
  deleteStaffUser: (id) => api.delete(`/auth/staff-users/${id}`),
  // 학생 계정 관리 (원장 전용)
  listStudentUsers: () => api.get('/auth/student-users'),
  createStudentUser: (data) => api.post('/auth/student-users', data),
  updateStudentUser: (id, data) => api.put(`/auth/student-users/${id}`, data),
  deleteStudentUser: (id) => api.delete(`/auth/student-users/${id}`),
};

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
