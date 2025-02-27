// app/api/admin/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// ดึงข้อมูล admin คนเดียว
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // ตรวจสอบสิทธิ์ Super Admin
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์เข้าถึงข้อมูล' },
        { status: 403 }
      );
    }
    
    const id = parseInt(params.id);
    
    const admin = await prisma.admin.findUnique({
      where: { id },
    });
    
    if (!admin) {
      return NextResponse.json(
        { message: 'ไม่พบผู้ดูแลระบบ' },
        { status: 404 }
      );
    }
    
    // ส่งข้อมูลกลับโดยไม่เปิดเผยรหัสผ่าน
    const { password, ...adminWithoutPassword } = admin;
    
    return NextResponse.json(adminWithoutPassword);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูล admin:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูล admin' },
      { status: 500 }
    );
  }
}

// แก้ไขข้อมูล admin
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // ตรวจสอบสิทธิ์ Super Admin
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์แก้ไขข้อมูล' },
        { status: 403 }
      );
    }
    
    const id = parseInt(params.id);
    const { password, role } = await request.json();
    
    // ตรวจสอบว่า admin ที่ต้องการแก้ไขมีอยู่หรือไม่
    const existingAdmin = await prisma.admin.findUnique({
      where: { id },
    });
    
    if (!existingAdmin) {
      return NextResponse.json(
        { message: 'ไม่พบผู้ดูแลระบบ' },
        { status: 404 }
      );
    }
    
    const updateData: any = {};
    
    // ถ้ามีการส่งรหัสผ่านมาให้เข้ารหัสก่อนบันทึก
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    // ถ้ามีการส่งบทบาทมาให้อัปเดต
    if (role) {
      updateData.role = role;
    }
    
    // อัปเดตข้อมูล admin
    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: updateData,
    });
    
    // ส่งข้อมูลกลับโดยไม่เปิดเผยรหัสผ่าน
    const { password: _, ...adminWithoutPassword } = updatedAdmin;
    
    return NextResponse.json(adminWithoutPassword);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูล admin:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล admin' },
      { status: 500 }
    );
  }
}

// ลบ admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // ตรวจสอบสิทธิ์ Super Admin
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์ลบข้อมูล' },
        { status: 403 }
      );
    }
    
    const id = parseInt(params.id);
    
    // ตรวจสอบว่า admin ที่ต้องการลบมีอยู่หรือไม่
    const existingAdmin = await prisma.admin.findUnique({
      where: { id },
    });
    
    if (!existingAdmin) {
      return NextResponse.json(
        { message: 'ไม่พบผู้ดูแลระบบ' },
        { status: 404 }
      );
    }
    
    // ไม่อนุญาตให้ลบตัวเอง
    if (parseInt(session.user.id) === id) {
      return NextResponse.json(
        { message: 'ไม่สามารถลบบัญชีของตัวเองได้' },
        { status: 400 }
      );
    }
    
    // ลบ admin
    await prisma.admin.delete({
      where: { id },
    });
    
    return NextResponse.json(
      { message: 'ลบผู้ดูแลระบบสำเร็จ' },
      { status: 200 }
    );
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบ admin:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการลบผู้ดูแลระบบ' },
      { status: 500 }
    );
  }
}