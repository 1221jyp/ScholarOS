import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import WeeklyCalendar from '../components/Calendar/WeeklyCalendar';
import AssignmentModal from '../components/Calendar/AssignmentModal';

const InstructorAssignments = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const calendarRef = useRef(null);

  const handleAddAssignment = (session, date) => {
    setSelectedSession(session);
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
    setSelectedDate(null);
  };

  const handleAssignmentSuccess = () => {
    // 캘린더 새로고침
    if (calendarRef.current && calendarRef.current.fetchData) {
      calendarRef.current.fetchData();
    }
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="w-6 h-6 md:w-8 md:h-8 text-primary-600" />
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">조교 배치 관리</h1>
          </div>
          <p className="text-sm md:text-base text-gray-600">
            자습 시간에 투입될 조교를 배치하고 관리합니다.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/study-sessions')}
          className="shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-2 md:px-4 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          일정 추가
        </button>
      </div>

      {/* 안내 카드 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">사용 방법</h3>
        <ul className="space-y-1 text-sm text-blue-700">
          <li>• 캘린더에서 원하는 날짜와 자습 시간을 확인하세요</li>
          <li>• "조교 추가" 버튼을 클릭하여 조교를 배치하세요</li>
          <li>• 배치된 조교 위에 마우스를 올려 삭제 버튼을 확인할 수 있습니다</li>
          <li>• 좌우 화살표로 다른 주를 조회할 수 있습니다</li>
        </ul>
      </div>

      {/* 캘린더 */}
      <WeeklyCalendar
        ref={calendarRef}
        onAddAssignment={handleAddAssignment}
      />

      {/* 조교 배치 모달 */}
      {selectedSession && selectedDate && (
        <AssignmentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          session={selectedSession}
          date={selectedDate}
          onSuccess={handleAssignmentSuccess}
        />
      )}
    </div>
  );
};

export default InstructorAssignments;
