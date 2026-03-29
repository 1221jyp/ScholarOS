import { useState, useEffect } from 'react';
import { GraduationCap, FileText, ChevronLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { examAPI } from '../services/api';

// ─── 시험 목록 뷰 ───────────────────────────────────────
function ExamList({ onSelect }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    examAPI.studentList()
      .then((r) => setExams(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-400 text-center py-8">불러오는 중...</p>;

  if (exams.length === 0)
    return (
      <div className="text-center py-12">
        <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">출제된 시험이 없습니다.</p>
      </div>
    );

  return (
    <ul className="divide-y divide-gray-100">
      {exams.map((exam) => (
        <li key={exam.id}>
          <button
            type="button"
            onClick={() => onSelect(exam)}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 text-left transition-colors"
          >
            <FileText className="w-5 h-5 text-primary-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{exam.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {exam.question_count}문제 · {new Date(exam.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
            <span className="text-xs text-primary-600">응시하기 →</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

// ─── 시험 응시 뷰 ───────────────────────────────────────
function ExamTake({ examId, examTitle, onBack, onSubmitted }) {
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [alreadyDone, setAlreadyDone] = useState(null);
  const [loadingExam, setLoadingExam] = useState(true);

  useEffect(() => {
    // 전체 시험 정보 로드 (questions 포함)
    examAPI.studentGet(examId)
      .then((r) => setExam(r.data))
      .finally(() => setLoadingExam(false));
    // 이미 제출했는지 확인
    examAPI.studentMySubmission(examId)
      .then((r) => setAlreadyDone(r.data))
      .catch(() => {}); // 404 → 미제출
  }, [examId]);

  if (loadingExam) return <p className="text-sm text-gray-400 text-center py-8">불러오는 중...</p>;
  if (!exam) return <p className="text-sm text-red-400 text-center py-8">시험을 불러올 수 없습니다.</p>;

  const setAnswer = (qNum, val) => setAnswers((prev) => ({ ...prev, [qNum]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const missing = exam.questions.find((q) => !answers[q.question_number]?.trim());
    if (missing) {
      setError(`${missing.question_number}번 문제의 답을 선택/입력해주세요.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        answers: exam.questions.map((q) => ({
          question_number: q.question_number,
          answer: answers[q.question_number].trim(),
        })),
      };
      const res = await examAPI.studentSubmit(examId, payload);
      onSubmitted(res.data);
    } catch (err) {
      setError(err.response?.data?.detail ?? '제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 이미 제출한 경우 결과 표시 (로드 완료 후)
  if (alreadyDone) {
    return <ExamResult result={alreadyDone} onBack={onBack} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <button type="button" onClick={onBack} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-gray-800">{exam.title}</h2>
        <span className="ml-auto text-xs text-gray-400">{exam.questions.length}문제</span>
      </div>

      <div className="divide-y divide-gray-50">
        {exam.questions.map((q) => (
          <div key={q.question_number} className="py-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {q.question_number}번
              <span className="ml-2 text-xs text-gray-400">
                {q.question_type === 'multiple_choice' ? '객관식' : '주관식'}
              </span>
            </p>
            {q.question_type === 'multiple_choice' ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setAnswer(q.question_number, String(n))}
                    className={`w-10 h-10 rounded-full text-sm font-semibold border-2 transition-colors ${
                      answers[q.question_number] === String(n)
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-primary-400'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={answers[q.question_number] ?? ''}
                onChange={(e) => setAnswer(q.question_number, e.target.value)}
                placeholder="답 입력"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? '제출 중...' : '답안 제출'}
        </button>
      </div>
    </form>
  );
}

// ─── 제출 결과 뷰 ───────────────────────────────────────
function ExamResult({ result, onBack }) {
  const typeLabel = (t) => (t === 'multiple_choice' ? '객관식' : '주관식');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <button type="button" onClick={onBack} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-gray-800">{result.exam_title} — 결과</h2>
      </div>

      {/* 점수 요약 */}
      <div className="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-lg p-4">
        <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0" />
        <div>
          {result.total_mc > 0 && (
            <p className="text-sm font-semibold text-primary-800">
              객관식 정답 {result.auto_score} / {result.total_mc}
            </p>
          )}
          {result.total_sa > 0 && (
            <p className="text-sm text-primary-600">주관식 {result.total_sa}문제 (선생님 채점)</p>
          )}
          <p className="text-xs text-primary-400 mt-0.5">
            제출: {new Date(result.submitted_at).toLocaleString('ko-KR')}
          </p>
        </div>
      </div>

      {/* 답안 상세 */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-xs text-gray-500 border-b border-gray-200">
            <th className="text-left pb-2 w-12">번호</th>
            <th className="text-left pb-2 w-14">유형</th>
            <th className="text-left pb-2">내 답</th>
            <th className="text-left pb-2">정답</th>
            <th className="text-left pb-2 w-14">결과</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {result.answers.map((ans) => (
            <tr key={ans.question_number}>
              <td className="py-2 text-gray-600">{ans.question_number}</td>
              <td className="py-2 text-gray-400">{typeLabel(ans.question_type)}</td>
              <td className={`py-2 font-medium ${ans.is_correct === false ? 'text-red-600' : 'text-gray-800'}`}>
                {ans.answer}
              </td>
              <td className="py-2 text-gray-600">{ans.correct_answer}</td>
              <td className="py-2">
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
  );
}

// ─── 메인 StudentHome ────────────────────────────────────
export default function StudentHome() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('exams'); // 'exams'
  const [selectedExam, setSelectedExam] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  const handleSubmitted = (result) => {
    setSubmissionResult(result);
  };

  const handleBack = () => {
    setSelectedExam(null);
    setSubmissionResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 바 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary-600" />
          <span className="font-bold text-gray-800">ScholarOS</span>
        </div>
        <span className="ml-auto text-sm text-gray-600">{user?.name}님</span>
        <button
          onClick={logout}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          로그아웃
        </button>
      </header>

      {/* 탭 */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex gap-6">
          <button
            type="button"
            onClick={() => { setTab('exams'); handleBack(); }}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === 'exams'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            시험 응시
          </button>
        </nav>
      </div>

      {/* 본문 */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">
              {submissionResult
                ? '제출 완료'
                : selectedExam
                ? selectedExam.title
                : '시험 목록'}
            </h2>
          </div>
          <div className="p-6">
            {submissionResult ? (
              <ExamResult result={submissionResult} onBack={handleBack} />
            ) : selectedExam ? (
              <ExamTake
                examId={selectedExam.id}
                examTitle={selectedExam.title}
                onBack={handleBack}
                onSubmitted={handleSubmitted}
              />
            ) : (
              <ExamList onSelect={setSelectedExam} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
