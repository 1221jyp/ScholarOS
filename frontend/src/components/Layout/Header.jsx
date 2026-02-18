import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ROLE_LABELS = { director: '원장', instructor: '조교' };

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-primary-600">ScholarOS</h1>
        <span className="text-sm text-gray-500">수학 학원 관리 시스템</span>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-gray-700">{user.name}</span>
            <span className="text-xs text-gray-400">
              {user.role ? ROLE_LABELS[user.role] ?? user.role : '학생'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
            {user.name?.charAt(0) ?? '?'}
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-red-500"
            title="로그아웃"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
