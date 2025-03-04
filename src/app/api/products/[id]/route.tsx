// src/app/api/products/[id]/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth-options';

const prisma = new PrismaClient();

interface ProductData {
  sku: string;
  name: string;
  price: number;
  product_type?: string | null;
  product_set?: string | null;
}

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
      where: { 
        id_sku: { 
          id, 
          sku: "" 
        } 
      },
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
    
    const data = await request.json() as ProductData;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.sku || !data.name || !data.price) {
      return NextResponse.json(
        { message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (รหัสสินค้า, ชื่อ, ราคา)' },
        { status: 400 }
      );
    }
    
    // อัพเดทข้อมูลสินค้า
    const product = await prisma.product.update({
      where: { 
        id_sku: { 
          id, 
          sku: "" 
        } 
      },
      data: {
        sku: data.sku,
        name_sku: data.name,
        price_origin: data.price,
        catagory: data.product_type || null,
        collaction: data.product_set || null,
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
      where: { 
        id_sku: { 
          id, 
          sku: "" 
        } 
      },
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