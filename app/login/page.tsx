'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ĐÃ THÊM: React.FormEvent vào biến e
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Kiểm tra tài khoản cứng theo yêu cầu
    if (username === 'admin' && password === '123') {
      router.push('/admin'); // Đúng chuyển vào trang quản trị
    } else {
      setError('Tài khoản hoặc mật khẩu nội bộ không chính xác!');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-gray-800">CỔNG NỘI BỘ</h1>
          <p className="text-sm text-gray-400 font-medium">Hệ thống quản lý tiến độ VPCC Đức Hòa</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tài khoản</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tài khoản"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all tracking-widest"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-900 transition-all text-sm shadow-md"
          >
            {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs text-center font-semibold">
            ❌ {error}
          </div>
        )}
      </div>
    </div>
  );
}