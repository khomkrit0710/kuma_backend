// app/api/admin/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

type CustomUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
};

// ดึงข้อมูล admin ทั้งหมด
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // ตรวจสอบสิทธิ์ Super Admin
    if (!session?.user || (session.user as CustomUser).role !== 'SUPER_ADMIN') {
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

interface AdminRequestBody {
  username: string;
  password: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

// เพิ่ม admin ใหม่
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // ตรวจสอบสิทธิ์ Super Admin
    if (!session?.user || (session.user as CustomUser).role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์เพิ่มผู้ดูแลระบบ' },
        { status: 403 }
      );
    }
    
    const data = await request.json() as AdminRequestBody;
    const { username, password, role } = data;
    
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
        role: role,
      },
    });
    
    // ส่งข้อมูลกลับโดยไม่เปิดเผยรหัสผ่าน
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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