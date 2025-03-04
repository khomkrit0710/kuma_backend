'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Tag, Package2, ShoppingCart, Box, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';


      //<<-------------------Type------------------->>
interface Product {
  id: number;
  uuid: string;
  create_Date: string;
  group_name: string;
  sku: string;
  name_sku: string;
  quantity: number;
  catagory: string | null;
  collaction: string | null;
  make_price: number | null;
  price_origin: number;
  product_width: number | null;
  product_length: number | null;
  product_heigth: number | null;
  product_weight: number | null;
  img_url: string | null;
}

interface GroupProduct {
  id: number;
  uuid: string;
  create_Date: string;
  group_name: string;
  sku: string[];
  main_img_url: string[];
  description: string;
}

interface GroupData {
  group: GroupProduct;
  products: Product[];
}

export default function ViewProduct() {

        //<<-------------------State------------------->>
  const params = useParams();
  const uuid = params.uuid as string;
  
  const { status } = useSession();
  const router = useRouter();
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'products'>('info');
  const [activeImageIndex, setActiveImageIndex] = useState(0);


      //<<-------------------Function------------------->>
  // ดึงข้อมูลกลุ่มสินค้าและสินค้าทั้งหมด
  const fetchGroupData = useCallback(async () => {
    if (!uuid) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/products/group/${uuid}`, {
        // เพิ่ม cache: 'no-store' เพื่อไม่ให้ browser cache ข้อมูล
        cache: 'no-store',
        // เพิ่ม headers เพื่อป้องกัน cache จากทุกระดับ
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate', 
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
      
      const data = await response.json();
      setGroupData(data);
    } catch (err) {
      console.error('เกิดข้อผิดพลาด:', err);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  // ตรวจสอบสถานะการล็อกอิน
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchGroupData();
    }
  }, [status, router, fetchGroupData]);

  // แปลงวันที่ให้อยู่ในรูปแบบที่อ่านง่าย
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // จะ redirect ไปที่หน้า login โดย useEffect
  }

  if (error || !groupData) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error || 'ไม่พบข้อมูลกลุ่มสินค้า'}
        </div>
        <Link
          href="/products/list"
          className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          กลับไปหน้ารายการสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/products/list"
          className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          กลับ
        </Link>
        <h1 className="text-3xl font-bold">รายละเอียดกลุ่มสินค้า</h1>
        <div className="ml-auto">
          <Link
            href={`/products/edit/${uuid}`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            <Edit size={16} />
            แก้ไข
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* แสดงรูปภาพด้านซ้าย */}
          <div className="w-full md:w-1/2 p-6 bg-gray-50">
            {groupData.group.main_img_url && groupData.group.main_img_url.length > 0 ? (
              <div>
                <div className="mb-4 rounded-lg overflow-hidden bg-white border">
                  <div className="relative w-full h-96">
                    <Image
                      src={groupData.group.main_img_url[activeImageIndex]}
                      alt={`รูปภาพ ${activeImageIndex + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain"
                      onError={(e) => {
                        // Handle image load error - setting fallback image URL
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                      }}
                    />
                  </div>
                </div>
                {groupData.group.main_img_url.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {groupData.group.main_img_url.map((url, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer border ${
                          index === activeImageIndex
                            ? 'border-blue-500 ring-2 ring-blue-500'
                            : 'border-gray-200'
                        } rounded overflow-hidden`}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <div className="relative w-full h-16">
                          <Image
                            src={url}
                            alt={`รูปภาพย่อ ${index + 1}`}
                            fill
                            sizes="60px"
                            className="object-cover"
                            onError={(e) => {
                              // Handle image load error - setting fallback image URL
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/60x60?text=X';
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-lg border border-dashed border-gray-300">
                <Package2 size={64} className="text-gray-400 mb-4" />
                <p className="text-gray-500">ไม่มีรูปภาพ</p>
              </div>
            )}
          </div>

          {/* แสดงข้อมูลด้านขวา */}
          <div className="w-full md:w-1/2 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={16} className="text-gray-500" />
              <p className="text-sm text-gray-500">
                สร้างเมื่อ: {formatDate(groupData.group.create_Date)}
              </p>
            </div>
            <h2 className="text-2xl font-bold mb-4">{groupData.group.group_name}</h2>

            {/* แถบแสดงรายละเอียด/รายการสินค้า */}
            <div className="border-b border-gray-200 mb-4">
              <div className="flex">
                <button
                  className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'info'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('info')}
                >
                  <Info size={16} />
                  รายละเอียด
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'products'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('products')}
                >
                  <Box size={16} />
                  รายการสินค้า ({groupData.products.length})
                </button>
              </div>
            </div>

            {/* แสดงรายละเอียด */}
            {activeTab === 'info' && (
              <div>
                <div className="prose max-w-none">
                  <h3 className="text-lg font-medium mb-2">คำอธิบาย</h3>
                  {groupData.group.description ? (
                    <div className="whitespace-pre-wrap">
                      {groupData.group.description}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">ไม่มีคำอธิบาย</p>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">ข้อมูลสินค้า</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-500">จำนวนสินค้าในกลุ่ม</p>
                      <p className="text-xl font-bold">{groupData.products.length} รายการ</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-500">จำนวนสินค้าทั้งหมด</p>
                      <p className="text-xl font-bold">
                        {groupData.products.reduce((sum, product) => sum + product.quantity, 0)} ชิ้น
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-500">หมวดหมู่</p>
                      <p className="text-xl font-bold">
                        {[
                          ...new Set(
                            groupData.products
                              .map((product) => product.catagory)
                              .filter(Boolean)
                          ),
                        ].join(', ') || 'ไม่มีหมวดหมู่'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-500">คอลเลคชัน</p>
                      <p className="text-xl font-bold">
                        {[
                          ...new Set(
                            groupData.products
                              .map((product) => product.collaction)
                              .filter(Boolean)
                          ),
                        ].join(', ') || 'ไม่มีหมวดหมู่'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* แสดงรายการสินค้า */}
            {activeTab === 'products' && (
              <div className="overflow-y-auto max-h-[500px]">
                {groupData.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-start gap-4 p-4 border-b border-gray-100 hover:bg-gray-50"
                  >
                    <div className="w-16 h-16 bg-gray-100 flex-shrink-0 rounded overflow-hidden">
                      {product.img_url ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={product.img_url}
                            alt={product.name_sku}
                            fill
                            sizes="(max-width: 768px) 64px, 64px"
                            className="object-cover"
                            onError={(e) => {
                              // Handle image load error
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/60x60?text=X';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{product.name_sku}</h4>
                          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{product.price_origin.toLocaleString()} บาท</p>
                          <p className="text-sm">คงเหลือ: {product.quantity} ชิ้น</p>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        {product.catagory && (
                          <p>
                            <span className="text-gray-500">หมวดหมู่:</span> {product.catagory}
                          </p>
                        )}
                        {product.collaction && (
                          <p>
                            <span className="text-gray-500">คอลเลคชัน:</span> {product.collaction}
                          </p>
                        )}
                        {product.make_price && (
                          <p>
                            <span className="text-gray-500">ต้นทุน:</span> {product.make_price} บาท
                          </p>
                        )}
                        {(product.product_width || product.product_length || product.product_heigth) && (
                          <p>
                            <span className="text-gray-500">ขนาด:</span>{' '}
                            {product.product_width || '-'} x {product.product_length || '-'} x{' '}
                            {product.product_heigth || '-'} ซม.
                          </p>
                        )}
                        {product.product_weight && (
                          <p>
                            <span className="text-gray-500">น้ำหนัก:</span> {product.product_weight} กรัม
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}