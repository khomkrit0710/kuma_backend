// middleware.tsx
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // ตรวจสอบว่าเป็น API route หรือไม่
  if (path.startsWith('/api/')) {
    // ปล่อยให้ API ทำงานได้โดยไม่มีการ redirect
    return NextResponse.next();
  }
  
  // กำหนดเส้นทางที่สามารถเข้าถึงได้โดยไม่ต้องล็อกอิน
  const publicPaths = ['/login', '/api-test'];
  const isPublicPath = publicPaths.includes(path);
  
  // กำหนดเส้นทางที่ต้องใช้สิทธิ์ Super Admin
  const superAdminPaths = ['/admin/manage'];
  const isSuperAdminPath = superAdminPaths.some(prefix => path.startsWith(prefix));
  
  // ดึงข้อมูล session token (ถ้ามี)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // ถ้าไม่ได้ล็อกอินและกำลังพยายามเข้าถึงเส้นทางที่ต้องล็อกอิน
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // ถ้าล็อกอินแล้วและกำลังพยายามเข้าถึงหน้า login
  if (token && isPublicPath && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // ถ้ากำลังพยายามเข้าถึงเส้นทางที่ต้องใช้สิทธิ์ Super Admin แต่ไม่มีสิทธิ์
  if (isSuperAdminPath && token?.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// กำหนดให้ middleware ทำงานเฉพาะเส้นทางที่ต้องการ
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /_next (Next.js internals)
     * 2. /static (public files)
     * 3. .*\\..*$ (files with extensions, e.g. favicon.ico)
     */
    '/((?!_next|static|.*\\..*$).*)',
  ],
};