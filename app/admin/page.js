'use client';
import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

const NOTARIES = ['Trần Văn Châu', 'Lê Văn Giúp', 'Trần Thanh Vũ'];
const DOC_TYPES = ['Mua bán', 'Tặng cho', 'Thuê - mượn', 'Thế chấp', 'Ủy quyền', 'Thừa kế'];
const DRAFTERS = ['Phạm Tiến Dương', 'Trần Lệ Xuân', 'Trần Hồng Ngọc'];
const CLERKS = ['Nguyễn Văn Nhanh', 'Trần Văn Khanh', 'Hà Thanh Tùng'];
const STATUSES = [
  '1. Tiếp nhận yêu cầu', '2. Soạn thảo', '3. Photo', 
  '4. Khách ký', '5. Công chứng viên ký', '6. Đóng dấu', '7. Thu phí và trả hồ sơ'
];

export default function AdminPage() {
  const [formData, setFormData] = useState({
    code: '', notary_public: '', document_name: '', customer_a: '',
    customer_b: '', content: '', note: '', drafter: '', clerk: '',
    status: '1. Tiếp nhận yêu cầu' // Giá trị mặc định khi tạo mới
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState<any>(null);

  const { data: responseData, mutate } = useSWR('/api/admin/documents', fetcher, {
    refreshInterval: 2000, 
    revalidateOnFocus: true,
  });
  const documents = responseData?.data || [];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const method = editingId ? 'PUT' : 'POST';
    const payload = editingId ? { ...formData, id: editingId } : formData;

    const res = await fetch('/api/admin/documents', {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.ok) {
      setMessage({ type: 'success', text: editingId ? 'Cập nhật thành công!' : 'Tạo hồ sơ thành công!' });
      handleCancelEdit();
      mutate(); 
    } else {
      setMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra.' });
    }
  };

  const handleEditClick = (doc) => {
    setEditingId(doc.id);
    setFormData({
      code: doc.code, notary_public: doc.notary_public || '', document_name: doc.document_name || '',
      customer_a: doc.customer_a || '', customer_b: doc.customer_b || '', content: doc.content || '',
      note: doc.note || '', drafter: doc.drafter || '', clerk: doc.clerk || '',
      status: doc.status || '1. Tiếp nhận yêu cầu' // Đưa trạng thái cũ lên form khi nhấn sửa
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ 
      code: '', notary_public: '', document_name: '', customer_a: '', 
      customer_b: '', content: '', note: '', drafter: '', clerk: '', 
      status: '1. Tiếp nhận yêu cầu' 
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa hồ sơ này?")) {
      await fetch(`/api/admin/documents?id=${id}`, { method: 'DELETE' });
      mutate();
    }
  };

  const handleQuickStatusChange = async (id, currentNote, newStatus) => {
    await fetch('/api/admin/documents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus, note: currentNote }),
    });
    mutate();
  };

  const handleQuickNoteChange = async (id, currentStatus, newNote) => {
    await fetch('/api/admin/documents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: currentStatus, note: newNote }),
    });
    mutate();
  };

  const getStatusColor = (status) => {
    if(status?.includes('1.')) return 'bg-gray-100 text-gray-700';
    if(status?.includes('2.')) return 'bg-blue-50 text-blue-700';
    if(status?.includes('3.')) return 'bg-indigo-50 text-indigo-700';
    if(status?.includes('4.')) return 'bg-amber-50 text-amber-700';
    if(status?.includes('5.')) return 'bg-purple-50 text-purple-700';
    if(status?.includes('6.')) return 'bg-pink-50 text-pink-700';
    if(status?.includes('7.')) return 'bg-green-100 text-green-800 font-bold';
    return 'bg-white';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-gray-300 pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Quản Lý Tiến Độ Hồ Sơ Công Chứng Đức Hòa</h1>
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Đồng bộ Real-time
          </span>
        </div>

        {message.text && (
          <div className={`p-4 rounded-md text-sm font-medium shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* BẢNG NHẬP LIỆU */}
        <div className={`p-6 rounded-xl shadow-sm border ${editingId ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'}`}>
          <h2 className="text-lg font-bold text-gray-700 mb-5">
            {editingId ? '✏️ Cập Nhật Thông Tin Hồ Sơ' : '📄 Khởi Tạo Hồ Sơ Mới'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Cột 1 */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Loại Hồ Sơ</label>
                <select name="document_name" value={formData.document_name} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm bg-white">
                  <option value="">-- Chọn loại --</option>
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Công Chứng Viên</label>
                <select name="notary_public" value={formData.notary_public} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm bg-white">
                  <option value="">-- Chọn CCV --</option>
                  {NOTARIES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              {/* ĐÃ BỔ SUNG Ô CHỌN TRẠNG THÁI VÀO FORM */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Trạng Thái Hồ Sơ</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm bg-white font-semibold text-gray-700">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Cột 2 */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Khách Hàng A</label>
                <input name="customer_a" type="text" placeholder="Bên Bán / Bên Tặng Cho..." value={formData.customer_a} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Khách Hàng B</label>
                <input name="customer_b" type="text" placeholder="Bên Mua / Bên Nhận..." value={formData.customer_b} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Tóm tắt nội dung</label>
                <input name="content" type="text" placeholder="Thửa đất số..." value={formData.content} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm" />
              </div>
            </div>

            {/* Cột 3 */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">NV Soạn Thảo</label>
                <select name="drafter" value={formData.drafter} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm bg-white">
                  <option value="">-- Chọn NV --</option>
                  {DRAFTERS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">NV Photo & Trình Ký</label>
                <select name="clerk" value={formData.clerk} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm bg-white">
                  <option value="">-- Chọn NV --</option>
                  {CLERKS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Ghi chú</label>
                <input name="note" type="text" placeholder="Lưu ý thêm..." value={formData.note} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm" />
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 mt-4 pt-4 border-t">
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-2 rounded-md text-sm transition">
                  Hủy Sửa
                </button>
              )}
              <button type="submit" className={`${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold px-8 py-2 rounded-md text-sm transition shadow-sm`}>
                {editingId ? 'LƯU CẬP NHẬT' : '🚀 TẠO HỒ SƠ'}
              </button>
            </div>
          </form>
        </div>

        {/* BẢNG THEO DÕI */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left align-top">
              <thead className="text-xs text-gray-600 uppercase bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-4 w-24">Mã HS</th>
                  <th className="px-4 py-4">Khách Hàng / Nội Dung</th>
                  <th className="px-4 py-4">Phụ Trách</th>
                  <th className="px-4 py-4 w-48">Tiến Độ & Ghi Chú</th>
                  <th className="px-4 py-4 w-28">Thời Gian</th>
                  <th className="px-4 py-4 text-center w-32">Xử Lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!responseData ? (
                  <tr><td colSpan="6" className="text-center py-8">Đang đồng bộ...</td></tr>
                ) : documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/50 transition">
                    <td className="px-4 py-4 font-black text-gray-800">{doc.code}</td>
                    
                    <td className="px-4 py-4 space-y-1.5">
                      <div className="font-bold text-gray-800 text-base pb-1">{doc.document_name || 'Chưa phân loại'}</div>
                      
                      <div className="flex items-start text-sm">
                        <span className="font-bold text-gray-400 w-6 shrink-0">A:</span> 
                        <span className="font-semibold text-gray-900">{doc.customer_a || '-'}</span>
                      </div>
                      
                      <div className="flex items-start text-sm">
                        <span className="font-bold text-gray-400 w-6 shrink-0">B:</span> 
                        <span className="font-semibold text-gray-900">{doc.customer_b || '-'}</span>
                      </div>
                      
                      {doc.content && (
                        <div className="text-sm text-gray-500 mt-2 italic border-l-2 border-gray-200 pl-2">
                          {doc.content}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="font-bold text-gray-400 w-12">CCV:</span> 
                        <span className="font-bold text-blue-700">{doc.notary_public || '-'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="font-bold text-gray-400 w-12">Soạn:</span> 
                        <span className="font-semibold text-gray-800">{doc.drafter || '-'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="font-bold text-gray-400 w-12">Ký:</span> 
                        <span className="font-semibold text-gray-800">{doc.clerk || '-'}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={doc.status}
                        onChange={(e) => handleQuickStatusChange(doc.id, doc.note, e.target.value)}
                        className={`w-full border rounded p-1 mb-2 font-semibold text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer ${getStatusColor(doc.status)}`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input 
                        type="text"
                        defaultValue={doc.note || ''}
                        onBlur={(e) => { if (e.target.value !== doc.note) handleQuickNoteChange(doc.id, doc.status, e.target.value); }}
                        className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:bg-white focus:border-blue-500 rounded px-2 py-1.5 text-xs transition"
                        placeholder="Thêm ghi chú..."
                      />
                    </td>

                    <td className="px-4 py-4 text-xs text-gray-500">
                      <div className="font-bold text-gray-700">
                        {new Date(doc.updated_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div>
                        {new Date(doc.updated_at).toLocaleDateString('vi-VN')}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-center gap-2">
                        {/* Nút SỬA */}
                        <button 
                          onClick={() => handleEditClick(doc)} 
                          title="Sửa hồ sơ"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md text-xs font-semibold transition-all duration-200 border border-blue-200 hover:border-blue-600 shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Sửa
                        </button>

                        {/* Nút XÓA */}
                        <button 
                          onClick={() => handleDelete(doc.id)} 
                          title="Xóa hồ sơ"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-md text-xs font-semibold transition-all duration-200 border border-red-200 hover:border-red-600 shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}