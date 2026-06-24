import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // ... Đoạn code lấy dữ liệu từ Database của bạn ...
  const documents = await getDocumentsFromDb(); 

  // Trả về dữ liệu kèm theo Header cấm Caching tuyệt đối
  return NextResponse.json(
    { data: documents },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    }
  );
}

export async function POST(request) {
  try {
    const { notary_public, document_name, customer_a, customer_b, content, note, drafter, clerk, status } = await request.json();
    
    const { rows } = await sql`
      SELECT code FROM documents 
      WHERE code LIKE 'HS-%' 
      ORDER BY id DESC LIMIT 1
    `;

    let nextCode = 'HS-01';

    if (rows.length > 0) {
      const lastCode = rows[0].code; 
      const lastNumber = parseInt(lastCode.replace('HS-', ''), 10);
      if (!isNaN(lastNumber)) {
        const newNumber = lastNumber + 1;
        nextCode = `HS-${newNumber.toString().padStart(2, '0')}`;
      }
    }

    await sql`
      INSERT INTO documents (
        code, notary_public, document_name, customer_a, customer_b, 
        content, note, drafter, clerk, status, updated_at, created_at
      ) VALUES (
        ${nextCode}, ${notary_public}, ${document_name}, ${customer_a}, ${customer_b}, 
        ${content}, ${note}, ${drafter}, ${clerk}, ${status || '1. Tiếp nhận yêu cầu'}, NOW(), NOW()
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
    const { id, status, note, customer_a, total_amount } = data;

    // Trường hợp 1: Sửa từ Form Admin (có trường customer_a)
    if (customer_a) {
      const { notary_public, document_name, customer_b, content, drafter, clerk } = data;
      await sql`
        UPDATE documents 
        SET notary_public = ${notary_public}, document_name = ${document_name}, 
            customer_a = ${customer_a}, customer_b = ${customer_b}, 
            content = ${content}, note = ${note}, drafter = ${drafter}, clerk = ${clerk}, 
            status = ${status}, 
            updated_at = NOW(),
            completed_at = CASE WHEN ${status} = '8. Hoàn thành' THEN COALESCE(completed_at, NOW()) ELSE NULL END
        WHERE id = ${id}
      `;
    } 
    // Trường hợp 2: Cập nhật riêng "Thành tiền" từ trang Report
    else if (total_amount !== undefined) {
      await sql`
        UPDATE documents 
        SET total_amount = ${total_amount}, updated_at = NOW()
        WHERE id = ${id}
      `;
    } 
    // Trường hợp 3: Sửa nhanh Trạng thái / Ghi chú từ bảng Admin
    else {
      await sql`
        UPDATE documents 
        SET status = ${status}, note = ${note}, updated_at = NOW(),
            completed_at = CASE WHEN ${status} = '9. Hoàn thành' THEN COALESCE(completed_at, NOW()) ELSE NULL END
        WHERE id = ${id}
      `;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Không thể cập nhật." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleteAll = searchParams.get('deleteAll');

    // 1. NHÁNH MỚI: Nếu có lệnh xóa toàn bộ
    if (deleteAll === 'true') {
      await sql`DELETE FROM documents`;
      return NextResponse.json({ success: true, message: "Đã dọn dẹp toàn bộ cơ sở dữ liệu!" });
    }

    // 2. NHÁNH CŨ: Xóa từng hồ sơ đơn lẻ
    if (!id) return NextResponse.json({ success: false, error: "Thiếu ID" }, { status: 400 });
    await sql`DELETE FROM documents WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: "Xóa thành công!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Không thể xóa hồ sơ." }, { status: 500 });
  }
}