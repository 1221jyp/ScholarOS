import { LogIn, BookOpen, Calendar, Users, ClipboardCheck, GraduationCap, FileText } from 'lucide-react';

export default function StaffLandingPage({ onLoginClick }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-primary-50 flex flex-col">
      {/* 헤더 */}
      <header className="px-8 py-4 flex items-center justify-between border-b-2 border-primary-500 bg-white/90 backdrop-blur shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="Study Clinic Premium"
            className="h-14 w-auto"
          />
          <div className="border-l-2 border-primary-500 pl-4">
            <h1 className="text-xl font-bold text-accent-700">Study Clinic Premium</h1>
            <p className="text-xs text-gray-500">Since 2007</p>
          </div>
        </div>
        <button
          onClick={onLoginClick}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg"
        >
          <LogIn className="w-4 h-4" />
          로그인
        </button>
      </header>

      {/* 히어로 */}
      <main className="flex-1 flex flex-col items-center justify-center gap-12 px-8 py-16 text-center">
        <div className="flex flex-col gap-6 max-w-2xl">
          <div className="inline-block mx-auto px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
            프리미엄 수학 학원 관리 시스템
          </div>
          <h2 className="text-5xl font-bold text-accent-700 leading-tight">
            Study Clinic Premium<br />
            <span className="text-primary-600">통합 관리 시스템</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            2007년부터 함께한 Study Clinic Premium의<br />
            조교 배치, 학생 출석, 성적, 시험 관리를 하나의 시스템에서.
          </p>
          <button
            onClick={onLoginClick}
            className="mx-auto mt-4 flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-lg rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <LogIn className="w-5 h-5" />
            지금 시작하기
          </button>
        </div>

        {/* 기능 카드 */}
        <div className="grid grid-cols-2 gap-5 max-w-xl w-full sm:grid-cols-3 sm:max-w-3xl">
          {[
            { icon: Calendar, label: '조교 배치', desc: '자습 시간 관리' },
            { icon: Users, label: '학생 관리', desc: '학생 정보' },
            { icon: ClipboardCheck, label: '출석 관리', desc: '출석 체크' },
            { icon: GraduationCap, label: '성적 관리', desc: '성적 기록' },
            { icon: FileText, label: '시험 관리', desc: '시험 출제' },
            { icon: BookOpen, label: '학습 관리', desc: '종합 분석' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center gap-3 bg-white rounded-2xl p-6 shadow-md border-2 border-primary-100 hover:border-primary-300 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 group-hover:from-primary-600 group-hover:to-primary-700 transition-all shadow-md">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-accent-700">{label}</span>
                <span className="text-xs text-gray-500">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t-2 border-primary-200 bg-gradient-to-r from-primary-50 to-orange-50 py-6">
        <p className="text-center text-sm font-medium text-accent-600">
          Study Clinic Premium
        </p>
        <p className="text-center text-xs text-gray-400 mt-1">
          Since 2007 · Premium Math Academy Management System
        </p>
      </footer>
    </div>
  );
}
