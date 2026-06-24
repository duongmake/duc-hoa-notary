'use client';
import useSWR from 'swr';
import { useEffect, useState, useRef } from 'react'; 

// // Gắn thêm timestamp để Tivi luôn hiểu đây là một yêu cầu mới, cấm lưu cache
// const fetcher = (url: string) => fetch(`${url}?t=${new Date().getTime()}`, { 
//   cache: 'no-store',
//   headers: {
//     'Cache-Control': 'no-cache, no-store, must-revalidate',
//     'Pragma': 'no-cache',
//     'Expires': '0'
//   }
// }).then((res) => res.json());

// 1. SỬA LẠI FETCHER: Ép xóa cache ở cấp độ trình duyệt trình duyệt TV
const fetcher = (url: string) => 
  fetch(`${url}?_t=${Date.now()}`, { // Thêm timestamp chống trùng lặp URL
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }).then((res) => res.json());


// export default function TVDisplayPage() {
//   const [currentTime, setCurrentTime] = useState('');
//   const scrollRef = useRef<HTMLDivElement>(null); 

//   // Cập nhật đồng hồ
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

export default function TVDisplayPage() {
  // 2. CẤU HÌNH LẠI useSWR: Tối ưu riêng cho màn hình TV tĩnh
  const { data: responseData } = useSWR('/api/admin/documents', fetcher, {
    refreshInterval: 3000, 
    refreshWhenHidden: true, // Ép chạy kể cả khi TV tưởng trang đang bị ẩn/tĩnh
    revalidateOnFocus: false, // Tắt cái này vì TV không có thao tác click chuột ra/vào tab như máy tính
    dedupingInterval: 0       // Tắt cơ chế gom cụm request của SWR
  });

  const documents = responseData?.data || [];
  // ... các đoạn code hiển thị giao diện bên dưới giữ nguyên ...
}



  const { data: responseData } = useSWR('/api/admin/documents', fetcher, {
    refreshInterval: 2000, 
    refreshWhenHidden: true,
    refreshWhenOffline: true,
    revalidateOnFocus: false,
  });

  const rawDocuments = responseData?.data || [];
  
  // BỘ LỌC: Chỉ giữ lại các hồ sơ KHÔNG chứa trạng thái '9. Hoàn thành'
  const documents = rawDocuments.filter((doc: any) => !doc.status?.includes('9.'));

  // HIỆU ỨNG TỰ ĐỘNG TRƯỢT LÊN / TRƯỢT XUỐNG
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let step = 1; 
    let delay = 3000; 

    const timer = setInterval(() => {
      if (el.scrollHeight <= el.clientHeight) return;

      if (delay > 0) {
        delay -= 20; 
        return;
      }

      el.scrollTop += step;

      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
        step = -1; 
        delay = 3000; 
      }
      else if (el.scrollTop <= 0 && step === -1) {
        step = 1; 
        delay = 3000; 
      }
    }, 25); 

    return () => clearInterval(timer);
  }, [documents]); 

  const getStatusColor = (status: string) => {
    if(status?.includes('1.')) return 'bg-gray-100 text-gray-700';
    if(status?.includes('2.')) return 'bg-blue-50 text-blue-700';
    if(status?.includes('3.')) return 'bg-indigo-50 text-indigo-700';
    if(status?.includes('4.')) return 'bg-amber-50 text-amber-700';
    if(status?.includes('5.')) return 'bg-cyan-50 text-cyan-700 font-bold'; // 5. In lời chứng
    if(status?.includes('6.')) return 'bg-purple-50 text-purple-700'; // 6. CCV Ký
    if(status?.includes('7.')) return 'bg-pink-50 text-pink-700'; // 7. Đóng dấu 
    if(status?.includes('8.')) return 'bg-green-600 text-white font-bold animate-pulse shadow-md'; // 8. Thu phí gọi khách
    return 'bg-white';
  };

  // Hàm tự động cắt số thứ tự ở đầu trạng thái (VD: "1. Soạn thảo" -> "Soạn thảo")
  const formatStatusForTV = (status: string) => {
    if (!status) return '';
    // Regex này sẽ tìm số, dấu chấm và khoảng trắng ở đầu câu để cắt bỏ
    return status.replace(/^\d+\.\s*/, '');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col h-screen overflow-hidden">
      {/* HEADER TIVI */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-20">
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
      <div className="p-6 flex-1 flex flex-col min-h-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col relative">
          
          <div 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} 
          >
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
            
            <table className="w-full text-sm text-left border-collapse bg-white">
              <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 w-28">Mã HS</th>
                  <th className="px-6 py-4">Khách Hàng / Nội Dung</th>
                  <th className="px-6 py-4 w-48">Phụ Trách</th>
                  <th className="px-6 py-4 w-64 text-center">Tiến Độ Hiện Tại</th>
                  <th className="px-6 py-4 w-32 text-right">Thời Gian</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-100">
                {!responseData ? (
                  <tr><td colSpan={5} className="text-center py-20 text-gray-400">Đang tải dữ liệu...</td></tr>
                ) : documents.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-20 text-gray-400 font-bold">Chưa có hồ sơ nào trong ngày</td></tr>
                ) : documents.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-blue-50/50 transition bg-white">
                    <td className="px-6 py-5 font-black text-gray-900 text-lg align-top">
                      {doc.code}
                    </td>
                    
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
                        <span className="font-bold text-gray-400 w-12">Photo:</span> 
                        <span className="font-semibold text-gray-800">{doc.clerk || '-'}</span>
                      </div>
                    </td>

                    {/* ĐÃ CHỈNH SỬA: Dùng hàm formatStatusForTV để ẩn số */}
                    <td className="px-6 py-5 align-top">
                      <div className={`rounded-lg px-4 py-3 text-center font-bold shadow-sm border ${getStatusColor(doc.status)} uppercase tracking-wide`}>
                          {formatStatusForTV(doc.status)}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-right align-top">
                      <div className="text-lg font-black text-gray-800">
                        {new Date(doc.updated_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-gray-500">
                          {new Date(doc.updated_at).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* ĐÃ CHỈNH SỬA FOOTER: Không dùng "số 7" nữa mà ghi rõ tên trạng thái */}
        <div className="mt-4 flex justify-between items-center text-gray-500 text-xs font-medium px-2">
            <div>© Văn Phòng Công Chứng Đức Hòa - Hệ thống theo dõi hồ sơ tự động</div>
            <div>Vui lòng liên hệ quầy thu phí nếu hồ sơ của quý khách đã ở trạng thái <span className="font-bold text-gray-700 uppercase">Thu phí và trả hồ sơ</span></div>
        </div>
      </div>
    </div>
  );
}