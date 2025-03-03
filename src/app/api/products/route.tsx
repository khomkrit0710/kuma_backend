// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// API endpoint สำหรับดึงข้อมูลสินค้าทั้งหมด
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(products);
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

// API endpoint สำหรับเพิ่มสินค้าใหม่
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบการล็อกอิน (ถ้าต้องการ)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'ต้องล็อกอินก่อนทำรายการนี้' },
        { status: 401 }
      );
    }
    
    // อ่านข้อมูลจาก request
    const data = await request.json();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.sku || !data.name || !data.price) {
      return NextResponse.json(
        { message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (รหัสสินค้า, ชื่อ, ราคา)' },
        { status: 400 }
      );
    }
    
    // เพิ่มสินค้าใหม่ลงในฐานข้อมูล
    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        price: parseInt(data.price),
        product_type: data.product_type || null,
        product_set: data.product_set || null,
      },
    });
    
    return NextResponse.json({ message: 'เพิ่มสินค้าสำเร็จ', product }, { status: 201 });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเพิ่มสินค้า:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}