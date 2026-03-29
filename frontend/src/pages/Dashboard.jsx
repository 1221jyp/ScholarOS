import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  UserCheck,
  ClipboardCheck,
  GraduationCap,
  FileText,
  ArrowRight,
  LogIn,
  LogOut,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { studentAPI, instructorAPI, studySessionAPI, timeRecordAPI } from '../services/api';

const getKoreaToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());

const formatTime = (t) => (t ? t.substring(0, 5) : '--:--');
const formatNum = (n) => (n == null ? '0' : Number(n).toLocaleString('ko-KR'));

// 조교 전용 출퇴근 위젯
const ClockWidget = () => {
  const [records, setRecords] = useState([]);
  const today = getKoreaToday();

  const fetchRecords = async () => {
    try {
      const res = await timeRecordAPI.getAll();
      setRecords(res.data);
    } catch {}
  };

  useEffect(() => { fetchRecords(); }, []);

  const todayRecords = records.filter(r => r.work_date === today);
  const hasOpen = todayRecords.some(r => r.clock_in && !r.clock_out);

  const handleClockIn = async () => {
    try {
      await timeRecordAPI.clockIn();
      fetchRecords();
    } catch (e) {
      alert(e.response?.data?.detail || '출근 기록 실패');
    }
  };

  const handleClockOut = async () => {
    try {
      await timeRecordAPI.clockOut();
      fetchRecords();
    } catch (e) {
      alert(e.response?.data?.detail || '퇴근 기록 실패');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-primary-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-800">오늘 출퇴근</h2>
        <span className="text-xs text-gray-400">{today}</span>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={handleClockIn}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold rounded-xl shadow transition-all text-sm"
        >
          <LogIn className="w-5 h-5" /> 출근
        </button>
        <button
          onClick={handleClockOut}
          disabled={!hasOpen}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold rounded-xl shadow transition-all text-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
        >
          <LogOut className="w-5 h-5" /> 퇴근
        </button>
      </div>

      {todayRecords.length > 0 ? (
        <div className="space-y-1.5">
          {todayRecords.map(r => (
            <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
              <span className="font-medium text-gray-700">
                {formatTime(r.clock_in)} ~ {formatTime(r.clock_out)}
              </span>
              <div className="flex items-center gap-2">
                {r.hours_worked && (
                  <span className="text-xs text-primary-600">{formatNum(r.hours_worked)}h</span>
                )}
                {r.clock_in && !r.clock_out ? (
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">진행중</span>
                ) : r.is_approved ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center py-1">오늘 기록 없음</p>
      )}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isInstructor } = useAuth();
  const [stats, setStats] = useState({ totalStudents: 0, activeInstructors: 0, studySessions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [students, instructors, sessions] = await Promise.all([
        studentAPI.getAll(),
        instructorAPI.getAll(),
        studySessionAPI.getAll(),
      ]);
      setStats({
        totalStudents: students.data.length,
        activeInstructors: instructors.data.filter(i => i.status === 'active').length,
        studySessions: sessions.data.filter(s => s.is_active).length,
      });
    } catch {}
    finally { setLoading(false); }
  };

  const quickLinks = [
    { icon: Calendar, label: '조교 배치 관리', desc: '자습 시간별 조교 배치', path: '/admin/assignments', color: 'primary' },
    { icon: Users, label: '학생 관리', desc: '학생 정보 및 관리', path: '/admin/students', color: 'blue' },
    { icon: UserCheck, label: '조교 관리', desc: '조교 목록 및 관리', path: '/admin/instructors', color: 'green' },
    { icon: ClipboardCheck, label: '출석 관리', desc: '학생 출석 체크', path: '/admin/attendance', color: 'purple' },
    { icon: GraduationCap, label: '성적 관리', desc: '학생 성적 기록', path: '/admin/grades', color: 'orange' },
    { icon: FileText, label: '시험지 관리', desc: '시험 출제 및 관리', path: '/admin/exams', color: 'pink' },
  ];

  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 group-hover:bg-primary-600',
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600',
    green: 'bg-green-50 text-green-600 group-hover:bg-green-600',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600',
    orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600',
    pink: 'bg-pink-50 text-pink-600 group-hover:bg-pink-600',
  };

  return (
    <div className="space-y-5 md:space-y-8">
      {/* 환영 메시지 */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 md:p-8 text-white shadow-lg">
        <h1 className="text-xl md:text-3xl font-bold mb-1">
          환영합니다, {user?.name}님! 👋
        </h1>
        <p className="text-primary-100 text-sm md:text-base">
          Study Clinic Premium 관리 시스템입니다.
        </p>
      </div>

      {/* 조교: 출퇴근 위젯 */}
      {isInstructor && <ClockWidget />}

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm border-2 border-blue-100 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <span className="text-xs md:text-sm text-gray-600 hidden sm:block">전체 학생</span>
          </div>
          <p className="text-xs text-gray-500 sm:hidden mb-1">전체 학생</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{loading ? '-' : stats.totalStudents}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-2 border-green-100 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-50 flex items-center justify-center">
              <UserCheck className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            </div>
            <span className="text-xs md:text-sm text-gray-600 hidden sm:block">활성 조교</span>
          </div>
          <p className="text-xs text-gray-500 sm:hidden mb-1">활성 조교</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{loading ? '-' : stats.activeInstructors}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-2 border-purple-100 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
            </div>
            <span className="text-xs md:text-sm text-gray-600 hidden sm:block">자습 시간</span>
          </div>
          <p className="text-xs text-gray-500 sm:hidden mb-1">자습 시간</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{loading ? '-' : stats.studySessions}</p>
        </div>
      </div>

      {/* 빠른 액세스 */}
      <div>
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">빠른 액세스</h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="group bg-white rounded-xl shadow-sm border-2 border-gray-100 hover:border-primary-300 p-4 md:p-6 text-left transition-all hover:shadow-md active:scale-95"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${colorClasses[link.color]}`}>
                    <Icon className="w-5 h-5 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5 flex items-center gap-1">
                      <span className="truncate">{link.label}</span>
                      <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0 group-hover:text-primary-600 transition-colors" />
                    </h3>
                    <p className="text-xs text-gray-500 hidden sm:block">{link.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
