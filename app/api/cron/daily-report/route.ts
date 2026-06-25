import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import * as XLSX from 'xlsx';

// 1. KẾT NỐI DATABASE CHUẨN CỦA VERCEL
import { sql } from '@vercel/postgres'; 

export async function GET(request: Request) {
  try {
    // 2. KÉO DỮ LIỆU THỰC TẾ TỪ KHO
    // Lệnh này sẽ lấy toàn bộ hồ sơ trong bảng documents và sắp xếp theo thời gian tạo mới nhất
    const result = await sql`SELECT * FROM documents ORDER BY created_at DESC`;
    const documents = result.rows;

    if (documents.length === 0) {
      return NextResponse.json({ message: 'Kho dữ liệu đang trống, bỏ qua gửi mail.' });
    }

    // 3. TẠO FILE EXCEL TRÊN SERVER
    const excelData = documents.map((doc: any) => ({
      'MÃ HỒ SƠ': doc.code,
      'LOẠI HỒ SƠ': doc.document_name || '-',
      'KHÁCH A (BÊN BÁN/TẶNG)': doc.customer_a || '-',
      'KHÁCH B (BÊN MUA/NHẬN)': doc.customer_b || '-',
      'CÔNG CHỨNG VIÊN': doc.notary_public || '-',
      'NHÂN VIÊN SOẠN THẢO': doc.drafter || '-',
      'NHÂN VIÊN PHOTO/TRÌNH KÝ': doc.clerk || '-',
      'TIẾN ĐỘ HIỆN TẠI': doc.status || '-',
      'GHI CHÚ VĂN PHÒNG': doc.note || '-',
      'THÀNH TIỀN (VND)': doc.total_amount || 0,
      'THỜI GIAN TIẾP NHẬN': doc.created_at ? new Date(doc.created_at).toLocaleString('vi-VN') : 'Chưa ghi nhận',
      'CẬP NHẬT CUỐI CÙNG': doc.updated_at ? new Date(doc.updated_at).toLocaleString('vi-VN') : 'Chưa ghi nhận',
      'THỜI GIAN HOÀN THÀNH': doc.completed_at ? new Date(doc.completed_at).toLocaleString('vi-VN') : 'Chưa hoàn thành',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bao_Cao');

    // Chỉnh độ rộng cột cho Excel đẹp hơn
    const columnWidths = Object.keys(excelData[0] || {}).map(() => ({ wch: 22 }));
    worksheet['!cols'] = columnWidths;

    // Ép file Excel ra dạng Buffer để đính kèm vào email
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 4. CẤU HÌNH TÀI KHOẢN GỬI MAIL 
    // Hãy thay thế email và Mật khẩu ứng dụng (App Password) của bạn vào đây
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'duongmake3@gmail.com', // Thay bằng email gửi
        pass: 'xozy zvzo zgul fqch'      // Thay bằng Mật khẩu ứng dụng (App Password)
      }
    });

    // 5. TIẾN HÀNH GỬI MAIL
    const today = new Date().toLocaleDateString('vi-VN');
    const mailOptions = {
      from: '"Hệ Thống VPCC Đức Hòa" <duongmake3@gmail.com>',
      to: 'vpccdh@gmail.com', // Thay bằng email bạn muốn nhận báo cáo
      subject: `📊 Báo Cáo Doanh Thu & Tiến Độ Hồ Sơ Cuối Ngày - ${today}`,
      text: `Xin chào,\n\nHệ thống tự động xuất và gửi báo cáo tổng hợp hồ sơ của văn phòng ngày ${today}.\n\nChi tiết vui lòng xem trong file Excel đính kèm.\n\nTrân trọng,\nHệ thống tự động VPCC.`,
      attachments: [
        {
          filename: `Bao_Cao_VPCC_Duc_Hoa_${today.replace(/\//g, '_')}.xlsx`,
          content: excelBuffer,
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Đã xuất Database ra Excel và gửi email thành công!' });

  } catch (error) {
    console.error('Lỗi hệ thống gửi mail:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi kết nối DB hoặc gửi email' }, { status: 500 });
  }
}