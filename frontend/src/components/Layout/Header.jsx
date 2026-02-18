import { Menu } from 'lucide-react';

const Header = ({ onToggleSidebar }) => {
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
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">관리자</span>
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
          A
        </div>
      </div>
    </header>
  );
};

export default Header;
