import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Calendar, DollarSign, Edit2, Trash2, CheckCircle, X } from 'lucide-react';
import { timeRecordAPI } from '../services/api';

const getKoreaToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());

const InstructorTimeManagement = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payroll, setPayroll] = useState(null);
  const [dateRange, setDateRange] = useState(() => {
    const today = getKoreaToday();
    const monthStart = today.slice(0, 8) + '01';
    return { start: monthStart, end: today };
  });
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({ work_date: '', clock_in: '', clock_out: '', notes: '' });

  useEffect(() => {
    fetchRecords();
    fetchPayroll();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await timeRecordAPI.getAll();
      setRecords(res.data);
    } catch (error) {
      console.error('기록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayroll = async () => {
    try {
      const res = await timeRecordAPI.getPayroll({
        start_date: dateRange.start,
        end_date: dateRange.end,
      });
      setPayroll(res.data);
    } catch (error) {
      console.error('급여 계산 실패:', error);
    }
  };

  const handleClockIn = async () => {
    try {
      await timeRecordAPI.clockIn();
      fetchRecords();
    } catch (error) {
      alert(error.response?.data?.detail || '출근 기록에 실패했습니다.');
    }
  };

  const handleClockOut = async () => {
    try {
      await timeRecordAPI.clockOut();
      fetchRecords();
      fetchPayroll();
    } catch (error) {
      alert(error.response?.data?.detail || '퇴근 기록에 실패했습니다.');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setEditForm({
      work_date: record.work_date,
      clock_in: record.clock_in ? record.clock_in.substring(0, 5) : '',
      clock_out: record.clock_out ? record.clock_out.substring(0, 5) : '',
      notes: record.notes || '',
    });
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        work_date: editForm.work_date || undefined,
        clock_in: editForm.clock_in || undefined,
        clock_out: editForm.clock_out || undefined,
        notes: editForm.notes,
      };
      await timeRecordAPI.update(editingRecord.id, payload);
      setEditingRecord(null);
      fetchRecords();
      fetchPayroll();
    } catch (error) {
      alert(error.response?.data?.detail || '수정에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('이 기록을 삭제하시겠습니까?')) return;
    try {
      await timeRecordAPI.delete(id);
      fetchRecords();
      fetchPayroll();
    } catch (error) {
      alert(error.response?.data?.detail || '삭제에 실패했습니다.');
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    return timeStr.substring(0, 5);
  };

  const formatNumber = (num) => {
    if (num == null) return '0';
    return Number(num).toLocaleString('ko-KR');
  };

  const today = getKoreaToday();
  const todayRecords = records.filter(r => r.work_date === today);
  const hasOpenRecord = todayRecords.some(r => r.clock_in && !r.clock_out);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-8 h-8 text-primary-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">시간 관리</h1>
          <p className="text-gray-600">출퇴근 기록 및 급여 계산</p>
        </div>
      </div>

      {/* 출퇴근 버튼 섹션 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">오늘 출퇴근 ({today})</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleClockIn}
            className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-xl hover:bg-green-700 active:scale-95 transition-all shadow-md"
          >
            <LogIn className="w-6 h-6" />
            출근
          </button>
          <button
            onClick={handleClockOut}
            disabled={!hasOpenRecord}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <LogOut className="w-6 h-6" />
            퇴근
          </button>
        </div>

        {todayRecords.length > 0 && (
          <div className="space-y-2">
            {todayRecords.map((r) => (
              <div key={r.id} className="bg-gray-50 px-4 py-3 rounded-lg flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700 w-28">
                  {formatTime(r.clock_in)} ~ {formatTime(r.clock_out)}
                </span>
                {r.clock_in && !r.clock_out && (
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">진행중</span>
                )}
                {r.hours_worked && (
                  <span className="text-xs text-primary-600">{formatNumber(r.hours_worked)}h</span>
                )}
                {r.is_approved && (
                  <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full ml-auto">
                    <CheckCircle className="w-3 h-3" /> 정산완료
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 급여 계산 섹션 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          급여 계산
        </h2>
        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">시작일:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">종료일:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            />
          </div>
          <button
            onClick={fetchPayroll}
            className="px-4 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
          >
            조회
          </button>
        </div>
        {payroll && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">시급</p>
              <p className="text-xl font-bold text-gray-900">
                {payroll.hourly_rate ? `${formatNumber(payroll.hourly_rate)}원` : '미설정'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">총 근무시간</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(payroll.total_hours)}h</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-700 mb-1">미정산 ({formatNumber(payroll.pending_hours)}h)</p>
              <p className="text-xl font-bold text-orange-600">{formatNumber(payroll.pending_pay)}원</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 mb-1">정산완료 ({formatNumber(payroll.approved_hours)}h)</p>
              <p className="text-xl font-bold text-green-600">{formatNumber(payroll.approved_pay)}원</p>
            </div>
          </div>
        )}
      </div>

      {/* 근무 기록 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            근무 기록
          </h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-gray-500">근무 기록이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">출근</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">퇴근</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">근무시간</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">정산</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">비고</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className={`hover:bg-gray-50 ${record.is_approved ? 'bg-green-50/40' : ''}`}>
                    <td className="px-6 py-4 text-sm text-gray-900">{record.work_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatTime(record.clock_in)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatTime(record.clock_out)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-primary-600">
                      {record.hours_worked ? `${formatNumber(record.hours_worked)}h` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {record.is_approved ? (
                        <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full w-fit">
                          <CheckCircle className="w-3 h-3" /> 정산완료
                        </span>
                      ) : (
                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">미정산</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.notes || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      {record.is_approved ? (
                        <span className="text-xs text-gray-400">잠금</span>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" /> 수정
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> 삭제
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 수정 모달 */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">근무 기록 수정</h3>
              <button onClick={() => setEditingRecord(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                <input
                  type="date"
                  value={editForm.work_date}
                  onChange={(e) => setEditForm({ ...editForm, work_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">출근 시간</label>
                  <input
                    type="time"
                    value={editForm.clock_in}
                    onChange={(e) => setEditForm({ ...editForm, clock_in: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">퇴근 시간</label>
                  <input
                    type="time"
                    value={editForm.clock_out}
                    onChange={(e) => setEditForm({ ...editForm, clock_out: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비고</label>
                <input
                  type="text"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="비고 (선택)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingRecord(null)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorTimeManagement;
