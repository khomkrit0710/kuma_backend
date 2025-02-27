// src/app/api/products/route.ts (แบบง่าย)
import { NextResponse } from 'next/server';

// API endpoint สำหรับดึงข้อมูลสินค้าทั้งหมด
export async function GET() {
  return NextResponse.json({ message: 'API ทำงานปกติ', status: 'success' });
}

// API endpoint สำหรับเพิ่มสินค้าใหม่
export async function POST(request) {
  try {
    // ตรวจสอบว่า request มีข้อมูลหรือไม่
    let data;
    try {
      data = await request.json();
    } catch (e) {
      console.error('ไม่สามารถอ่านข้อมูล JSON ได้:', e);
      return NextResponse.json(
        { message: 'ข้อมูลไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    console.log('ข้อมูลที่ได้รับ:', data);

    return NextResponse.json(
      { message: 'ได้รับข้อมูลสำเร็จ', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}