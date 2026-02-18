import { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, GraduationCap } from 'lucide-react';
import { studentAPI, instructorAPI, studySessionAPI, gradeAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeInstructors: 0,
    studySessions: 0,
    totalGrades: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [students, instructors, sessions, grades] = await Promise.all([
        studentAPI.getAll(),
        instructorAPI.getAll(),
        studySessionAPI.getAll(),
        gradeAPI.getAll(),
      ]);

      setStats({
        totalStudents: students.data.length,
        activeInstructors: instructors.data.filter(i => i.status === 'active').length,
        studySessions: sessions.data.filter(s => s.is_active).length,
        totalGrades: grades.data.length,
      });
    } catch (error) {
      console.error('통계 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: Users,
      label: '전체 학생',
      value: stats.totalStudents,
      color: 'blue',
    },
    {
      icon: UserCheck,
      label: '활성 조교',
      value: stats.activeInstructors,
      color: 'green',
    },
    {
      icon: Calendar,
      label: '자습 시간',
      value: stats.studySessions,
      color: 'purple',
    },
    {
      icon: GraduationCap,
      label: '성적 기록',
      value: stats.totalGrades,
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
        <p className="text-gray-600">ScholarOS 학원 관리 시스템 개요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-orange-50 text-orange-600',
          };

          return (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '-' : card.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 안내 메시지 */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-2">
          ScholarOS에 오신 것을 환영합니다! 👋
        </h3>
        <p className="text-primary-700 mb-4">
          수학 학원 관리를 위한 시스템입니다. 핵심 기능은 자습 시간 조교 배치 관리입니다.
        </p>
        <div className="space-y-2 text-sm text-primary-600">
          <div>✅ 좌측 메뉴에서 <strong>조교 배치 관리</strong>를 클릭하여 시작하세요</div>
          <div>✅ 학생, 조교, 출석, 성적 관리도 가능합니다</div>
          <div>✅ 모든 데이터는 백엔드 API와 실시간 동기화됩니다</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
