// src/app/api/products/item/[id]/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/auth-options';

const prisma = new PrismaClient();

// API endpoint สำหรับลบสินค้าเฉพาะรายการ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    
    // รับ ID และ SKU จาก URL query
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku');
    const uuid = searchParams.get('uuid');
    
    if (!id || !sku) {
      return NextResponse.json(
        { message: 'ต้องระบุ ID และ SKU' },
        { status: 400 }
      );
    }
    
    // แปลง id จาก string เป็น number
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json(
        { message: 'ID ไม่ถูกต้อง' },
        { status: 400 }
      );
    }
    
    // ตรวจสอบว่าสินค้าที่ต้องการลบมีอยู่หรือไม่
    const existingProduct = await prisma.product.findFirst({
      where: { 
        id: productId,
        sku: sku
      },
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { message: 'ไม่พบสินค้า' },
        { status: 404 }
      );
    }
    
    // ลบสินค้า
    await prisma.product.delete({
      where: { 
        id_sku: {
          id: productId,
          sku: sku
        }
      },
    });
    
    // ถ้ามี uuid ให้อัพเดทรายการ sku ในกลุ่มสินค้าด้วย
    if (uuid) {
      // ดึงข้อมูลกลุ่มสินค้า
      const group = await prisma.group_product.findFirst({
        where: { uuid },
      });
      
      if (group) {
        // อัพเดทรายการ sku ในกลุ่มสินค้า โดยลบ sku ที่ถูกลบออกไป
        await prisma.group_product.update({
          where: { id: group.id },
          data: {
            sku: group.sku.filter(s => s !== sku),
          },
        });
      }
    }
    
    return NextResponse.json({
      message: 'ลบสินค้าสำเร็จ',
    });
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