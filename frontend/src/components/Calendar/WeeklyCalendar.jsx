import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { getWeekDates, formatDate, getDayOfWeekKorean, formatTime } from '../../utils/dateHelpers';
import { studySessionAPI, instructorAssignmentAPI, instructorAPI } from '../../services/api';

// 09:00 ~ 22:00, 30분 단위 슬롯
const TIME_SLOTS = [
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

const UNIT_HEIGHT = 64; // px per 30 minutes
const BASE_MIN = 9 * 60; // 09:00 in minutes

const timeToMinutes = (timeStr) => {
  const parts = (timeStr || '00:00').slice(0, 5).split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
};

// 겹치는 세션들을 열(column)로 분배
const computeLayout = (sessions) => {
  if (!sessions.length) return [];
  const sorted = [...sessions].sort(
    (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
  );
  const colEndTimes = []; // 각 열의 마지막 끝 시간 추적
  const items = sorted.map((session) => {
    const start = timeToMinutes(session.start_time);
    const end = timeToMinutes(session.end_time);
    let colIdx = colEndTimes.findIndex((endTime) => endTime <= start);
    if (colIdx === -1) {
      colIdx = colEndTimes.length;
      colEndTimes.push(end);
    } else {
      colEndTimes[colIdx] = end;
    }
    return { session, colIdx };
  });
  const totalCols = colEndTimes.length || 1;
  return items.map((item) => ({ ...item, totalCols }));
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

  const weekdays = weekDates.slice(0, 7);
  const containerHeight = TIME_SLOTS.length * UNIT_HEIGHT; // 11 * 64 = 704px

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
          {weekdays[6] && formatDate(weekdays[6], 'MM월 dd일')}
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

      {/* 캘린더 본문 */}
      <div className="overflow-x-auto">
        {/* 요일 헤더 */}
        <div className="flex border-b border-gray-200" style={{ minWidth: '900px' }}>
          <div className="w-16 flex-shrink-0 bg-gray-50" />
          {weekdays.map((date, idx) => (
            <div
              key={idx}
              className={`flex-1 px-3 py-3 text-center bg-gray-50 border-l border-gray-200 ${idx === 5 ? 'text-blue-600' : idx === 6 ? 'text-red-600' : ''}`}
            >
              <div className={`font-semibold text-sm ${idx === 5 ? 'text-blue-600' : idx === 6 ? 'text-red-600' : 'text-gray-700'}`}>
                {getDayOfWeekKorean(idx)}요일
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {formatDate(date, 'M월 d일')}
              </div>
            </div>
          ))}
        </div>

        {/* 시간 그리드 */}
        <div className="flex" style={{ minWidth: '900px', height: containerHeight + 'px' }}>
          {/* 시간 레이블 열 */}
          <div className="w-16 flex-shrink-0 relative border-r border-gray-200 bg-gray-50">
            {TIME_SLOTS.map((slot, i) => (
              <div
                key={slot}
                style={{
                  position: 'absolute',
                  top: i * UNIT_HEIGHT + 'px',
                  height: UNIT_HEIGHT + 'px',
                  left: 0,
                  right: 0,
                }}
                className="flex items-start justify-center pt-1 border-b border-gray-200"
              >
                <span className="text-xs text-gray-500 whitespace-nowrap">{slot}</span>
              </div>
            ))}
          </div>

          {/* 요일별 열 */}
          {weekdays.map((date, dayIdx) => {
            const dateStr = formatDate(date);

            // 해당 날짜에 배치가 있는 세션만 표시
            const daySessions = studySessions.filter((s) => {
              if (s.day_of_week !== dayIdx) return false;
              return assignments.some(
                (a) => a.assignment_date === dateStr && a.study_session_id === s.id
              );
            });

            const layout = computeLayout(daySessions);

            return (
              <div
                key={dayIdx}
                className="flex-1 relative border-l border-gray-200"
                style={{ minWidth: 0 }}
              >
                {/* 수평 격자선 */}
                {TIME_SLOTS.map((slot, i) => (
                  <div
                    key={slot}
                    style={{
                      position: 'absolute',
                      top: i * UNIT_HEIGHT + 'px',
                      height: UNIT_HEIGHT + 'px',
                      left: 0,
                      right: 0,
                    }}
                    className="border-b border-gray-100"
                  />
                ))}

                {/* 세션 블록 */}
                {layout.map(({ session, colIdx, totalCols }) => {
                  const startMin = timeToMinutes(session.start_time);
                  const endMin = timeToMinutes(session.end_time);
                  const top = ((startMin - BASE_MIN) / 30) * UNIT_HEIGHT;
                  const height = ((endMin - startMin) / 30) * UNIT_HEIGHT;
                  const widthPct = 100 / totalCols;
                  const leftPct = (colIdx / totalCols) * 100;
                  const cellAssignments = getAssignmentsForCell(date, session.id);

                  return (
                    <div
                      key={session.id}
                      style={{
                        position: 'absolute',
                        top: top + 'px',
                        height: height + 'px',
                        left: `calc(${leftPct}% + 2px)`,
                        width: `calc(${widthPct}% - 4px)`,
                        zIndex: 1,
                      }}
                      className="bg-blue-50 border border-blue-200 rounded p-2 overflow-hidden flex flex-col gap-1"
                    >
                      {/* 세션 헤더 */}
                      <div className="flex items-start justify-between gap-1">
                        <div className="text-xs font-semibold text-blue-700 leading-tight min-w-0">
                          <span className="block truncate">{session.name}</span>
                          <span className="font-normal text-blue-400 whitespace-nowrap">
                            {formatTime(session.start_time)}–{formatTime(session.end_time)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="flex-shrink-0 text-blue-300 hover:text-red-500 transition-colors"
                          title="블록 삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* 배치된 조교 */}
                      <div className="flex flex-col gap-0.5 overflow-y-auto">
                        {cellAssignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="flex items-center justify-between bg-white border border-blue-200 rounded px-1.5 py-0.5 group"
                          >
                            <span className="text-xs font-medium text-blue-800 truncate">
                              {instructors[assignment.instructor_id]?.name ?? '...'}
                            </span>
                            <button
                              onClick={() => handleDelete(assignment.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0"
                            >
                              <Trash2 className="w-3 h-3 text-red-400 hover:text-red-600" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* 조교 추가 버튼 */}
                      <button
                        onClick={() => onAddAssignment && onAddAssignment(session, date)}
                        className="flex items-center justify-center gap-1 w-full border border-dashed border-blue-300 rounded px-1 py-0.5 text-xs text-blue-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-100 transition-colors mt-auto flex-shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        조교 추가
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

WeeklyCalendar.displayName = 'WeeklyCalendar';

export default WeeklyCalendar;
