import { GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function StudentHome() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 p-8">
      <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center gap-4 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
          <GraduationCap className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">안녕하세요, {user?.name}님!</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          현재 학생용 기능은 준비 중입니다.
          <br />
          곧 이용하실 수 있습니다.
        </p>
        <button
          onClick={logout}
          className="mt-4 px-6 py-2 text-sm text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
