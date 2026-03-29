import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Trash2, ChevronRight } from 'lucide-react';
import { examAPI } from '../services/api';

const Exams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await examAPI.staffList();
      setExams(res.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`"${title}" 시험지를 삭제하시겠습니까?\n모든 제출 기록도 삭제됩니다.`)) return;
    try {
      await examAPI.staffDelete(id);
      setExams((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-6 h-6 md:w-8 md:h-8 text-primary-600" />
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">시험지 관리</h1>
          </div>
          <p className="text-sm md:text-base text-gray-600">시험지를 생성하고 학생 제출 결과를 확인합니다.</p>
        </div>
        <button
          onClick={() => navigate('/admin/exams/create')}
          className="shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-2 md:px-4 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          시험 생성
        </button>
      </div>

      {/* 목록 */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">불러오는 중...</div>
        ) : exams.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">등록된 시험지가 없습니다.</p>
            <button
              onClick={() => navigate('/admin/exams/create')}
              className="mt-4 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              첫 시험지 만들기
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {exams.map((exam) => (
              <li key={exam.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{exam.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {exam.question_count}문제 ·{' '}
                    {new Date(exam.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/admin/exams/${exam.id}/submissions`)}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 transition-colors"
                >
                  제출 현황
                  <ChevronRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(exam.id, exam.title)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Exams;
