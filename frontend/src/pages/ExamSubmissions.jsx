import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Users } from 'lucide-react';
import { examAPI } from '../services/api';

const ExamSubmissions = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [examTitle, setExamTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await examAPI.staffGetSubmissions(examId);
        setSubmissions(res.data);
        if (res.data.length > 0) setExamTitle(res.data[0].exam_title);
        else {
          const examRes = await examAPI.staffGet(examId);
          setExamTitle(examRes.data.title);
        }
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [examId]);

  const typeLabel = (type) => (type === 'multiple_choice' ? '객관식' : '주관식');

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <button
          onClick={() => navigate('/admin/exams')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          시험지 목록으로
        </button>
        <div className="flex items-center gap-3 mb-1">
          <Users className="w-7 h-7 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">제출 현황</h1>
        </div>
        {examTitle && (
          <p className="text-gray-500 text-sm ml-10">{examTitle}</p>
        )}
      </div>

      {/* 목록 */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">불러오는 중...</div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">아직 제출한 학생이 없습니다.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {submissions.map((sub) => (
              <li key={sub.id}>
                {/* 요약 행 */}
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{sub.student_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(sub.submitted_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <div className="text-sm text-gray-700 flex gap-4 flex-shrink-0">
                    {sub.total_mc > 0 && (
                      <span>
                        객관식{' '}
                        <span className="font-semibold text-primary-600">
                          {sub.auto_score}/{sub.total_mc}
                        </span>
                      </span>
                    )}
                    {sub.total_sa > 0 && (
                      <span className="text-gray-400">주관식 {sub.total_sa}문제</span>
                    )}
                  </div>
                  <ChevronLeft
                    className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
                      expanded === sub.id ? '-rotate-90' : 'rotate-180'
                    }`}
                  />
                </button>

                {/* 상세 답안 */}
                {expanded === sub.id && (
                  <div className="px-6 pb-4 bg-gray-50 border-t border-gray-100">
                    <table className="w-full text-sm mt-3">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b border-gray-200">
                          <th className="text-left pb-2 w-12">번호</th>
                          <th className="text-left pb-2 w-16">유형</th>
                          <th className="text-left pb-2">제출 답</th>
                          <th className="text-left pb-2">정답</th>
                          <th className="text-left pb-2 w-16">결과</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {sub.answers.map((ans) => (
                          <tr key={ans.question_number}>
                            <td className="py-1.5 text-gray-600">{ans.question_number}</td>
                            <td className="py-1.5 text-gray-400">{typeLabel(ans.question_type)}</td>
                            <td className="py-1.5 font-medium text-gray-800">{ans.answer}</td>
                            <td className="py-1.5 text-gray-600">{ans.correct_answer}</td>
                            <td className="py-1.5">
                              {ans.is_correct === null ? (
                                <span className="text-xs text-gray-400">–</span>
                              ) : ans.is_correct ? (
                                <span className="text-xs font-semibold text-green-600">정답</span>
                              ) : (
                                <span className="text-xs font-semibold text-red-500">오답</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExamSubmissions;
