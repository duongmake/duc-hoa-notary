'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (username === 'admin' && password === '12345') {
      
      // ĐÃ THÊM: Ghi "Thẻ thông hành" vào Cookie của trình duyệt (Hết hạn sau 12 tiếng)
      document.cookie = "vpcc_auth=true; path=/; max-age=43200"; 

      router.push('/report'); 
    } else {
      setError('Tài khoản hoặc mật khẩu nội bộ không chính xác!');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      
      {/* CỘT TRÁI */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -top-20 -left-20"></div>
        <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl bottom-10 right-10"></div>
        
        <div className="relative z-10 text-center px-12">
          <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-8 border border-white/20 shadow-2xl flex items-center justify-center bg-white">
            <img src="/icon.jpg" alt="Logo VPCC Đức Hòa" className="w-full h-full object-cover"/>
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">VPCC ĐỨC HÒA</h1>
          <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-md mx-auto">
            Hệ thống quản lý, kiểm toán và theo dõi tiến độ hồ sơ công chứng nội bộ.
          </p>
        </div>
      </div>

      {/* CỘT PHẢI */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden w-16 h-16 rounded-xl overflow-hidden mx-auto mb-6 shadow-lg bg-white flex items-center justify-center">
              <img src="/icon.jpg" alt="Logo VPCC" className="w-full h-full object-cover"/>
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Đăng nhập</h2>
            <p className="text-sm text-slate-500 font-medium mt-2">Vui lòng nhập thông tin nội bộ để truy cập</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">Tài khoản</label>
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tài khoản..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">Mật khẩu</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 tracking-widest"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-700 transition-all text-sm shadow-lg shadow-blue-600/30">
              {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP HỆ THỐNG'}
            </button>
          </form>

          {error && <div className="mt-5 p-3.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm text-center font-semibold">{error}</div>}
        </div>
      </div>
    </div>
  );
}