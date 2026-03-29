import { LogIn, GraduationCap } from 'lucide-react';

export default function LandingPage({ onLoginClick }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* 로고 & 헤더 */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Study Clinic Premium"
            className="h-20 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-accent-700 mb-2">
            Study Clinic Premium
          </h1>
          <p className="text-gray-600">학생 포털</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-primary-200 p-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">학생 로그인</h2>
              <p className="text-sm text-gray-500">시험 응시 및 학습 관리</p>
            </div>
          </div>

          <button
            onClick={onLoginClick}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-lg rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <LogIn className="w-5 h-5" />
            로그인
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-2">선생님이신가요?</p>
            <a
              href="/admin-login"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              관리자 로그인 →
            </a>
          </div>
        </div>

        {/* 푸터 */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">Since 2007</p>
        </div>
      </div>
    </div>
  );
}
