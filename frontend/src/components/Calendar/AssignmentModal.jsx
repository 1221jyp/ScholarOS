import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { instructorAPI, instructorAssignmentAPI } from '../../services/api';
import { formatDate, formatTime } from '../../utils/dateHelpers';

const AssignmentModal = ({ isOpen, onClose, session, date, onSuccess }) => {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInstructors();
    }
  }, [isOpen]);

  const fetchInstructors = async () => {
    try {
      const res = await instructorAPI.getAll({ status: 'active' });
      setInstructors(res.data);
    } catch (error) {
      console.error('조교 목록 조회 실패:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedInstructorId) {
      alert('조교를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      await instructorAssignmentAPI.create({
        study_session_id: session.id,
        instructor_id: selectedInstructorId,
        assignment_date: formatDate(date),
        is_confirmed: true,
        notes: notes || null,
      });

      alert('조교 배치가 완료되었습니다.');
      setSelectedInstructorId('');
      setNotes('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('조교 배치 실패:', error);
      alert(error.response?.data?.detail || '조교 배치에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">조교 배치</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 배치 정보 */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="text-sm text-gray-600">
              <span className="font-medium">날짜:</span> {formatDate(date, 'yyyy년 MM월 dd일 (E)')}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">자습 시간:</span> {session.name}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">시간:</span> {formatTime(session.start_time)} -{' '}
              {formatTime(session.end_time)}
            </div>
          </div>

          {/* 조교 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              조교 선택 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedInstructorId}
              onChange={(e) => setSelectedInstructorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">조교를 선택하세요</option>
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name}
                  {instructor.specialization && ` (${instructor.specialization})`}
                </option>
              ))}
            </select>
          </div>

          {/* 특이사항 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              특이사항 (선택)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="특이사항을 입력하세요"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '배치 중...' : '배치 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentModal;
