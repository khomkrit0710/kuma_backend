// src/app/api/products/group/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/auth-options';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();


    //<<-------------------Type------------------->>
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
  group_name: string;
  description?: string;
  main_img_url?: string[];
}

interface RequestData {
  group: GroupData;
  products: ProductData[];
}


    //<<-------------------API------------------->>
// API endpoint สำหรับเพิ่มกลุ่มสินค้าและสินค้า
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบการล็อกอิน
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'ต้องล็อกอินก่อนทำรายการนี้' },
        { status: 401 }
      );
    }
    
    // อ่านข้อมูลจาก request
    const data = await request.json() as RequestData;
    const { group, products } = data;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!group.group_name || !products || products.length === 0) {
      return NextResponse.json(
        { message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อกลุ่มสินค้า, รายการสินค้า)' },
        { status: 400 }
      );
    }
    
    // สร้าง UUID สำหรับเชื่อมโยงกลุ่มสินค้าและสินค้า
    const groupUuid = randomUUID();
    
    // เตรียมข้อมูล SKU สำหรับบันทึกลงในกลุ่มสินค้า
    const productSkus = products.map(product => product.sku);
    
    // บันทึกข้อมูลกลุ่มสินค้า
    const newGroup = await prisma.group_product.create({
      data: {
        uuid: groupUuid,
        group_name: group.group_name,
        description: group.description || '',
        sku: productSkus,
        main_img_url: group.main_img_url || [],
      },
    });
    
    // บันทึกข้อมูลสินค้า
    const createdProducts = await Promise.all(
      products.map(async (product) => {
        return prisma.product.create({
          data: {
            uuid: groupUuid,
            group_name: group.group_name,
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
      })
    );
    
    return NextResponse.json({
      message: 'บันทึกข้อมูลเรียบร้อยแล้ว',
      group: newGroup,
      products: createdProducts,
    }, { status: 201 });
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเพิ่มกลุ่มสินค้า:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการเพิ่มกลุ่มสินค้า' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// API endpoint สำหรับดึงข้อมูลกลุ่มสินค้าทั้งหมด
export async function GET() {
  try {
    // ดึงข้อมูลกลุ่มสินค้าทั้งหมด
    const groups = await prisma.group_product.findMany({
      orderBy: { create_Date: 'desc' },
    });
    
    return NextResponse.json(groups);
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