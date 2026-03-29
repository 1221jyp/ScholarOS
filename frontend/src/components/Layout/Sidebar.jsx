import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  FileText,
  ShieldCheck,
  Clock,
  Banknote,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { timeRecordAPI } from '../../services/api';

const Sidebar = ({ isOpen, onClose }) => {
  const { isDirector, isInstructor } = useAuth();
  const [mySummary, setMySummary] = useState(null);

  useEffect(() => {
    if (isInstructor) {
      timeRecordAPI.getMySummary()
        .then(res => setMySummary(res.data))
        .catch(() => {});
    }
  }, [isInstructor]);

  const formatMoney = (num) => {
    if (!num) return '0';
    return Number(num).toLocaleString('ko-KR');
  };

  const navItems = [
    { icon: LayoutDashboard, label: '대시보드', path: '/admin/dashboard' },
    { icon: Calendar, label: '조교 배치 관리', path: '/admin/assignments' },
    { icon: Users, label: '학생 목록', path: '/admin/students' },
    { icon: UserCheck, label: '조교 목록', path: '/admin/instructors' },
    { icon: FileText, label: '시험지 관리', path: '/admin/exams' },
    ...(isInstructor ? [{ icon: Clock, label: '시간 관리', path: '/admin/time-management' }] : []),
    ...(isDirector ? [
      { icon: Banknote, label: '정산 관리', path: '/admin/settlement', adminOnly: true },
      { icon: ShieldCheck, label: '사용자 관리', path: '/admin/users', adminOnly: true },
    ] : []),
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
          w-64 bg-gradient-to-b from-white to-gray-50 border-r-2 border-primary-200
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
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                    } ${item.adminOnly ? 'border-l-4 border-purple-400' : ''}`
                  }
                >
                  <Icon className={`w-5 h-5 ${item.adminOnly ? 'text-purple-500' : ''}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* 조교: 이번 달 미정산 요약 */}
          {isInstructor && mySummary && Number(mySummary.pending_hours) > 0 && (
            <div className="mx-4 mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs font-semibold text-orange-700 mb-1">이번 달 미정산</p>
              <p className="text-base font-bold text-orange-600">
                {formatMoney(mySummary.pending_pay)}원
              </p>
              <p className="text-xs text-orange-500">{formatMoney(mySummary.pending_hours)}시간 미승인</p>
            </div>
          )}

          {/* 푸터 */}
          <div className="p-4 border-t-2 border-primary-200 bg-gradient-to-r from-primary-50 to-orange-50">
            <p className="text-xs text-accent-600 text-center font-medium">
              Study Clinic Premium
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              Since 2007
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
