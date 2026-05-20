import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Không lưu cache để khách hàng luôn thấy trạng thái mới nhất
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ success: false, error: "Vui lòng nhập mã hồ sơ." }, { status: 400 });
  }

  try {
    // Truy vấn dữ liệu thật từ Postgres dựa trên mã hồ sơ (chuyển thành in hoa để tìm kiếm chính xác)
    const { rows } = await sql`
      SELECT * FROM documents 
      WHERE code = ${code.toUpperCase()} 
      LIMIT 1
    `;
    
    if (rows.length > 0) {
      const record = rows[0];
      
      // Định dạng lại ngày tháng năm cho đẹp và dễ đọc với khách hàng
      const dateStr = new Date(record.updated_at).toLocaleDateString('vi-VN');
      
      return NextResponse.json({ 
        success: true, 
        data: {
          status: record.status,
          date: dateStr,
          note: record.note || "Không có ghi chú.", // Nếu không có ghi chú thì hiện mặc định
          customer_name: record.customer_name // Trả thêm tên khách hàng nếu muốn hiển thị sau này
        }
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Không tìm thấy hồ sơ với mã này. Vui lòng kiểm tra lại!" 
      }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi kết nối hệ thống." }, { status: 500 });
  }
}