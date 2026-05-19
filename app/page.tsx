'use client';
import { useState } from 'react';

export default function Home() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

const checkStatus = async (e: React.FormEvent) => {
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
      setError("Có lỗi xảy ra khi kết nối hệ thống.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-2">VPCC Đức Hòa</h1>
        <p className="text-center text-gray-500 mb-6">Hệ thống tra cứu trạng thái hồ sơ</p>

        <form onSubmit={checkStatus} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mã biên nhận / Mã hồ sơ</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VD: DH123"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {loading ? 'Đang tra cứu...' : 'Tra Cứu Hồ Sơ'}
          </button>
        </form>

        {/* Hiển thị kết quả */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md space-y-2">
            <h3 className="font-semibold text-green-800">Kết quả tra cứu:</h3>
            <p><strong>Trạng thái:</strong> <span className="text-blue-600">{result.status}</span></p>
            <p><strong>Ngày tiếp nhận:</strong> {result.date}</p>
            <p><strong>Ghi chú:</strong> {result.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}