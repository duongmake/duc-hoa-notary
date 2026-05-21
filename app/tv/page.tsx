'use client';
import useSWR from 'swr';
import { useEffect, useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TVDisplayPage() {
  const [currentTime, setCurrentTime] = useState('');

  // Đồng hồ chạy liên tục trên góc TV
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Gọi API lấy dữ liệu real-time mỗi 2 giây
  const { data: responseData } = useSWR('/api/admin/documents', fetcher, {
    refreshInterval: 2000, 
    revalidateOnFocus: true,
  });

  // Lấy dữ liệu và chỉ cắt ra 8 hồ sơ mới nhất để hiển thị vừa vặn trên 1 màn hình TV
  const documents = responseData?.data?.slice(0, 8) || [];

  // Hàm tạo màu nền rực rỡ cho từng trạng thái trên TV
  const getStatusStyle = (status: string) => {
    if(status?.includes('1.')) return 'bg-gray-200 text-gray-800';
    if(status?.includes('2.')) return 'bg-blue-100 text-blue-800 border-l-8 border-blue-500';
    if(status?.includes('3.')) return 'bg-indigo-100 text-indigo-800 border-l-8 border-indigo-500';
    if(status?.includes('4.')) return 'bg-amber-100 text-amber-800 border-l-8 border-amber-500 font-black'; // Khách ký
    if(status?.includes('5.')) return 'bg-purple-100 text-purple-800 border-l-8 border-purple-500';
    if(status?.includes('6.')) return 'bg-pink-100 text-pink-800 border-l-8 border-pink-500';
    if(status?.includes('7.')) return 'bg-green-500 text-white font-black animate-pulse shadow-lg border-2 border-white'; // Nhấp nháy gọi khách
    return 'bg-white';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans overflow-hidden flex flex-col">
      {/* HEADER TV */}
      <div className="bg-blue-800 p-6 flex justify-between items-center border-b-8 border-blue-500 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-white text-blue-900 p-3 rounded-xl font-black text-4xl">VPCC</div>
          <div>
            <h1 className="text-4xl font-black tracking-wider text-white uppercase">Bảng Theo Dõi Tiến Độ</h1>
            <p className="text-blue-200 text-xl font-medium mt-1">Văn Phòng Công Chứng Đức Hòa</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black tracking-widest text-yellow-400 font-mono drop-shadow-md">
            {currentTime || '00:00:00'}
          </div>
          <div className="text-xl text-blue-200 font-semibold mt-1">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* BẢNG HIỂN THỊ */}
      <div className="flex-1 p-6 bg-gray-100">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-300 h-full">
          <table className="w-full text-left table-fixed">
            <thead className="bg-gray-800 text-white text-2xl uppercase">
              <tr>
                <th className="py-5 px-6 w-1/12 text-center">Mã HS</th>
                <th className="py-5 px-6 w-3/12">Khách Hàng (Bên A / Bên B)</th>
                <th className="py-5 px-6 w-2/12">Loại Việc</th>
                <th className="py-5 px-6 w-4/12">Tiến Độ Hiện Tại</th>
                <th className="py-5 px-6 w-2/12 text-center">Cập Nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-gray-200 bg-white">
              {!responseData ? (
                <tr><td colSpan={5} className="text-center py-20 text-4xl text-gray-400 font-bold">Đang kết nối hệ thống...</td></tr>
              ) : documents.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-20 text-4xl text-gray-400 font-bold">Chưa có hồ sơ nào trong ngày</td></tr>
              ) : documents.map((doc: any, index: number) => (
                <tr key={doc.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  {/* Mã HS */}
                  <td className="py-6 px-6 text-center">
                    <span className="inline-block bg-gray-800 text-white text-3xl font-black px-4 py-2 rounded-lg shadow-sm">
                      {doc.code}
                    </span>
                  </td>
                  
                  {/* Khách hàng */}
                  <td className="py-6 px-6">
                    <div className="text-3xl font-bold text-gray-900 truncate">{doc.customer_a || '-'}</div>
                    {doc.customer_b && (
                      <div className="text-2xl font-semibold text-gray-500 mt-2 truncate">
                        <span className="text-gray-400 mr-2">Khách B:</span>{doc.customer_b}
                      </div>
                    )}
                  </td>

                  {/* Loại việc */}
                  <td className="py-6 px-6">
                    <div className="text-2xl font-bold text-blue-900 bg-blue-50 inline-block px-4 py-2 rounded-lg border border-blue-100">
                      {doc.document_name || 'Hồ sơ khác'}
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-6 px-6">
                    <div className={`text-3xl rounded-xl px-6 py-4 shadow-sm flex items-center justify-between ${getStatusStyle(doc.status)}`}>
                      <span>{doc.status}</span>
                      {doc.status?.includes('7.') && (
                        <span className="text-2xl bg-white text-green-600 px-4 py-1 rounded-full animate-bounce">
                          MỜI NHẬN HỒ SƠ!
                        </span>
                      )}
                    </div>
                    {doc.note && (
                      <div className="mt-3 text-xl font-medium text-gray-500 italic pl-2 border-l-4 border-gray-300">
                        {doc.note}
                      </div>
                    )}
                  </td>

                  {/* Thời gian */}
                  <td className="py-6 px-6 text-center">
                    <div className="text-3xl font-black text-gray-800">
                      {new Date(doc.updated_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}