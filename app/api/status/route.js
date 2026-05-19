import { NextResponse } from 'next/server';

// Dữ liệu giả lập cho VPCC Đức Hòa
const mockDatabase = {
  "DH123": { 
    status: "Đã hoàn thành", 
    date: "15/05/2024", 
    note: "Vui lòng mang theo CCCD và bản gốc để đối chiếu khi đến nhận." 
  },
  "DH456": { 
    status: "Đang xử lý", 
    date: "18/05/2024", 
    note: "Đang chờ công chứng viên ký duyệt." 
  }
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: "Vui lòng nhập mã hồ sơ." }, { status: 400 });
  }

  const record = mockDatabase[code.toUpperCase()];
  if (record) {
    return NextResponse.json({ success: true, data: record });
  } else {
    return NextResponse.json({ success: false, error: "Không tìm thấy hồ sơ với mã này. Vui lòng kiểm tra lại!" }, { status: 404 });
  }
}