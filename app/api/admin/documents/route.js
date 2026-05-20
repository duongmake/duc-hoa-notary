import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM documents ORDER BY updated_at DESC`;
    return NextResponse.json({ success: true, data: rows }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Không thể tải danh sách." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Không nhận 'code' từ giao diện nữa, vì chúng ta sẽ tự tạo
    const { notary_public, document_name, customer_a, customer_b, content, note, drafter, clerk } = await request.json();
    
    // 1. TÌM MÃ HỒ SƠ LỚN NHẤT HIỆN TẠI
    const { rows } = await sql`
      SELECT code FROM documents 
      WHERE code LIKE 'HS-%' 
      ORDER BY id DESC LIMIT 1
    `;

    let nextCode = 'HS-01'; // Mặc định nếu chưa có hồ sơ nào

    if (rows.length > 0) {
      const lastCode = rows[0].code; // Ví dụ: "HS-09"
      // Cắt bỏ chữ "HS-", lấy phần số và chuyển thành số nguyên (integer)
      const lastNumber = parseInt(lastCode.replace('HS-', ''), 10);
      
      if (!isNaN(lastNumber)) {
        const newNumber = lastNumber + 1;
        // Format lại thành số có 2 chữ số (nếu số < 10 sẽ tự thêm số 0 ở đầu)
        nextCode = `HS-${newNumber.toString().padStart(2, '0')}`;
      }
    }

    // 2. LƯU VÀO DATABASE VỚI MÃ VỪA TẠO
    await sql`
      INSERT INTO documents (
        code, notary_public, document_name, customer_a, customer_b, 
        content, note, drafter, clerk, status, updated_at
      ) VALUES (
        ${nextCode}, ${notary_public}, ${document_name}, ${customer_a}, ${customer_b}, 
        ${content}, ${note}, ${drafter}, ${clerk}, '1. Tiếp nhận yêu cầu', NOW()
      )
    `;
    return NextResponse.json({ success: true, message: "Tạo hồ sơ thành công!", code: nextCode });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Lỗi hệ thống khi tạo hồ sơ." }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, status, note, customer_a } = data;

    if (customer_a) {
      const { notary_public, document_name, customer_b, content, drafter, clerk } = data;
      await sql`
        UPDATE documents 
        SET notary_public = ${notary_public}, document_name = ${document_name}, 
            customer_a = ${customer_a}, customer_b = ${customer_b}, 
            content = ${content}, note = ${note}, drafter = ${drafter}, clerk = ${clerk}, 
            updated_at = NOW() 
        WHERE id = ${id}
      `;
    } else {
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