'use client';
import useSWR from 'swr';
import { useEffect, useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TVDisplayPage() {
  const [currentTime, setCurrentTime] = useState('');

  // Cập nhật đồng hồ
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: responseData } = useSWR('/api/admin/documents', fetcher, {
    refreshInterval: 2000, 
  });

  const documents = responseData?.data || [];

  const getStatusColor = (status: string) => {
    if(status?.includes('1.')) return 'bg-gray-100 text-gray-700';
    if(status?.includes('2.')) return 'bg-blue-50 text-blue-700';
    if(status?.includes('3.')) return 'bg-indigo-50 text-indigo-700';
    if(status?.includes('4.')) return 'bg-amber-50 text-amber-700';
    if(status?.includes('5.')) return 'bg-purple-50 text-purple-700';
    if(status?.includes('6.')) return 'bg-pink-50 text-pink-700';
    if(status?.includes('7.')) return 'bg-green-600 text-white font-bold animate-pulse';
    return 'bg-white';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* HEADER GỌN GÀNG */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-700 text-white px-3 py-1 rounded font-black text-xl">VPCC</div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">BẢNG THEO DÕI TIẾN ĐỘ HỒ SƠ</h1>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-600">
            <div className="text-right">
                <div className="text-2xl font-black text-blue-700 leading-none">{currentTime}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">
                    {new Date().toLocaleDateString('vi-VN')}
                </div>
            </div>
            <div className="border-l pl-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-bold text-green-700 uppercase">Live</span>
            </div>
        </div>
      </div>

      {/* NỘI DUNG BẢNG */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-gray-500 uppercase bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 w-28">Mã HS</th>
                <th className="px-6 py-4">Khách Hàng / Nội Dung</th>
                {/* ĐÃ THÊM CỘT PHỤ TRÁCH VÀO ĐÂY */}
                <th className="px-6 py-4 w-48">Phụ Trách</th>
                <th className="px-6 py-4 w-64 text-center">Tiến Độ Hiện Tại</th>
                <th className="px-6 py-4 w-32 text-right">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!responseData ? (
                <tr><td colSpan={5} className="text-center py-20 text-gray-400">Đang tải dữ liệu...</td></tr>
              ) : documents.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-blue-50/30 transition">
                  {/* Mã HS */}
                  <td className="px-6 py-5 font-black text-gray-900 text-lg align-top">
                    {doc.code}
                  </td>
                  
                  {/* Khách hàng / Nội dung */}
                  <td className="px-6 py-5 space-y-1.5 align-top">
                    <div className="font-bold text-gray-800 text-base">
                        {doc.document_name || 'Hồ sơ công chứng'}
                    </div>
                    <div className="flex items-start text-sm">
                      <span className="font-bold text-gray-400 w-6 shrink-0">A:</span> 
                      <span className="font-semibold text-gray-900">{doc.customer_a || '-'}</span>
                    </div>
                    <div className="flex items-start text-sm">
                      <span className="font-bold text-gray-400 w-6 shrink-0">B:</span> 
                      <span className="font-semibold text-gray-900">{doc.customer_b || '-'}</span>
                    </div>
                  </td>

                  {/* THÔNG TIN PHỤ TRÁCH (Giống hệt trang Admin) */}
                  <td className="px-6 py-5 space-y-2 align-top">
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

                  {/* Trạng thái */}
                  <td className="px-6 py-5 align-top">
                    <div className={`rounded-lg px-4 py-3 text-center font-bold shadow-sm border ${getStatusColor(doc.status)}`}>
                        {doc.status}
                    </div>
                    {doc.note && (
                        <div className="text-xs text-gray-400 mt-2 italic text-center">
                            "{doc.note}"
                        </div>
                    )}
                  </td>

                  {/* Thời gian cập nhật */}
                  <td className="px-6 py-5 text-right align-top">
                    <div className="text-lg font-black text-gray-800">
                      {new Date(doc.updated_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-gray-400">
                        {new Date(doc.updated_at).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* FOOTER */}
        <div className="mt-4 flex justify-between items-center text-gray-400 text-xs font-medium px-2">
            <div>© Văn Phòng Công Chứng Đức Hòa - Hệ thống theo dõi hồ sơ tự động</div>
            <div>Vui lòng liên hệ quầy thu phí nếu hồ sơ của quý khách đã ở trạng thái số 7</div>
        </div>
      </div>
    </div>
  );
}