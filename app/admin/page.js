'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState({ code: '', customer_name: '', service_type: '', note: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Tải danh sách hồ sơ từ API
  const fetchDocuments = async () => {
    const res = await fetch('/api/admin/documents');
    const data = await res.json();
    if (data.success) {
      setDocuments(data.data);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Xử lý khi nhấn nút "Tạo Hồ Sơ"
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const res = await fetch('/api/admin/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();

    if (res.ok) {
      setMessage({ type: 'success', text: 'Thêm hồ sơ mới thành công!' });
      setFormData({ code: '', customer_name: '', service_type: '', note: '' }); // Xóa sạch form
      fetchDocuments(); // Cập nhật lại bảng
    } else {
      setMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra.' });
    }
  };

  // Xử lý khi nhân viên thay đổi trạng thái ở menu thả xuống (Select)
  const handleStatusChange = async (id, currentNote, newStatus) => {
    const res = await fetch('/api/admin/documents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus, note: currentNote }),
    });
    if (res.ok) {
      fetchDocuments(); // Tải lại bảng để cập nhật thời gian mới nhất
    } else {
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Tiêu đề chính */}
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Hệ Thống Quản Trị Hồ Sơ - VPCC Đức Hòa</h1>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Nhân Viên</span>
        </div>

        {/* Khu vực thông báo nhanh */}
        {message.text && (
          <div className={`p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* 1. FORM NHẬP HỒ SƠ MỚI */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Tiếp Nhận Hồ Sơ Mới</h2>
          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Mã Hồ Sơ / Biên Nhận</label>
              <input
                type="text" required placeholder="VD: CC-2026-001"
                value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
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
              <label className="block text-xs font-medium text-gray-500 mb-1">Loại Việc Công Chứng</label>
              <input
                type="text" placeholder="VD: Hợp đồng chuyển nhượng đất"
                value={formData.service_type} onChange={e => setFormData({...formData, service_type: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ghi chú ban đầu (Nếu có)</label>
              <input
                type="text" placeholder="VD: Thiếu bản vẽ nội nghiệp"
                value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded text-sm transition">
                Tạo và Lưu Hồ Sơ
              </button>
            </div>
          </form>
        </div>

        {/* 2. BẢNG DANH SÁCH & CẬP NHẬT TRẠNG THÁI */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700">Danh Sách Hồ Sơ Đang Quản Lý</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3">Mã Hồ Sơ</th>
                  <th className="px-6 py-3">Khách Hàng / Loại Việc</th>
                  <th className="px-6 py-3">Ghi Chú Nội Bộ / Hướng Dẫn</th>
                  <th className="px-6 py-3">Trạng Thái Hồ Sơ</th>
                  <th className="px-6 py-3">Cập nhật cuối</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">Chưa có hồ sơ nào trong hệ thống.</td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="bg-white border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-bold text-gray-900">{doc.code}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{doc.customer_name}</div>
                        <div className="text-xs text-gray-400">{doc.service_type || 'Chưa phân loại'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          defaultValue={doc.note || ''} 
                          onBlur={async (e) => {
                            if (e.target.value !== doc.note) {
                              await fetch('/api/admin/documents', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: doc.id, status: doc.status, note: e.target.value }),
                              });
                              fetchDocuments();
                            }
                          }}
                          placeholder="Nhấp để sửa ghi chú..."
                          className="bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 border border-transparent hover:border-gray-300 rounded px-2 py-1 w-full text-gray-700 text-sm transition"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={doc.status}
                          onChange={(e) => handleStatusChange(doc.id, doc.note, e.target.value)}
                          className={`border rounded px-2 py-1 font-medium text-xs focus:outline-none ${
                            doc.status === 'Đã hoàn thành' ? 'bg-green-50 text-green-700 border-green-300' :
                            doc.status === 'Chờ bổ sung giấy tờ' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                            doc.status === 'Chờ ký duyệt' ? 'bg-purple-50 text-purple-700 border-purple-300' :
                            doc.status === 'Đã hủy' ? 'bg-red-50 text-red-700 border-red-300' :
                            'bg-blue-50 text-blue-700 border-blue-300'
                          }`}
                        >
                          <option value="Đang xử lý">⏳ Đang xử lý</option>
                          <option value="Chờ bổ sung giấy tờ">⚠️ Chờ bổ sung giấy tờ</option>
                          <option value="Chờ ký duyệt">🖋️ Chờ ký duyệt</option>
                          <option value="Đã hoàn thành">✅ Đã hoàn thành</option>
                          <option value="Đã hủy">❌ Đã hủy</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {new Date(doc.updated_at).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}