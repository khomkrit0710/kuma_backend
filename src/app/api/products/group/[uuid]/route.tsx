// src/app/api/products/group/[uuid]/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

interface ProductData {
  sku: string;
  name_sku: string;
  quantity?: number;
  catagory?: string | null;
  collaction?: string | null;
  make_price?: number | null;
  price_origin?: number;
  product_width?: number | null;
  product_length?: number | null;
  product_heigth?: number | null;
  product_weight?: number | null;
  img_url?: string | null;
}

interface GroupData {
  group_name?: string;
  description?: string;
  main_img_url?: string[];
  sku?: string[];
}

interface RequestData {
  group: GroupData;
  products: ProductData[];
}

// API endpoint สำหรับดึงข้อมูลกลุ่มสินค้าและสินค้าที่เกี่ยวข้องตาม UUID
export async function GET(
  request: NextRequest,
  context: { params: { uuid: string } }
) {
  try {
    const uuid = context.params.uuid;
    
    if (!uuid) {
      return NextResponse.json(
        { message: 'ต้องระบุ UUID' },
        { status: 400 }
      );
    }
    
    // ดึงข้อมูลกลุ่มสินค้า
    const group = await prisma.group_product.findFirst({
      where: { uuid },
    });
    
    if (!group) {
      return NextResponse.json(
        { message: 'ไม่พบกลุ่มสินค้า' },
        { status: 404 }
      );
    }
    
    // ดึงข้อมูลสินค้าทั้งหมดในกลุ่ม
    const products = await prisma.product.findMany({
      where: { uuid },
    });
    
    return NextResponse.json({
      group,
      products,
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลกลุ่มสินค้า:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลกลุ่มสินค้า' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// API endpoint สำหรับแก้ไขข้อมูลกลุ่มสินค้า
export async function PUT(
  request: NextRequest,
  context: { params: { uuid: string } }
) {
  try {
    const uuid = context.params.uuid;
    
    // ตรวจสอบการล็อกอิน
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'ต้องล็อกอินก่อนทำรายการนี้' },
        { status: 401 }
      );
    }
    
    if (!uuid) {
      return NextResponse.json(
        { message: 'ต้องระบุ UUID' },
        { status: 400 }
      );
    }
    
    // อ่านข้อมูลจาก request
    const data = await request.json() as RequestData;
    const { group, products } = data;
    
    // ตรวจสอบว่ากลุ่มสินค้าที่ต้องการแก้ไขมีอยู่หรือไม่
    const existingGroup = await prisma.group_product.findFirst({
      where: { uuid },
    });
    
    if (!existingGroup) {
      return NextResponse.json(
        { message: 'ไม่พบกลุ่มสินค้า' },
        { status: 404 }
      );
    }
    
    // อัปเดตข้อมูลกลุ่มสินค้า
    const updatedGroup = await prisma.group_product.update({
      where: { id: existingGroup.id },
      data: {
        group_name: group.group_name || existingGroup.group_name,
        description: group.description || existingGroup.description,
        main_img_url: group.main_img_url || existingGroup.main_img_url,
        sku: products.map(p => p.sku), // อัปเดต SKU ตามรายการสินค้าใหม่
      },
    });
    
    // อัปเดตหรือเพิ่มสินค้า
    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        // ตรวจสอบว่าสินค้านี้มีอยู่แล้วหรือไม่
        const existingProduct = await prisma.product.findFirst({
          where: {
            uuid,
            sku: product.sku,
          },
        });
        
        if (existingProduct) {
          // ถ้ามีอยู่แล้วให้อัปเดต
          return prisma.product.update({
            where: { id_sku: { id: existingProduct.id, sku: existingProduct.sku } },
            data: {
              name_sku: product.name_sku || existingProduct.name_sku,
              quantity: product.quantity ?? existingProduct.quantity,
              catagory: product.catagory ?? existingProduct.catagory,
              collaction: product.collaction ?? existingProduct.collaction,
              make_price: product.make_price ?? existingProduct.make_price,
              price_origin: product.price_origin ?? existingProduct.price_origin,
              product_width: product.product_width ?? existingProduct.product_width,
              product_length: product.product_length ?? existingProduct.product_length,
              product_heigth: product.product_heigth ?? existingProduct.product_heigth,
              product_weight: product.product_weight ?? existingProduct.product_weight,
              img_url: product.img_url ?? existingProduct.img_url,
            },
          });
        } else {
          // ถ้าไม่มีให้เพิ่มใหม่
          return prisma.product.create({
            data: {
              uuid,
              group_name: updatedGroup.group_name,
              sku: product.sku,
              name_sku: product.name_sku,
              quantity: product.quantity || 0,
              catagory: product.catagory || null,
              collaction: product.collaction || null,
              make_price: product.make_price || null,
              price_origin: product.price_origin || 0,
              product_width: product.product_width || null,
              product_length: product.product_length || null,
              product_heigth: product.product_heigth || null,
              product_weight: product.product_weight || null,
              img_url: product.img_url || null,
            },
          });
        }
      })
    );
    
    return NextResponse.json({
      message: 'อัปเดตข้อมูลเรียบร้อยแล้ว',
      group: updatedGroup,
      products: updatedProducts,
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูลกลุ่มสินค้า:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลกลุ่มสินค้า' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// API endpoint สำหรับลบกลุ่มสินค้าและสินค้าที่เกี่ยวข้อง
export async function DELETE(
  request: NextRequest,
  context: { params: { uuid: string } }
) {
  try {
    const uuid = context.params.uuid;
    
    // ตรวจสอบการล็อกอิน
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'ต้องล็อกอินก่อนทำรายการนี้' },
        { status: 401 }
      );
    }
    
    if (!uuid) {
      return NextResponse.json(
        { message: 'ต้องระบุ UUID' },
        { status: 400 }
      );
    }
    
    // ตรวจสอบว่ากลุ่มสินค้าที่ต้องการลบมีอยู่หรือไม่
    const existingGroup = await prisma.group_product.findFirst({
      where: { uuid },
    });
    
    if (!existingGroup) {
      return NextResponse.json(
        { message: 'ไม่พบกลุ่มสินค้า' },
        { status: 404 }
      );
    }
    
    // ลบสินค้าทั้งหมดในกลุ่ม
    await prisma.product.deleteMany({
      where: { uuid },
    });
    
    // ลบกลุ่มสินค้า
    await prisma.group_product.delete({
      where: { id: existingGroup.id },
    });
    
    return NextResponse.json({
      message: 'ลบข้อมูลเรียบร้อยแล้ว',
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบข้อมูลกลุ่มสินค้า:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการลบข้อมูลกลุ่มสินค้า' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}