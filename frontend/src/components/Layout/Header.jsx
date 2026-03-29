import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ROLE_LABELS = { director: '원장', instructor: '조교' };

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b-2 border-primary-500 px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-accent-700" />
        </button>
        <img
          src="/logo.png"
          alt="Study Clinic Premium"
          className="h-10 md:h-12 w-auto"
        />
        <div className="border-l-2 border-primary-500 pl-3 ml-2 hidden md:block">
          <h1 className="text-xl font-bold text-accent-700">Study Clinic Premium</h1>
          <span className="text-xs text-gray-500">관리 시스템</span>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-accent-700">{user.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 font-medium">
              {user.role ? ROLE_LABELS[user.role] ?? user.role : '학생'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
            {user.name?.charAt(0) ?? '?'}
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-primary-50 rounded-lg transition-colors text-gray-400 hover:text-primary-600"
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
