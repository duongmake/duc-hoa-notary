'use client';
import { useState } from 'react';
import Link from 'next/link'; // Thêm thư viện Link của Next.js để chuyển trang mượt mà

export default function Home() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/status?code=${code}`);
      const data = await res.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi kết nối hệ thống. Vui lòng thử lại sau.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center p-4 relative">
      
      {/* NÚT ĐĂNG NHẬP NỘI BỘ Ở GÓC PHẢI TRÊN CÙNG */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <Link 
          href="/login" 
          className="flex items-center gap-2 text-sm font-bold text-blue-700 bg-white/80 hover:bg-white px-4 py-2 rounded-full shadow-sm border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all backdrop-blur-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Đăng Nhập
        </Link>
      </div>

      <div className="max-w-xl w-full bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Logo / Tiêu đề */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-blue-800 tracking-tight">VPCC ĐỨC HÒA</h1>
          <p className="text-gray-500 mt-1 font-medium">Hệ thống tra cứu tiến độ hồ sơ trực tuyến</p>
        </div>

        {/* Form Nhập Mã */}
        <form onSubmit={checkStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Nhập mã hồ sơ nhận từ văn phòng
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: HS-01"
                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all font-bold text-lg text-gray-800 uppercase placeholder:normal-case"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 active:scale-[0.99] transition-all disabled:bg-blue-300 shadow-md shadow-blue-200"
          >
            {loading ? '🔍 Đang kiểm tra tiến độ...' : 'Tra Cứu Tiến Độ'}
          </button>
        </form>

        {/* Hiển thị lỗi */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center font-semibold text-sm animate-shake">
            ⚠️ {error}
          </div>
        )}

        {/* Hiển thị kết quả tra cứu thật từ Database */}
        {result && (
          <div className="mt-8 border-t border-gray-100 pt-6 space-y-4 animate-fadeIn">
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
              <h3 className="font-bold text-blue-900 text-base border-b border-blue-100 pb-2">
                Thông tin kết quả tra cứu:
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                <div><strong>Loại hồ sơ:</strong> <span className="font-semibold text-gray-900">{result.document_name || 'Hồ sơ công chứng'}</span></div>
                <div><strong>Ngày cập nhật:</strong> <span className="font-semibold text-gray-900">{result.date}</span></div>
              </div>

              {/* Trạng thái tiến độ nổi bật */}
              <div className="pt-2">
                <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Tiến độ hiện tại:</span>
                <span className="inline-block bg-blue-600 text-white font-bold text-sm px-4 py-1.5 rounded-full shadow-sm">
                  {result.status}
                </span>
              </div>

              {/* Ghi chú hướng dẫn cho người dân */}
              <div className="pt-2 border-t border-blue-100">
                <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Hướng dẫn / Ghi chú từ văn phòng:</span>
                <p className="text-sm font-medium text-gray-800 bg-white p-3 rounded-lg border border-gray-200 italic">
                  "{result.note}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}