// app/layout.tsx
import './globals.css'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]/route'
import type { Metadata } from 'next'
import React from 'react'
import AuthProvider from './context/AuthProvider'
import Navbar from './component/Navbar'
import Sidebar from './component/Sidebar'

export const metadata: Metadata = {
  title: 'ระบบหลังบ้าน Kuma-mall',
  description: 'ระบบจัดการร้านค้าออนไลน์ Kuma-mall',
  keywords: 'admin, dashboard, kuma-mall'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);
  
  // ถ้าไม่มี session และไม่ได้อยู่ที่หน้า login ให้เปลี่ยนเป็น layout สำหรับคนที่ยังไม่ได้ login
  const isLoginPage = children.props?.childProp?.segment === 'login';
  
  if (!session && !isLoginPage) {
    return (
      <html lang="th">
        <body suppressHydrationWarning={true}>
          <AuthProvider>
            <main className="w-full min-h-screen">
              {children}
            </main>
          </AuthProvider>
        </body>
      </html>
    );
  }
  
  // ถ้ามี session หรืออยู่ที่หน้า login ให้แสดงตามปกติ
  return (
    <html lang="th">
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          {session ? (
            <>
              <Navbar session={session} />
              <div style={{display:"Grid", gridTemplateColumns:"15% 85%"}}>
                <Sidebar session={session} />
                <main>{children}</main>
              </div>
            </>
          ) : (
            <main>{children}</main>
          )}
        </AuthProvider>
      </body>
    </html>
  )
}

