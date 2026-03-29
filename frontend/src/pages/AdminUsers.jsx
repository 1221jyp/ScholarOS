import { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, Users, GraduationCap, DollarSign } from 'lucide-react';
import { authAPI, instructorAPI } from '../services/api';

const ROLE_LABELS = { director: '원장', instructor: '조교' };

const EMPTY_FORM = { username: '', password: '', name: '', phone: '', role: 'instructor', bank_name: '', account_number: '' };

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState('staff');
  const [staffUsers, setStaffUsers] = useState([]);
  const [studentUsers, setStudentUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [hourlyModal, setHourlyModal] = useState(null); // { user, hourlyRate }
  const [hourlyInput, setHourlyInput] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [staffRes, studentRes] = await Promise.all([
        authAPI.listStaffUsers(),
        authAPI.listStudentUsers(),
      ]);
      setStaffUsers(staffRes.data);
      setStudentUsers(studentRes.data);
    } catch {
      // 조용히 실패
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (activeTab === 'staff') {
        await authAPI.createStaffUser({
          username: form.username,
          password: form.password,
          name: form.name,
          phone: form.phone || null,
          role: form.role,
          bank_name: form.bank_name || null,
          account_number: form.account_number || null,
        });
      } else {
        await authAPI.createStudentUser({
          username: form.username,
          password: form.password,
          name: form.name,
          phone: form.phone || null,
        });
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.detail ?? '생성에 실패했습니다.');
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('이 계정을 삭제하시겠습니까?\n연결된 학생/조교 데이터도 함께 삭제됩니다.')) return;
    try {
      if (type === 'staff') {
        await authAPI.deleteStaffUser(id);
      } else {
        await authAPI.deleteStudentUser(id);
      }
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.detail ?? '삭제에 실패했습니다.');
    }
  };

  const openHourlyModal = async (user) => {
    try {
      const res = await instructorAPI.getById(user.instructor_id);
      setHourlyInput(String(res.data.hourly_rate ?? 11000));
      setHourlyModal({ user });
    } catch {
      alert('조교 정보를 불러오지 못했습니다.');
    }
  };

  const handleSaveHourlyRate = async () => {
    try {
      await instructorAPI.update(hourlyModal.user.instructor_id, { hourly_rate: Number(hourlyInput) });
      setHourlyModal(null);
    } catch {
      alert('시급 저장에 실패했습니다.');
    }
  };

  const handleToggleActive = async (user, type) => {
    try {
      if (type === 'staff') {
        await authAPI.updateStaffUser(user.id, { is_active: !user.is_active });
      } else {
        await authAPI.updateStudentUser(user.id, { is_active: !user.is_active });
      }
      fetchAll();
    } catch {
      alert('변경에 실패했습니다.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 시급 관리 모달 */}
      {hourlyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80">
            <h2 className="text-base font-semibold text-gray-800 mb-1">시급 관리</h2>
            <p className="text-sm text-gray-500 mb-4">{hourlyModal.user.name} 조교</p>
            <div className="flex flex-col gap-1 mb-4">
              <label className="text-xs font-medium text-gray-600">시급 (원)</label>
              <input
                type="number"
                value={hourlyInput}
                onChange={(e) => setHourlyInput(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="11000"
                min="0"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setHourlyModal(null)}
                className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={handleSaveHourlyRate}
                className="px-4 py-1.5 text-sm text-white bg-primary-600 rounded hover:bg-primary-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">사용자 관리</h1>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={fetchAll}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="새로고침"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => { setShowForm(true); setFormError(''); setForm(EMPTY_FORM); }}
            className="whitespace-nowrap flex items-center gap-1.5 px-3 py-2 md:px-4 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            계정 생성
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => { setActiveTab('staff'); setShowForm(false); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'staff'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4" />
          직원 계정 ({staffUsers.length})
        </button>
        <button
          onClick={() => { setActiveTab('student'); setShowForm(false); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'student'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          학생 계정 ({studentUsers.length})
        </button>
      </div>

      {/* 계정 생성 폼 */}
      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            {activeTab === 'staff' ? '직원' : '학생'} 계정 생성
          </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">아이디</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="아이디"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">비밀번호</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="비밀번호"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">이름</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="이름"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">전화번호 (선택)</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="010-0000-0000"
              />
            </div>

            {activeTab === 'staff' && (
              <>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs font-medium text-gray-600">역할</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="instructor">조교</option>
                    <option value="director">원장</option>
                  </select>
                </div>

                {form.role === 'instructor' && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-600">은행명 (선택)</label>
                      <input
                        type="text"
                        value={form.bank_name}
                        onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="예: 국민은행"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-600">계좌번호 (선택)</label>
                      <input
                        type="text"
                        value={form.account_number}
                        onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="00000000000"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {formError && (
              <p className="col-span-2 text-sm text-red-500">{formError}</p>
            )}

            <div className="col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-sm text-white bg-primary-600 rounded hover:bg-primary-700 transition-colors"
              >
                생성
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 사용자 목록 */}
      {loading ? (
        <p className="text-center text-gray-400 py-8">로딩 중...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-medium text-gray-600">아이디</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">이름</th>
                {activeTab === 'staff' && (
                  <th className="px-4 py-3 text-left font-medium text-gray-600">역할</th>
                )}
                {activeTab === 'staff' && (
                  <th className="px-4 py-3 text-center font-medium text-gray-600">시급</th>
                )}
                <th className="px-4 py-3 text-center font-medium text-gray-600">상태</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">삭제</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'staff' ? staffUsers : studentUsers).map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-700">{u.username}</td>
                  <td className="px-4 py-3 text-gray-700">{u.name}</td>
                  {activeTab === 'staff' && (
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        u.role === 'director' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                  )}
                  {activeTab === 'staff' && (
                    <td className="px-4 py-3 text-center">
                      {u.role === 'instructor' && u.instructor_id ? (
                        <button
                          onClick={() => openHourlyModal(u)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors mx-auto"
                        >
                          <DollarSign className="w-3 h-3" />
                          시급
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">-</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(u, activeTab)}
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                        u.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'
                      }`}
                    >
                      {u.is_active ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(u.id, activeTab)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {(activeTab === 'staff' ? staffUsers : studentUsers).length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'staff' ? 6 : 4} className="px-4 py-8 text-center text-gray-400">
                    등록된 계정이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
