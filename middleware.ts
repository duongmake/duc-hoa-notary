import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Kiểm tra xem khách vào web đã có Cookie "vpcc_auth" chưa
  const hasAuth = request.cookies.get('vpcc_auth');

  // Nếu chưa có thẻ thông hành -> Bắt buộc bẻ lái về trang /login
  if (!hasAuth) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Nếu có rồi -> Cho đi tiếp vào trong
  return NextResponse.next();
}

// Cấu hình: Người gác cổng chỉ đứng chặn ở 2 phòng này:
export const config = {
  matcher: ['/report', '/report/:path*'],
  //matcher: ['/admin', '/admin/:path*', '/report', '/report/:path*'],
};