import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  ClipboardCheck,
  GraduationCap,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { icon: LayoutDashboard, label: '대시보드', path: '/' },
    { icon: Calendar, label: '조교 배치 관리', path: '/assignments', highlight: true },
    { icon: Users, label: '학생 관리', path: '/students' },
    { icon: UserCheck, label: '조교 관리', path: '/instructors' },
    { icon: ClipboardCheck, label: '출석 관리', path: '/attendance' },
    { icon: GraduationCap, label: '성적 관리', path: '/grades' },
  ];

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* 모바일 닫기 버튼 */}
          <div className="lg:hidden p-4 border-b border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 네비게이션 */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${item.highlight ? 'border-l-4 border-primary-500' : ''}`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="ml-auto text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                      핵심
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* 푸터 */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              ScholarOS v2.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
