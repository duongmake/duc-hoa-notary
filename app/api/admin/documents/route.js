import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// 1. API Lấy danh sách hồ sơ
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM documents ORDER BY updated_at DESC`;
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Không thể tải danh sách." }, { status: 500 });
  }
}

// 2. API Tạo hồ sơ mới
export async function POST(request) {
  try {
    const { code, customer_name, service_type, note } = await request.json();
    const checkExist = await sql`SELECT id FROM documents WHERE code = ${code.toUpperCase()}`;
    if (checkExist.rows.length > 0) {
      return NextResponse.json({ success: false, error: "Mã hồ sơ đã tồn tại!" }, { status: 400 });
    }
    await sql`
      INSERT INTO documents (code, customer_name, service_type, status, note, updated_at) 
      VALUES (${code.toUpperCase()}, ${customer_name}, ${service_type}, 'Đang xử lý', ${note}, NOW())
    `;
    return NextResponse.json({ success: true, message: "Tạo hồ sơ thành công!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi hệ thống khi tạo hồ sơ." }, { status: 500 });
  }
}

// 3. API Cập nhật hồ sơ (Cập nhật trạng thái hoặc Cập nhật toàn bộ thông tin)
export async function PUT(request) {
  try {
    const { id, status, note, customer_name, service_type } = await request.json();

    if (customer_name) {
      // Nếu có gửi lên customer_name -> Đây là thao tác Cập nhật từ Form Sửa
      await sql`
        UPDATE documents 
        SET customer_name = ${customer_name}, service_type = ${service_type}, note = ${note}, updated_at = NOW() 
        WHERE id = ${id}
      `;
    } else {
      // Nếu không có -> Đây là thao tác cập nhật Trạng thái nhanh từ Bảng
      await sql`
        UPDATE documents 
        SET status = ${status}, note = ${note}, updated_at = NOW() 
        WHERE id = ${id}
      `;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Không thể cập nhật." }, { status: 500 });
  }
}

// 4. API Xóa hồ sơ
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ success: false, error: "Thiếu ID" }, { status: 400 });

    await sql`DELETE FROM documents WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: "Xóa thành công!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Không thể xóa hồ sơ." }, { status: 500 });
  }
}