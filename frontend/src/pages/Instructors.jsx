import { useState, useEffect } from 'react';
import { UserCheck, Phone, Copy, Check } from 'lucide-react';
import { instructorAPI } from '../services/api';

const Instructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const res = await instructorAPI.getAll();
      setInstructors(res.data);
    } catch (error) {
      console.error('조교 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAccount = async (instructorId, accountNumber) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedId(instructorId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
    };
    const labels = {
      active: '활성',
      inactive: '비활성',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">조교 관리</h1>
          </div>
          <p className="text-gray-600">등록된 조교(강사) 목록을 관리합니다.</p>
        </div>
      </div>

      {/* 조교 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : instructors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            등록된 조교가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    은행명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    계좌번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    시급
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {instructors.map((instructor) => (
                  <tr key={instructor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {instructor.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        {instructor.phone ? (
                          <>
                            <Phone className="w-3 h-3" />
                            {instructor.phone}
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {instructor.bank_name || <span className="text-gray-400">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {instructor.account_number ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-gray-900">
                            {instructor.account_number}
                          </span>
                          <button
                            onClick={() => handleCopyAccount(instructor.id, instructor.account_number)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="계좌번호 복사"
                          >
                            {copiedId === instructor.id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {instructor.hourly_rate ? (
                          <span className="font-medium text-primary-600">
                            {Number(instructor.hourly_rate).toLocaleString('ko-KR')}원
                          </span>
                        ) : (
                          <span className="text-gray-400">미설정</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(instructor.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Instructors;
