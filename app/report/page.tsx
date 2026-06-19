'use client';
import useSWR from 'swr';
import { useState } from 'react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PersonalReportPage() {
  const { data: responseData, mutate } = useSWR('/api/admin/documents', fetcher, {
    refreshInterval: 3000, 
  });

  const documents = responseData?.data || [];
  const [isExporting, setIsExporting] = useState(false);

  // Tính tổng số tiền thu được của tất cả hồ sơ
  const totalRevenue = documents.reduce((sum: number, doc: any) => sum + (Number(doc.total_amount) || 0), 0);

  // Hàm xử lý cập nhật nhanh số tiền khi nhập xong trên bảng
  const handleQuickAmountChange = async (id: any, newAmount: number) => {
    await fetch('/api/admin/documents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, total_amount: newAmount }),
    });
    mutate(); // Đồng bộ lại số liệu ngay lập tức
  };

  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return <span className="text-gray-400 italic">Chưa ghi nhận</span>;
    const d = new Date(dateTimeString);
    return (
      <div className="text-xs font-medium text-gray-800">
        <span className="font-bold text-gray-900 block text-sm">
          {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
        {d.toLocaleDateString('vi-VN')}
      </div>
    );
  };

  // XUẤT EXCEL CÓ THÀNH TIỀN
  const handleExportExcel = async () => {
    if (documents.length === 0) {
      alert("Chưa có dữ liệu để xuất file!");
      return;
    }
    
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');

      const excelData = documents.map((doc: any) => ({
        'MÃ HỒ SƠ': doc.code,
        'LOẠI HỒ SƠ': doc.document_name || 'Chưa phân loại',
        'KHÁCH HÀNG A (BÊN BÁN/TẶNG)': doc.customer_a || '-',
        'KHÁCH HÀNG B (BÊN MUA/NHẬN)': doc.customer_b || '-',
        'NỘI DUNG TÓM TẮT': doc.content || '-',
        'CÔNG CHỨNG VIÊN': doc.notary_public || '-',
        'NHÂN VIÊN SOẠN THẢO': doc.drafter || '-',
        'NHÂN VIÊN PHOTO/TRÌNH KÝ': doc.clerk || '-',
        'TIẾN ĐỘ HIỆN TẠI': doc.status,
        'GHI CHÚ VĂN PHÒNG': doc.note || '-',
        'THÀNH TIỀN (VND)': doc.total_amount || 0,
        'THỜI GIAN TIẾP NHẬN': doc.created_at ? new Date(doc.created_at).toLocaleString('vi-VN') : 'Chưa ghi nhận',
        'CẬP NHẬT CUỐI CÙNG': doc.updated_at ? new Date(doc.updated_at).toLocaleString('vi-VN') : 'Chưa ghi nhận',
        'THỜI GIAN HOÀN THÀNH': doc.completed_at ? new Date(doc.completed_at).toLocaleString('vi-VN') : 'Chưa hoàn thành',
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Sách Hồ Sơ');

      const columnWidths = Object.keys(excelData[0] || {}).map(() => ({ wch: 22 }));
      worksheet['!cols'] = columnWidths;

      const today = new Date().toISOString().slice(0, 10);
      const fileName = `Bao_Cao_Tien_Do_VPCC_Duc_Hoa_${today}.xlsx`;

      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi xuất file.");
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if(status?.includes('9.')) return 'bg-gray-100 text-gray-600 border-gray-300';
    if(status?.includes('8.')) return 'bg-green-50 text-green-700 border-green-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 md:p-6">
      <div className="max-w-[95%] mx-auto space-y-6">
        
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">
              📊 Hệ Thống Kiểm Toán & Kế Toán Hồ Sơ
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Trang tra cứu thuộc tính ẩn và chốt doanh thu cuối ngày văn phòng
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="flex items-center gap-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300 px-4 py-2 rounded-lg shadow-sm border border-green-700 transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isExporting ? 'Đang tạo file...' : 'Tải File Excel (.xlsx)'}
            </button>

            <Link 
              href="/admin" 
              className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300 transition-all"
            >
              ← Quay lại trang Admin
            </Link>
          </div>
        </div>

        {/* THỐNG KÊ KÈM TỔNG TIỀN DOANH THU */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <span className="text-xs font-bold text-gray-400 uppercase">Tổng hồ sơ lưu trữ</span>
            <div className="text-2xl font-black text-gray-800 mt-1">{documents.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <span className="text-xs font-bold text-blue-400 uppercase">Đang tiến hành</span>
            <div className="text-2xl font-black text-blue-700 mt-1">
              {documents.filter((d: any) => !d.status?.includes('9.')).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <span className="text-xs font-bold text-green-400 uppercase">Đã hoàn thành lưu kho</span>
            <div className="text-2xl font-black text-green-700 mt-1">
              {documents.filter((d: any) => d.status?.includes('9.')).length}
            </div>
          </div>
          {/* HỘP HIỂN THỊ TỔNG DOANH THU */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl shadow-sm border border-amber-200">
            <span className="text-xs font-bold text-amber-600 uppercase">Tổng số tiền tổng hợp</span>
            <div className="text-2xl font-black text-amber-700 mt-1">
              {totalRevenue.toLocaleString('vi-VN')} đ
            </div>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU ĐẦY ĐỦ THUỘC TÍNH */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse min-w-[1400px]">
              <thead className="text-xs text-gray-500 uppercase bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 w-24 text-center">Mã HS</th>
                  <th className="px-4 py-4 w-44">Khách Hàng (A / B)</th>
                  <th className="px-4 py-4 w-40">Nhiệm Vụ</th>
                  <th className="px-4 py-4 w-44">Phụ Trách</th>
                  <th className="px-4 py-4 w-48">Tiến Độ & Ghi Chú</th>
                  <th className="px-4 py-4 w-40 text-center bg-amber-50/40">Thành Tiền (VND)</th>
                  <th className="px-4 py-4 w-32">Khởi Tạo</th>
                  <th className="px-4 py-4 w-32">Cập Nhật</th>
                  <th className="px-4 py-4 w-32">Hoàn Thành</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {documents.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400 font-medium">Chưa có dữ liệu lịch sử hồ sơ.</td></tr>
                ) : (
                  documents.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-gray-50/80 transition-all align-top">
                      <td className="px-4 py-4 text-center font-black text-gray-900 text-base">{doc.code}</td>

                      <td className="px-4 py-4 space-y-1">
                        <div className="flex items-start text-xs">
                          <span className="font-bold text-gray-400 w-5 shrink-0">A:</span>
                          <span className="font-semibold text-gray-900 truncate">{doc.customer_a || '-'}</span>
                        </div>
                        <div className="flex items-start text-xs">
                          <span className="font-bold text-gray-400 w-5 shrink-0">B:</span>
                          <span className="font-semibold text-gray-900 truncate">{doc.customer_b || '-'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 space-y-1">
                        <span className="inline-block bg-blue-50 text-blue-800 text-xs font-bold px-2 py-0.5 rounded border border-blue-100">{doc.document_name || 'Chưa phân loại'}</span>
                        {doc.content && <p className="text-xs text-gray-500 italic pl-1 border-l border-gray-200 line-clamp-1">{doc.content}</p>}
                      </td>

                      {/* ĐÃ SỬA: Đưa lại thông tin người Photo / Trình ký vào đây */}
                      <td className="px-4 py-4 text-xs space-y-1">
                        <div><span className="font-bold text-gray-400">CCV:</span> <span className="font-semibold text-blue-700">{doc.notary_public || '-'}</span></div>
                        <div><span className="font-bold text-gray-400">Soạn:</span> <span className="font-medium text-gray-800">{doc.drafter || '-'}</span></div>
                        <div><span className="font-bold text-gray-400">Photo:</span> <span className="font-medium text-gray-800">{doc.clerk || '-'}</span></div>
                      </td>

                      <td className="px-4 py-4 space-y-1.5">
                        <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-md border ${getStatusBadge(doc.status)}`}>{doc.status}</span>
                        {doc.note && <p className="text-xs font-medium text-gray-600 bg-gray-50 p-1 rounded border border-gray-100 line-clamp-1">{doc.note}</p>}
                      </td>

                      <td className="px-4 py-4 bg-amber-50/10">
                        <input 
                          type="number"
                          defaultValue={doc.total_amount || ''}
                          onBlur={(e) => {
                            const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                            if (val !== doc.total_amount) {
                              handleQuickAmountChange(doc.id, val);
                            }
                          }}
                          className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:bg-white focus:border-amber-500 rounded px-2 py-1.5 text-sm font-black text-gray-800 text-right transition outline-none focus:ring-2 focus:ring-amber-200"
                          placeholder="0"
                        />
                      </td>

                      <td className="px-4 py-4 bg-gray-50/30">{formatDateTime(doc.created_at)}</td>
                      <td className="px-4 py-4">{formatDateTime(doc.updated_at)}</td>
                      <td className="px-4 py-4 bg-green-50/10">{formatDateTime(doc.completed_at)}</td>
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