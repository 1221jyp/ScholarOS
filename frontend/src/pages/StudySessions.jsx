import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar } from 'lucide-react';
import { studySessionAPI, instructorAssignmentAPI, instructorAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TIME_OPTIONS = [
  '09:00', '09:30',
  '10:00', '10:30',
  '11:00', '11:30',
  '12:00', '12:30',
  '13:00', '13:30',
  '14:00', '14:30',
  '15:00', '15:30',
  '16:00', '16:30',
  '17:00', '17:30',
  '18:00', '18:30',
  '19:00', '19:30',
  '20:00', '20:30',
  '21:00', '21:30',
  '22:00',
];

const DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일'];

// 날짜 문자열(yyyy-MM-dd)에서 요일 추출 (0=월, 6=일)
const getDayOfWeek = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const jsDay = d.getDay(); // 0=Sun, 1=Mon...
  return jsDay === 0 ? 6 : jsDay - 1;
};

const today = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const StudySessions = () => {
  const navigate = useNavigate();
  const { user, isInstructor } = useAuth();
  const [instructors, setInstructors] = useState([]);
  const [form, setForm] = useState({
    name: '',
    date: today(),
    start_time: '20:00',
    end_time: '22:00',
    instructor_id: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    instructorAPI.getAll().then((res) => setInstructors(res.data)).catch(() => {});
    // 조교인 경우 자신을 자동 선택
    if (isInstructor && user?.instructor_id) {
      setForm((prev) => ({ ...prev, instructor_id: user.instructor_id }));
    }
  }, [isInstructor, user]);

  const endTimeOptions = TIME_OPTIONS.filter((t) => t > form.start_time);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.instructor_id) {
      setError('조교를 선택해주세요.');
      return;
    }
    if (form.start_time >= form.end_time) {
      setError('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const dayOfWeek = getDayOfWeek(form.date);

      // 1. 동일한 요일/시간의 자습 시간이 이미 있는지 확인
      const sessionsRes = await studySessionAPI.getAll();
      let session = sessionsRes.data.find(
        (s) =>
          s.day_of_week === dayOfWeek &&
          s.start_time.slice(0, 5) === form.start_time &&
          s.end_time.slice(0, 5) === form.end_time
      );

      // 없으면 새로 생성
      if (!session) {
        const res = await studySessionAPI.create({
          name: form.name.trim() || `자습 (${DAY_NAMES[dayOfWeek]}요일 ${form.start_time}~${form.end_time})`,
          day_of_week: dayOfWeek,
          start_time: form.start_time + ':00',
          end_time: form.end_time + ':00',
          max_instructors: 1,
        });
        session = res.data;
      }

      // 2. 조교 배치 생성
      await instructorAssignmentAPI.create({
        study_session_id: session.id,
        instructor_id: form.instructor_id,
        assignment_date: form.date,
      });

      navigate('/admin/assignments');
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const dayOfWeek = form.date ? getDayOfWeek(form.date) : null;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <button
          onClick={() => navigate('/admin/assignments')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          조교 배치 관리로 돌아가기
        </button>
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">일정 추가</h1>
        </div>
        <p className="text-gray-600">날짜와 시간을 선택하고 배치할 조교를 지정하세요.</p>
      </div>

      {/* 폼 */}
      <div className="bg-white rounded-lg shadow p-6 max-w-lg">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              자습 이름
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="예: 야간 자습, 수학 보충 자습"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-400">비워두면 자동으로 이름이 설정됩니다.</p>
          </div>

          {/* 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              날짜 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {dayOfWeek !== null && (
              <p className="mt-1 text-xs text-gray-400">{DAY_NAMES[dayOfWeek]}요일</p>
            )}
          </div>

          {/* 시작 시간 / 종료 시간 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 시간 <span className="text-red-500">*</span>
              </label>
              <select
                value={form.start_time}
                onChange={(e) =>
                  setForm({
                    ...form,
                    start_time: e.target.value,
                    // 종료 시간이 시작 시간 이하면 다음 슬롯으로
                    end_time:
                      form.end_time <= e.target.value
                        ? TIME_OPTIONS[TIME_OPTIONS.indexOf(e.target.value) + 1] || form.end_time
                        : form.end_time,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {TIME_OPTIONS.slice(0, -1).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료 시간 <span className="text-red-500">*</span>
              </label>
              <select
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {endTimeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 조교 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              조교 선택 <span className="text-red-500">*</span>
              {isInstructor && <span className="ml-2 text-xs text-gray-500">(본인 고정)</span>}
            </label>
            {instructors.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">
                등록된 조교가 없습니다.{' '}
                <button
                  type="button"
                  onClick={() => navigate('/admin/users')}
                  className="text-primary-600 hover:underline"
                >
                  사용자 관리
                </button>
                에서 먼저 추가해주세요.
              </p>
            ) : (
              <select
                value={form.instructor_id}
                onChange={(e) => setForm({ ...form, instructor_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isInstructor}
              >
                <option value="">-- 조교를 선택하세요 --</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => navigate('/admin/assignments')}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || instructors.length === 0}
              className="px-5 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? '저장 중...' : '배치 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudySessions;
