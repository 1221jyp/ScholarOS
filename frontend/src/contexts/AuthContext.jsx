import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // { id, name, role, user_type }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // 초기 토큰 검증 중

  // 앱 시작 시 localStorage 토큰 복원
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password, userType) => {
    const endpoint = userType === 'staff' ? '/auth/staff/login' : '/auth/student/login';
    const res = await api.post(endpoint, { username, password });
    const data = res.data;

    const userInfo = {
      id: data.user_id,
      name: data.name,
      role: data.role,
      user_type: data.user_type,
      instructor_id: data.instructor_id || null,
    };

    setToken(data.access_token);
    setUser(userInfo);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(userInfo));
    api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

    return userInfo;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  }, []);

  const isDirector = user?.role === 'director';
  const isInstructor = user?.role === 'instructor';
  const isStaff = user?.user_type === 'staff';
  const isStudent = user?.user_type === 'student';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isDirector, isInstructor, isStaff, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
