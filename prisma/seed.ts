import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // เช็คว่ามี admin อยู่แล้วหรือไม่
  const adminCount = await prisma.admin.count();
  
  if (adminCount === 0) {
    // ถ้ายังไม่มี admin ให้สร้าง super admin คนแรก
    const hashedPassword = await bcrypt.hash('272@jumu', 10); // เปลี่ยนรหัสผ่านตามต้องการ
    
    await prisma.admin.create({
      data: {
        username: 'jumu',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    });
    
    console.log('Super Admin created successfully');
  } else {
    console.log('Admin accounts already exist');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });