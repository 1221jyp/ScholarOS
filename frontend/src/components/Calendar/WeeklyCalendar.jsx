import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { getWeekDates, formatDate, getDayOfWeekKorean, formatTime } from '../../utils/dateHelpers';
import { studySessionAPI, instructorAssignmentAPI, instructorAPI } from '../../services/api';

// 17:00 ~ 22:00, 30분 단위 슬롯
const TIME_SLOTS = [
  '17:00', '17:30',
  '18:00', '18:30',
  '19:00', '19:30',
  '20:00', '20:30',
  '21:00', '21:30',
  '22:00',
];

const timeToMinutes = (timeStr) => {
  const parts = (timeStr || '00:00').slice(0, 5).split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
};

// 해당 요일/슬롯에 맞는 자습 시간 정보 반환
const getSessionForSlot = (dayOfWeek, slotTime, sessions) => {
  const slotMinutes = timeToMinutes(slotTime);
  for (const session of sessions) {
    if (session.day_of_week !== dayOfWeek) continue;
    const startMinutes = timeToMinutes(session.start_time);
    const endMinutes = timeToMinutes(session.end_time);
    if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
      const isStart = slotMinutes === startMinutes;
      const rowspan = Math.ceil((endMinutes - startMinutes) / 30);
      return { session, isStart, rowspan };
    }
  }
  return null;
};

const WeeklyCalendar = forwardRef(({ onAddAssignment }, ref) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [instructors, setInstructors] = useState({});
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({ fetchData }));

  useEffect(() => {
    setWeekDates(getWeekDates(currentWeekStart));
  }, [currentWeekStart]);

  useEffect(() => {
    if (weekDates.length > 0) fetchData();
  }, [weekDates]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, instructorsRes] = await Promise.all([
        studySessionAPI.getAll(),
        instructorAPI.getAll(),
      ]);
      setStudySessions(sessionsRes.data);

      const instructorMap = {};
      instructorsRes.data.forEach((i) => { instructorMap[i.id] = i; });
      setInstructors(instructorMap);

      const startDate = formatDate(weekDates[0]);
      const assignmentsRes = await instructorAssignmentAPI.getWeekly(startDate);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const goToNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const goToThisWeek = () => setCurrentWeekStart(new Date());

  const getAssignmentsForCell = (date, sessionId) => {
    const dateStr = formatDate(date);
    return assignments.filter(
      (a) => a.assignment_date === dateStr && a.study_session_id === sessionId
    );
  };

  const handleDelete = async (assignmentId) => {
    if (!confirm('이 배치를 삭제하시겠습니까?')) return;
    try {
      await instructorAssignmentAPI.delete(assignmentId);
      fetchData();
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('이 자습 시간 블록을 삭제하시겠습니까?\n해당 블록의 모든 조교 배치도 삭제됩니다.')) return;
    try {
      await studySessionAPI.delete(sessionId);
      fetchData();
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  // 월~금만 사용 (index 0~4)
  const weekdays = weekDates.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 헤더: 주 이동 */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-4">
        <button onClick={goToPreviousWeek} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">
          {weekdays[0] && formatDate(weekdays[0], 'yyyy년 MM월 dd일')}
          {' – '}
          {weekdays[4] && formatDate(weekdays[4], 'MM월 dd일')}
        </h2>
        <button onClick={goToNextWeek} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={goToThisWeek}
          className="px-3 py-1 text-sm bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
        >
          이번 주
        </button>
        {loading && (
          <span className="ml-auto text-sm text-gray-400">로딩 중...</span>
        )}
      </div>

      {/* 시간 기반 그리드 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {/* 시간 열 헤더 */}
              <th className="w-20 bg-gray-50 border-b border-r border-gray-200 px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                시간
              </th>
              {weekdays.map((date, idx) => (
                <th
                  key={idx}
                  className="border-b border-r border-gray-200 px-3 py-3 text-center bg-gray-50 min-w-[160px]"
                >
                  <div className="font-semibold text-gray-700">
                    {getDayOfWeekKorean(idx)}요일
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {formatDate(date, 'M월 d일')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot}>
                {/* 시간 레이블 */}
                <td className="border-b border-r border-gray-200 px-3 py-2 text-center text-xs text-gray-500 bg-gray-50 align-top h-16 whitespace-nowrap">
                  {slot}
                </td>

                {weekdays.map((date, dayIdx) => {
                  const info = getSessionForSlot(dayIdx, slot, studySessions);

                  // 자습 시간 중간 슬롯 → rowspan으로 이미 처리되어 있으므로 렌더링 건너뜀
                  if (info && !info.isStart) return null;

                  // 자습 시간 없는 빈 슬롯
                  if (!info) {
                    return (
                      <td
                        key={dayIdx}
                        className="border-b border-r border-gray-200 bg-gray-50 h-16"
                      />
                    );
                  }

                  // 자습 시간 시작 슬롯 → rowspan으로 병합
                  const { session, rowspan } = info;
                  const cellAssignments = getAssignmentsForCell(date, session.id);
                  // 각 슬롯 높이 = 4rem(h-16), rowspan만큼 높이 확보됨
                  return (
                    <td
                      key={dayIdx}
                      rowSpan={rowspan}
                      className="border-b border-r border-gray-200 p-2 align-top bg-blue-50"
                    >
                      <div className="flex flex-col gap-1.5 h-full">
                        {/* 세션 이름 + 시간 + 삭제 버튼 */}
                        <div className="flex items-start justify-between">
                          <div className="text-xs font-semibold text-blue-700">
                            {session.name}
                            <span className="font-normal text-blue-400 ml-1">
                              {formatTime(session.start_time)}–{formatTime(session.end_time)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className="ml-1 flex-shrink-0 text-blue-300 hover:text-red-500 transition-colors"
                            title="블록 삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* 배치된 조교 */}
                        {cellAssignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="flex items-center justify-between bg-white border border-blue-200 rounded px-2 py-1 group"
                          >
                            <span className="text-xs font-medium text-blue-800">
                              {instructors[assignment.instructor_id]?.name ?? '...'}
                            </span>
                            <button
                              onClick={() => handleDelete(assignment.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                            >
                              <Trash2 className="w-3 h-3 text-red-400 hover:text-red-600" />
                            </button>
                          </div>
                        ))}

                        {/* 조교 추가 버튼 */}
                        <button
                          onClick={() => onAddAssignment && onAddAssignment(session, date)}
                          className="flex items-center justify-center gap-1 w-full border-2 border-dashed border-blue-300 rounded px-2 py-1 text-xs text-blue-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-100 transition-colors mt-auto"
                        >
                          <Plus className="w-3 h-3" />
                          조교 추가
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

WeeklyCalendar.displayName = 'WeeklyCalendar';

export default WeeklyCalendar;
