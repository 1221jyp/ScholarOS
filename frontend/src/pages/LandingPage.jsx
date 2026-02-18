import { LogIn, BookOpen, Calendar, Users, ClipboardCheck } from 'lucide-react';

export default function LandingPage({ onLoginClick }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col">
      {/* 헤더 */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-primary-600" />
          <h1 className="text-xl font-bold text-gray-800">ScholarOS</h1>
        </div>
        <button
          onClick={onLoginClick}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <LogIn className="w-4 h-4" />
          로그인
        </button>
      </header>

      {/* 히어로 */}
      <main className="flex-1 flex flex-col items-center justify-center gap-10 px-8 py-16 text-center">
        <div className="flex flex-col gap-4 max-w-xl">
          <h2 className="text-4xl font-bold text-gray-800 leading-tight">
            학원 관리,<br />
            <span className="text-primary-600">ScholarOS</span>로 간편하게
          </h2>
          <p className="text-gray-500 text-lg">
            조교 배치, 학생 출석, 성적 관리를<br />하나의 시스템에서.
          </p>
          <button
            onClick={onLoginClick}
            className="mx-auto mt-2 flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-md"
          >
            <LogIn className="w-5 h-5" />
            지금 시작하기
          </button>
        </div>

        {/* 기능 카드 */}
        <div className="grid grid-cols-2 gap-4 max-w-lg w-full sm:grid-cols-4 sm:max-w-2xl">
          {[
            { icon: Calendar, label: '조교 배치 관리', color: 'text-blue-500 bg-blue-50' },
            { icon: Users, label: '학생 관리', color: 'text-green-500 bg-green-50' },
            { icon: ClipboardCheck, label: '출석 관리', color: 'text-orange-500 bg-orange-50' },
            { icon: BookOpen, label: '성적 관리', color: 'text-purple-500 bg-purple-50' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-gray-600 text-center">{label}</span>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-gray-400">
        ScholarOS v2.0
      </footer>
    </div>
  );
}
