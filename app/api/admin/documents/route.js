import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// 1. API Lấy danh sách toàn bộ hồ sơ (Dùng cho bảng hiển thị)
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM documents ORDER BY updated_at DESC`;
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Không thể tải danh sách hồ sơ." }, { status: 500 });
  }
}

// 2. API Tạo hồ sơ mới
export async function POST(request) {
  try {
    const { code, customer_name, service_type, note } = await request.json();
    
    // Kiểm tra xem mã hồ sơ đã tồn tại chưa
    const checkExist = await sql`SELECT id FROM documents WHERE code = ${code.toUpperCase()}`;
    if (checkExist.rows.length > 0) {
      return NextResponse.json({ success: false, error: "Mã hồ sơ này đã tồn tại trên hệ thống!" }, { status: 400 });
    }

    // Thêm vào database
    await sql`
      INSERT INTO documents (code, customer_name, service_type, status, note, updated_at) 
      VALUES (${code.toUpperCase()}, ${customer_name}, ${service_type}, 'Đang xử lý', ${note}, NOW())
    `;
    return NextResponse.json({ success: true, message: "Tạo hồ sơ thành công!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi hệ thống khi tạo hồ sơ." }, { status: 500 });
  }
}

// 3. API Cập nhật trạng thái hồ sơ
export async function PUT(request) {
  try {
    const { id, status, note } = await request.json();
    await sql`
      UPDATE documents 
      SET status = ${status}, note = ${note}, updated_at = NOW() 
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true, message: "Cập nhật trạng thái thành công!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Không thể cập nhật trạng thái." }, { status: 500 });
  }
}