import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LoginModal from './components/Common/LoginModal';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import InstructorAssignments from './pages/InstructorAssignments';
import StudySessions from './pages/StudySessions';
import Students from './pages/Students';
import Instructors from './pages/Instructors';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import AdminUsers from './pages/AdminUsers';
import StudentHome from './pages/StudentHome';
import LandingPage from './pages/LandingPage';
import StaffLandingPage from './pages/StaffLandingPage';
import Exams from './pages/Exams';
import ExamCreate from './pages/ExamCreate';
import ExamSubmissions from './pages/ExamSubmissions';
import InstructorTimeManagement from './pages/InstructorTimeManagement';
import InstructorSettlement from './pages/InstructorSettlement';

// 로그인 모달 전역 컨트롤 (401 이벤트 수신)
function AppRoutes() {
  const [loginModal, setLoginModal] = useState({ isOpen: false, userType: 'student' });
  const { user, loading } = useAuth();

  // 401 응답 시 로그인 모달 오픈
  useEffect(() => {
    const handler = (e) => setLoginModal({ isOpen: true, userType: e.detail?.userType || 'student' });
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  if (loading) return null;

  return (
    <>
      <LoginModal
        isOpen={loginModal.isOpen}
        onClose={() => setLoginModal({ ...loginModal, isOpen: false })}
        userType={loginModal.userType}
      />
      <Routes>
        {/* 학생 로그인 페이지 */}
        <Route
          path="/"
          element={
            user
              ? <Navigate to={user.user_type === 'student' ? '/student' : '/admin/dashboard'} replace />
              : <LandingPage onLoginClick={() => setLoginModal({ isOpen: true, userType: 'student' })} />
          }
        />

        {/* 선생/조교 로그인 페이지 */}
        <Route
          path="/admin-login"
          element={
            user
              ? <Navigate to={user.user_type === 'student' ? '/student' : '/admin/dashboard'} replace />
              : <StaffLandingPage onLoginClick={() => setLoginModal({ isOpen: true, userType: 'staff' })} />
          }
        />

        {/* 학생 전용 */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredType="student">
              <StudentHome />
            </ProtectedRoute>
          }
        />

        {/* 직원(원장+조교) 전용 */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredType="staff">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="assignments" element={<InstructorAssignments />} />
          <Route path="study-sessions" element={<StudySessions />} />
          <Route path="students" element={<Students />} />
          <Route path="instructors" element={<Instructors />} />
          <Route path="time-management" element={<InstructorTimeManagement />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="grades" element={<Grades />} />
          <Route path="exams" element={<Exams />} />
          <Route path="exams/create" element={<ExamCreate />} />
          <Route path="exams/:examId/submissions" element={<ExamSubmissions />} />
          {/* 원장 전용 */}
          <Route
            path="settlement"
            element={
              <ProtectedRoute requiredType="director">
                <InstructorSettlement />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute requiredType="director">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
