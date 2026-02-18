import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('staff'); // 'staff' | 'student'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userInfo = await login(username, password, tab);
      onClose();
      setUsername('');
      setPassword('');
      if (userInfo.user_type === 'staff') {
        navigate('/dashboard');
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
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* 모달 */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 탭 */}
        <div className="flex border-b border-gray-200 rounded-t-xl overflow-hidden">
          <button
            onClick={() => { setTab('staff'); setError(''); }}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              tab === 'staff'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            선생 / 조교
          </button>
          <button
            onClick={() => { setTab('student'); setError(''); }}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              tab === 'student'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            학생
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-800 text-center">
            {tab === 'staff' ? '선생 / 조교 로그인' : '학생 로그인'}
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
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
