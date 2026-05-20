'use client';
import { useState } from 'react';
import useSWR from 'swr'; // Thêm thư viện SWR

// Hàm gọi API cơ bản dành cho SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminPage() {
  const [formData, setFormData] = useState({ code: '', customer_name: '', service_type: '', note: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);

  // --- ÁP DỤNG REAL-TIME BẰNG SWR ---
  // refreshInterval: 2000 -> Cứ 2 giây sẽ gọi ngầm 1 lần để xem ai đó có sửa gì không
  const { data: responseData, mutate } = useSWR('/api/admin/documents', fetcher, {
    refreshInterval: 2000, 
    revalidateOnFocus: true, // Khi người dùng tab ra ngoài rồi quay lại, sẽ update ngay lập tức
  });

  // Lấy mảng dữ liệu từ kết quả trả về, nếu chưa có thì để mảng rỗng
  const documents = responseData?.data || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const url = '/api/admin/documents';
    const method = editingId ? 'PUT' : 'POST';
    const payload = editingId ? { ...formData, id: editingId } : formData;

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.ok) {
      setMessage({ type: 'success', text: editingId ? 'Cập nhật thành công!' : 'Thêm hồ sơ thành công!' });
      handleCancelEdit();
      // Yêu cầu SWR tải lại dữ liệu mới lập tức
      mutate(); 
    } else {
      setMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra.' });
    }
  };

  const handleEditClick = (doc) => {
    setEditingId(doc.id);
    setFormData({ code: doc.code, customer_name: doc.customer_name, service_type: doc.service_type || '', note: doc.note || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ code: '', customer_name: '', service_type: '', note: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ này?")) {
      const res = await fetch(`/api/admin/documents?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Đã xóa hồ sơ.' });
        mutate(); // Cập nhật lại danh sách ngay lập tức
      }
    }
  };

  const handleQuickStatusChange = async (id, currentNote, newStatus) => {
    await fetch('/api/admin/documents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus, note: currentNote }),
    });
    mutate(); // Cập nhật lại danh sách ngay lập tức
  };

  const handleQuickNoteChange = async (id, currentStatus, newNote) => {
    await fetch('/api/admin/documents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: currentStatus, note: newNote }),
    });
    mutate(); // Đồng bộ ngay với Database
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Hệ Thống Quản Trị Hồ Sơ</h1>
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live
          </span>
        </div>

        {message.text && (
          <div className={`p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border`}>
            {message.text}
          </div>
        )}

        {/* FORM NHẬP / SỬA HỒ SƠ */}
        <div className={`p-6 rounded-lg shadow-sm border ${editingId ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {editingId ? 'Sửa Thông Tin Hồ Sơ' : 'Tiếp Nhận Hồ Sơ Mới'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Mã Hồ Sơ</label>
              <input
                type="text" required placeholder="VD: CC-2026-001"
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value})}
                disabled={editingId !== null} 
                className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${editingId ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-blue-500'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tên Khách Hàng</label>
              <input
                type="text" required placeholder="Nguyễn Văn A"
                value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Loại Việc</label>
              <input
                type="text" placeholder="VD: Sang tên xe"
                value={formData.service_type} onChange={e => setFormData({...formData, service_type: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ghi chú ban đầu</label>
              <input
                type="text" placeholder="VD: Chờ đối chiếu CCCD"
                value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-4 flex justify-end gap-2 mt-2">
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded text-sm transition">
                  Hủy Sửa
                </button>
              )}
              <button type="submit" className={`${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium px-6 py-2 rounded text-sm transition`}>
                {editingId ? 'Lưu Cập Nhật' : 'Tạo Hồ Sơ'}
              </button>
            </div>
          </form>
        </div>

        {/* BẢNG DANH SÁCH */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3">Mã HS</th>
                  <th className="px-4 py-3">Khách Hàng / Loại Việc</th>
                  <th className="px-4 py-3">Ghi chú (Sửa nhanh)</th>
                  <th className="px-4 py-3">Trạng Thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {!responseData ? (
                  <tr><td colSpan="5" className="text-center py-8">Đang tải dữ liệu ngầm...</td></tr>
                ) : documents.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-900">{doc.code}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{doc.customer_name}</div>
                      <div className="text-xs text-gray-400">{doc.service_type || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="text"
                        defaultValue={doc.note || ''}
                        onBlur={(e) => {
                          if (e.target.value !== doc.note) {
                            handleQuickNoteChange(doc.id, doc.status, e.target.value);
                          }
                        }}
                        className="bg-transparent border border-transparent hover:border-gray-300 focus:bg-white focus:border-blue-500 rounded px-2 py-1 w-full text-sm transition"
                        placeholder="Nhập ghi chú..."
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={doc.status}
                        onChange={(e) => handleQuickStatusChange(doc.id, doc.note, e.target.value)}
                        className="border rounded px-2 py-1 font-medium text-xs bg-white focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Đang xử lý">Đang xử lý</option>
                        <option value="Chờ bổ sung giấy tờ">Chờ bổ sung giấy tờ</option>
                        <option value="Chờ ký duyệt">Chờ ký duyệt</option>
                        <option value="Đã hoàn thành">Đã hoàn thành</option>
                        <option value="Đã hủy">Đã hủy</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => handleEditClick(doc)} className="text-blue-600 hover:underline text-xs font-medium">Sửa</button>
                      <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:underline text-xs font-medium">Xóa</button>
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