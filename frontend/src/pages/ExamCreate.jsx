import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Plus, Minus } from 'lucide-react';
import { examAPI } from '../services/api';

const MAX_QUESTIONS = 30;

const defaultQuestion = (number) => ({
  question_number: number,
  question_type: 'multiple_choice',
  correct_answer: '',
});

const ExamCreate = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState(
    Array.from({ length: 5 }, (_, i) => defaultQuestion(i + 1))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateCount = (newCount) => {
    const clamped = Math.max(1, Math.min(MAX_QUESTIONS, newCount));
    setQuestionCount(clamped);
    setQuestions((prev) => {
      if (clamped > prev.length) {
        const extras = Array.from(
          { length: clamped - prev.length },
          (_, i) => defaultQuestion(prev.length + i + 1)
        );
        return [...prev, ...extras];
      }
      return prev.slice(0, clamped);
    });
  };

  const setType = (idx, type) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === idx ? { ...q, question_type: type, correct_answer: '' } : q
      )
    );
  };

  const setAnswer = (idx, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, correct_answer: value } : q))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    for (const q of questions) {
      if (!q.correct_answer.trim()) {
        setError(`${q.question_number}번 문제의 정답을 입력해주세요.`);
        return;
      }
      if (
        q.question_type === 'multiple_choice' &&
        !['1', '2', '3', '4', '5'].includes(q.correct_answer.trim())
      ) {
        setError(`${q.question_number}번 문제는 객관식이므로 정답이 1~5 중 하나여야 합니다.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await examAPI.staffCreate({ title: title.trim(), questions });
      navigate('/admin/exams');
    } catch (err) {
      setError(err.response?.data?.detail ?? '저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <button
          onClick={() => navigate('/admin/exams')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          시험지 관리로 돌아가기
        </button>
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">시험 생성</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 시험 제목 */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            시험 제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="예) 2월 4주차 수학 시험"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* 문제 수 설정 */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            문제 수 <span className="text-gray-400 font-normal">(최대 {MAX_QUESTIONS}개)</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateCount(questionCount - 1)}
              disabled={questionCount <= 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min={1}
              max={MAX_QUESTIONS}
              value={questionCount}
              onChange={(e) => updateCount(parseInt(e.target.value) || 1)}
              className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={() => updateCount(questionCount + 1)}
              disabled={questionCount >= MAX_QUESTIONS}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-500">문제</span>
          </div>
        </div>

        {/* 문제별 정답 입력 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">정답 입력</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              각 문제의 유형과 정답을 설정하세요. 객관식은 1~5 중 하나, 주관식은 직접 입력합니다.
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {questions.map((q, idx) => (
              <div key={q.question_number} className="flex items-center gap-4 px-6 py-3">
                {/* 번호 */}
                <span className="w-8 text-sm font-semibold text-gray-600 text-right flex-shrink-0">
                  {q.question_number}.
                </span>

                {/* 유형 토글 */}
                <div className="flex rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setType(idx, 'multiple_choice')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      q.question_type === 'multiple_choice'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    객관식
                  </button>
                  <button
                    type="button"
                    onClick={() => setType(idx, 'short_answer')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      q.question_type === 'short_answer'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    주관식
                  </button>
                </div>

                {/* 정답 입력 */}
                {q.question_type === 'multiple_choice' ? (
                  <div className="flex gap-1.5 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setAnswer(idx, String(n))}
                        className={`w-9 h-9 rounded-full text-sm font-semibold border-2 transition-colors ${
                          q.correct_answer === String(n)
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
                    value={q.correct_answer}
                    onChange={(e) => setAnswer(idx, e.target.value)}
                    placeholder="정답 입력"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 에러 & 버튼 */}
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/exams')}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? '저장 중...' : '시험 저장'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExamCreate;
