// app/api/admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// ดึงข้อมูล admin ทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // ตรวจสอบสิทธิ์ Super Admin
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์เข้าถึงข้อมูล' },
        { status: 403 }
      );
    }
    
    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(admins);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูล admin:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูล admin' },
      { status: 500 }
    );
  }
}

// เพิ่ม admin ใหม่
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // ตรวจสอบสิทธิ์ Super Admin
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์เพิ่มผู้ดูแลระบบ' },
        { status: 403 }
      );
    }
    
    const { username, password, role } = await request.json();
    
    // ตรวจสอบว่า username ซ้ำหรือไม่
    const existingAdmin = await prisma.admin.findUnique({
      where: { username },
    });
    
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      );
    }
    
    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // สร้าง admin ใหม่
    const newAdmin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        role: role as 'ADMIN' | 'SUPER_ADMIN',
      },
    });
    
    // ส่งข้อมูลกลับโดยไม่เปิดเผยรหัสผ่าน
    const { password: _, ...adminWithoutPassword } = newAdmin;
    
    return NextResponse.json(adminWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเพิ่ม admin:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการเพิ่มผู้ดูแลระบบ' },
      { status: 500 }
    );
  }
}