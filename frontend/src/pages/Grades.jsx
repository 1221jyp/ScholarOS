import { GraduationCap } from 'lucide-react';

const Grades = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <GraduationCap className="w-8 h-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">성적 관리</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">성적 관리 기능은 추후 구현 예정입니다.</p>
      </div>
    </div>
  );
};

export default Grades;
