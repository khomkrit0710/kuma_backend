'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AddProduct() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // แบบฟอร์มสำหรับเพิ่มสินค้า
  const [product, setProduct] = useState({
    sku: '',
    name: '',
    price: '',
    product_type: '',
    product_set: ''
  });

  // ตรวจสอบสถานะการล็อกอิน
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // อัพเดทข้อมูลสินค้า
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // บันทึกข้อมูลสินค้า
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('กำลังส่งข้อมูล:', product);
      
      // แปลงราคาเป็นตัวเลข
      const productData = {
        ...product,
        price: parseInt(product.price)
      };
      
      // ใช้ URL ที่ถูกต้องตามโครงสร้างของ Next.js
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      console.log('ข้อมูลการตอบกลับ - status:', response.status);
      console.log('ข้อมูลการตอบกลับ - headers:', Object.fromEntries(response.headers.entries()));
      
      // ตรวจสอบว่าเป็น error page หรือไม่
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        console.error('ได้รับการตอบกลับเป็น HTML แทน JSON:', text.substring(0, 200));
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับ API');
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log('ข้อมูลที่ได้รับ:', data);
      
      if (response.ok) {
        setSuccess('เพิ่มสินค้าสำเร็จ');
        // รีเซ็ตแบบฟอร์ม
        setProduct({
          sku: '',
          name: '',
          price: '',
          product_type: '',
          product_set: ''
        });
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า');
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาด:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="p-8">กำลังโหลด...</div>;
  }

  if (status === 'unauthenticated') {
    return null; // จะ redirect ไปที่หน้า login โดย useEffect
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">เพิ่มสินค้าใหม่</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-white p-6 rounded shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                รหัสสินค้า (SKU)
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                className="w-full p-2 border border-gray-300 rounded"
                value={product.sku}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อสินค้า
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full p-2 border border-gray-300 rounded"
                value={product.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                ราคา (บาท)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                className="w-full p-2 border border-gray-300 rounded"
                value={product.price}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="product_type" className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทสินค้า
              </label>
              <input
                type="text"
                id="product_type"
                name="product_type"
                className="w-full p-2 border border-gray-300 rounded"
                value={product.product_type}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="product_set" className="block text-sm font-medium text-gray-700 mb-1">
                คอลเลคชัน
              </label>
              <input
                type="text"
                id="product_set"
                name="product_set"
                className="w-full p-2 border border-gray-300 rounded"
                value={product.product_set}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}