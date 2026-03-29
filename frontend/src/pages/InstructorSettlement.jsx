import { useState, useEffect, useCallback } from 'react';
import { Banknote, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { timeRecordAPI } from '../services/api';

const InstructorSettlement = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  // 펼쳐진 조교 상세 기록
  const [expandedInstructor, setExpandedInstructor] = useState(null);
  const [detailRecords, setDetailRecords] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await timeRecordAPI.getSettlementOverview({
        month_start: dateRange.start,
        month_end: dateRange.end,
      });
      setOverview(res.data);
    } catch (error) {
      console.error('정산 개요 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange.start, dateRange.end]);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchDetailRecords = async (instructorId) => {
    setDetailLoading(true);
    try {
      const res = await timeRecordAPI.getAll({
        instructor_id: instructorId,
        start_date: dateRange.start,
        end_date: dateRange.end,
      });
      setDetailRecords(res.data);
    } catch (error) {
      console.error('상세 기록 조회 실패:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleDetail = (instructorId) => {
    if (expandedInstructor === instructorId) {
      setExpandedInstructor(null);
      setDetailRecords([]);
    } else {
      setExpandedInstructor(instructorId);
      fetchDetailRecords(instructorId);
    }
  };

  const handleApprove = async (recordId) => {
    try {
      await timeRecordAPI.approve(recordId);
      fetchDetailRecords(expandedInstructor);
      fetchOverview();
    } catch (error) {
      alert(error.response?.data?.detail || '승인에 실패했습니다.');
    }
  };

  const handleUnapprove = async (recordId) => {
    try {
      await timeRecordAPI.unapprove(recordId);
      fetchDetailRecords(expandedInstructor);
      fetchOverview();
    } catch (error) {
      alert(error.response?.data?.detail || '승인 취소에 실패했습니다.');
    }
  };

  const handleApproveAll = async (instructorId) => {
    const pending = detailRecords.filter(r => !r.is_approved && r.hours_worked);
    if (pending.length === 0) return alert('승인할 기록이 없습니다.');
    if (!confirm(`${pending.length}건을 모두 정산 승인하시겠습니까?`)) return;
    try {
      for (const r of pending) {
        await timeRecordAPI.approve(r.id);
      }
      fetchDetailRecords(instructorId);
      fetchOverview();
    } catch (error) {
      alert('일부 승인에 실패했습니다.');
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return Number(num).toLocaleString('ko-KR');
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    return timeStr.substring(0, 5);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Banknote className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">정산 관리</h1>
          <p className="text-gray-600">조교 근무 기록 확인 및 급여 정산 승인</p>
        </div>
      </div>

      {/* 기간 필터 */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4 flex-wrap items-end">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">시작일:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(d => ({ ...d, start: e.target.value }))}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">종료일:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(d => ({ ...d, end: e.target.value }))}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          />
        </div>
        <button
          onClick={fetchOverview}
          className="px-4 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
        >
          조회
        </button>
        {overview && (
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-500">전체 미정산 합계</p>
            <p className="text-xl font-bold text-orange-600">
              {formatNumber(overview.total_pending_pay)}원
            </p>
          </div>
        )}
      </div>

      {/* 조교별 목록 */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">로딩 중...</div>
      ) : overview?.instructors?.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          등록된 조교가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {overview?.instructors?.map((instr) => (
            <div key={instr.instructor_id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* 조교 요약 행 */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleToggleDetail(instr.instructor_id)}
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{instr.instructor_name}</p>
                  <p className="text-xs text-gray-500">
                    시급: {instr.hourly_rate ? `${formatNumber(instr.hourly_rate)}원` : '미설정'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">미정산</p>
                  <p className="text-sm font-bold text-orange-600">
                    {formatNumber(instr.pending_pay)}원
                  </p>
                  <p className="text-xs text-orange-400">{formatNumber(instr.pending_hours)}h · {instr.pending_records}건</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">정산완료</p>
                  <p className="text-sm font-bold text-green-600">
                    {formatNumber(instr.approved_pay)}원
                  </p>
                  <p className="text-xs text-green-400">{formatNumber(instr.approved_hours)}h</p>
                </div>
                <div className="text-gray-400">
                  {expandedInstructor === instr.instructor_id
                    ? <ChevronUp className="w-5 h-5" />
                    : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* 상세 기록 */}
              {expandedInstructor === instr.instructor_id && (
                <div className="border-t border-gray-200">
                  <div className="p-3 bg-gray-50 flex justify-end">
                    <button
                      onClick={() => handleApproveAll(instr.instructor_id)}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      미정산 전체 승인
                    </button>
                  </div>

                  {detailLoading ? (
                    <div className="p-6 text-center text-gray-500 text-sm">로딩 중...</div>
                  ) : detailRecords.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">기록이 없습니다.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">날짜</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">출근</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">퇴근</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">근무시간</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">금액</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">상태</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">승인</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {detailRecords.map((record) => {
                          const amount = instr.hourly_rate
                            ? (Number(record.hours_worked || 0) * Number(instr.hourly_rate))
                            : null;
                          return (
                            <tr key={record.id} className={record.is_approved ? 'bg-green-50/40' : ''}>
                              <td className="px-4 py-2 text-gray-900">{record.work_date}</td>
                              <td className="px-4 py-2 text-gray-700">{formatTime(record.clock_in)}</td>
                              <td className="px-4 py-2 text-gray-700">{formatTime(record.clock_out)}</td>
                              <td className="px-4 py-2 font-medium text-primary-600">
                                {record.hours_worked ? `${formatNumber(record.hours_worked)}h` : '-'}
                              </td>
                              <td className="px-4 py-2 text-gray-700">
                                {amount != null ? `${formatNumber(amount)}원` : '-'}
                              </td>
                              <td className="px-4 py-2">
                                {record.is_approved ? (
                                  <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full w-fit">
                                    <CheckCircle className="w-3 h-3" /> 정산완료
                                  </span>
                                ) : (
                                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">미정산</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {record.is_approved ? (
                                  <button
                                    onClick={() => handleUnapprove(record.id)}
                                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 mx-auto"
                                    title="승인 취소"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleApprove(record.id)}
                                    disabled={!record.hours_worked}
                                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 mx-auto disabled:text-gray-300 disabled:cursor-not-allowed"
                                    title="승인"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorSettlement;
