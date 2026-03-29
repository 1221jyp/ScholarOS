import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginModal({ isOpen, onClose, userType = 'staff' }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // 모달이 열릴 때 입력 필드 초기화
  useEffect(() => {
    if (isOpen) {
      setError('');
      setUsername('');
      setPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userInfo = await login(username, password, userType);
      onClose();
      setUsername('');
      setPassword('');
      if (userInfo.user_type === 'staff') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.response?.data?.detail ?? '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setUsername('');
    setPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* 모달 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border-2 border-primary-500">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 헤더 with 로고 */}
        <div className="bg-white p-6 text-center border-b-2 border-primary-500">
          <img
            src="/logo.png"
            alt="Study Clinic Premium"
            className="h-16 w-auto mx-auto mb-3"
          />
          <h1 className="text-accent-700 font-bold text-xl">Study Clinic Premium</h1>
          <p className="text-gray-500 text-sm">Since 2007</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-accent-700 text-center">
            {userType === 'staff' ? '선생 / 조교 로그인' : '학생 로그인'}
          </h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="아이디를 입력하세요"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <LogIn className="w-4 h-4" />
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
