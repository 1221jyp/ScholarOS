import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * requiredType: 'staff' | 'student' | 'director' | null (인증만 필요)
 */
export default function ProtectedRoute({ children, requiredType = null }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-400 text-sm">로딩 중...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredType === 'director' && user.role !== 'director') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredType === 'staff' && user.user_type !== 'staff') {
    return <Navigate to="/student" replace />;
  }

  if (requiredType === 'student' && user.user_type !== 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
