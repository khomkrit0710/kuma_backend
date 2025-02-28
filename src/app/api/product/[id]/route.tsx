// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// API endpoint สำหรับดึงข้อมูลสินค้าตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'รหัสสินค้าไม่ถูกต้อง' },
        { status: 400 }
      );
    }
    
    const product = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) {
      return NextResponse.json(
        { message: 'ไม่พบสินค้า' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// API endpoint สำหรับแก้ไขข้อมูลสินค้า
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบการล็อกอิน
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'ต้องล็อกอินก่อนทำรายการนี้' },
        { status: 401 }
      );
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'รหัสสินค้าไม่ถูกต้อง' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.sku || !data.name || !data.price) {
      return NextResponse.json(
        { message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (รหัสสินค้า, ชื่อ, ราคา)' },
        { status: 400 }
      );
    }
    
    // อัพเดทข้อมูลสินค้า
    const product = await prisma.product.update({
      where: { id },
      data: {
        sku: data.sku,
        name: data.name,
        price: data.price,
        product_type: data.product_type || null,
        product_set: data.product_set || null,
      },
    });
    
    return NextResponse.json({ message: 'อัพเดทสินค้าสำเร็จ', product });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูลสินค้า:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลสินค้า' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// API endpoint สำหรับลบสินค้า
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบการล็อกอิน
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'ต้องล็อกอินก่อนทำรายการนี้' },
        { status: 401 }
      );
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'รหัสสินค้าไม่ถูกต้อง' },
        { status: 400 }
      );
    }
    
    // ลบสินค้า
    await prisma.product.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'ลบสินค้าสำเร็จ' });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบสินค้า:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการลบสินค้า' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}