'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Eye, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface GroupProduct {
  id: number;
  uuid: string;
  create_Date: string;
  group_name: string;
  sku: string[];
  main_img_url: string[];
  description: string;
}

export default function ProductList() {
  const { status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<GroupProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // ตรวจสอบสถานะการล็อกอิน
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchGroups();
    }
  }, [status, router]);

  // ดึงข้อมูลกลุ่มสินค้า
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products/group');
      
      if (!response.ok) {
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
      
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      console.error('เกิดข้อผิดพลาด:', err);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  };

  // ลบกลุ่มสินค้า
  const deleteGroup = async (uuid: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/group/${uuid}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
      
      // อัปเดตรายการหลังลบ
      setGroups(groups.filter(group => group.uuid !== uuid));
      setConfirmDelete(null);
    } catch (err) {
      console.error('เกิดข้อผิดพลาด:', err);
      setError('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // แสดงกล่องยืนยันการลบ
  const showDeleteConfirm = (uuid: string) => {
    setConfirmDelete(uuid);
  };

  // ปิดกล่องยืนยันการลบ
  const closeDeleteConfirm = () => {
    setConfirmDelete(null);
  };

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

  const ImageFallback = ({ src, alt, className }: { src: string, alt: string, className: string }) => {
    return (
      <div className={className}>
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            onError={(e) => {
              // Handle image load error - setting fallback image URL
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/40?text=X';
            }}
          />
        </div>
      </div>
    );
  };

  if (status === 'loading' || loading) {
    return <div className="p-8">กำลังโหลด...</div>;
  }

  if (status === 'unauthenticated') {
    return null; // จะ redirect ไปที่หน้า login โดย useEffect
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">รายการกลุ่มสินค้า</h1>
        <Link
          href="/products/add"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Package size={20} />
          เพิ่มกลุ่มสินค้าใหม่
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {groups.length === 0 ? (
        <div className="bg-white p-8 rounded shadow-md text-center">
          <p className="text-gray-500 mb-4">ยังไม่มีกลุ่มสินค้าในระบบ</p>
          <Link
            href="/products/add"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            เพิ่มกลุ่มสินค้าใหม่
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อกลุ่มสินค้า
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำนวนสินค้า
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  รูปภาพ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่สร้าง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groups.map((group) => (
                <tr key={group.uuid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{group.group_name}</div>
                    {group.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {group.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {group.sku.length} รายการ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {group.main_img_url && group.main_img_url.length > 0 ? (
                      <div className="flex -space-x-2">
                        {group.main_img_url.slice(0, 3).map((url, index) => (
                          <div key={index} className="h-10 w-10 rounded-full border-2 border-white overflow-hidden">
                            <div className="relative h-full w-full">
                              <Image
                                src={url}
                                alt={`รูปภาพ ${index + 1}`}
                                fill
                                sizes="40px"
                                className="object-cover"
                                onError={(e) => {
                                  // Handle image load error - setting fallback image URL
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/40?text=X';
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        {group.main_img_url.length > 3 && (
                          <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs">
                            +{group.main_img_url.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">ไม่มีรูปภาพ</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(group.create_Date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-3">
                      <Link
                        href={`/products/view/${group.uuid}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="ดูรายละเอียด"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={`/products/edit/${group.uuid}`}
                        className="text-indigo-600 hover:text-indigo-800"
                        title="แก้ไข"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => showDeleteConfirm(group.uuid)}
                        className="text-red-600 hover:text-red-800"
                        title="ลบ"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* กล่องยืนยันการลบ */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">ยืนยันการลบ</h2>
            <p className="mb-6">
              คุณต้องการลบกลุ่มสินค้านี้และสินค้าทั้งหมดในกลุ่มใช่หรือไม่? การกระทำนี้ไม่สามารถเปลี่ยนกลับได้
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteConfirm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => deleteGroup(confirmDelete)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}