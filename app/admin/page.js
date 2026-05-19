'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState({ code: '', customer_name: '', service_type: '', note: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null); // Biến để theo dõi xem đang Sửa hay Tạo mới

  const fetchDocuments = async () => {
    const res = await fetch('/api/admin/documents');
    const data = await res.json();
    if (data.success) setDocuments(data.data);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Xử lý Gửi Form (Dùng chung cho cả Tạo mới và Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const url = '/api/admin/documents';
    const method = editingId ? 'PUT' : 'POST'; // Nếu có editingId thì là Sửa, không thì là Tạo
    const payload = editingId ? { ...formData, id: editingId } : formData;

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.ok) {
      setMessage({ type: 'success', text: editingId ? 'Cập nhật thành công!' : 'Thêm hồ sơ thành công!' });
      handleCancelEdit(); // Reset form
      fetchDocuments();
    } else {
      setMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra.' });
    }
  };

  // Click nút Sửa ở bảng
  const handleEditClick = (doc) => {
    setEditingId(doc.id);
    setFormData({ code: doc.code, customer_name: doc.customer_name, service_type: doc.service_type || '', note: doc.note || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang
  };

  // Hủy chế độ Sửa
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ code: '', customer_name: '', service_type: '', note: '' });
  };

  // Xử lý Xóa hồ sơ
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ này? Hành động này không thể hoàn tác!")) {
      const res = await fetch(`/api/admin/documents?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Đã xóa hồ sơ.' });
        fetchDocuments();
      } else {
        alert("Xóa thất bại!");
      }
    }
  };

  // Cập nhật trạng thái nhanh (từ menu thả xuống)
  const handleQuickStatusChange = async (id, currentNote, newStatus) => {
    await fetch('/api/admin/documents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus, note: currentNote }),
    });
    fetchDocuments();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Hệ Thống Quản Trị Hồ Sơ</h1>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Nhân Viên</span>
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
                disabled={editingId !== null} // Không cho sửa mã khi đang ở chế độ cập nhật
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
              <label className="block text-xs font-medium text-gray-500 mb-1">Ghi chú</label>
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
                  <th className="px-4 py-3">Trạng Thái</th>
                  <th className="px-4 py-3">Cập nhật</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-900">{doc.code}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{doc.customer_name}</div>
                      <div className="text-xs text-gray-400">{doc.service_type || '-'}</div>
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
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(doc.updated_at).toLocaleString('vi-VN')}
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