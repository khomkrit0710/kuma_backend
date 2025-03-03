'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2, Save, Image, X, ArrowLeft, Edit, Check } from 'lucide-react';
import Link from 'next/link';

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

interface EditProductState extends Omit<Product, 'id' | 'uuid' | 'create_Date' | 'group_name'> {
  isNew?: boolean;
}

export default function EditProduct({ params }: { params: { uuid: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [originalData, setOriginalData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // ข้อมูลกลุ่มสินค้า
  const [groupData, setGroupData] = useState<GroupProduct | null>(null);
  
  // รายการสินค้าที่แก้ไข
  const [products, setProducts] = useState<EditProductState[]>([]);
  
  // สินค้าที่กำลังแก้ไข/เพิ่มใหม่
  const [editingProduct, setEditingProduct] = useState<EditProductState | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // URL รูปภาพที่กำลังกรอก
  const [tempImageUrl, setTempImageUrl] = useState('');

  // ดึงข้อมูลเมื่อโหลดหน้า
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchGroupData();
    }
  }, [status, router, params.uuid]);

  // ดึงข้อมูลกลุ่มสินค้าและสินค้า
  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/group/${params.uuid}`);
      
      if (!response.ok) {
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
      
      const data = await response.json();
      setOriginalData(data);
      
      // ตั้งค่าข้อมูลกลุ่มสินค้า
      setGroupData(data.group);
      
      // ตั้งค่ารายการสินค้า
      setProducts(data.products.map(product => ({
        sku: product.sku,
        name_sku: product.name_sku,
        quantity: product.quantity,
        catagory: product.catagory,
        collaction: product.collaction,
        make_price: product.make_price,
        price_origin: product.price_origin,
        product_width: product.product_width,
        product_length: product.product_length,
        product_heigth: product.product_heigth,
        product_weight: product.product_weight,
        img_url: product.img_url,
      })));
    } catch (err) {
      console.error('เกิดข้อผิดพลาด:', err);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  };

  // อัพเดทข้อมูลกลุ่มสินค้า
  const handleGroupChange = (e) => {
    const { name, value } = e.target;
    setGroupData(prev => ({
      ...prev!,
      [name]: value
    }));
  };

  // เพิ่ม URL รูปภาพลงในรายการ
  const addImageUrl = () => {
    if (!tempImageUrl.trim()) return;
    
    setGroupData(prev => ({
      ...prev!,
      main_img_url: [...prev!.main_img_url, tempImageUrl]
    }));
    setTempImageUrl('');
  };

  // ลบ URL รูปภาพออกจากรายการ
  const removeImageUrl = (index) => {
    setGroupData(prev => ({
      ...prev!,
      main_img_url: prev!.main_img_url.filter((_, i) => i !== index)
    }));
  };

  // เริ่มแก้ไขสินค้า
  const startEditProduct = (index: number) => {
    setEditingProduct({ ...products[index] });
    setEditingIndex(index);
  };

  // เริ่มเพิ่มสินค้าใหม่
  const startAddProduct = () => {
    setEditingProduct({
      sku: '',
      name_sku: '',
      quantity: 0,
      price_origin: 0,
      catagory: null,
      collaction: null,
      make_price: null,
      product_width: null,
      product_length: null,
      product_heigth: null,
      product_weight: null,
      img_url: null,
      isNew: true
    });
    setEditingIndex(null);
  };

  // ยกเลิกการแก้ไข/เพิ่มสินค้า
  const cancelEditProduct = () => {
    setEditingProduct(null);
    setEditingIndex(null);
  };

  // อัพเดทข้อมูลสินค้าที่กำลังแก้ไข
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    
    // แปลงข้อมูลตัวเลขให้ถูกต้อง
    if (['quantity', 'make_price', 'price_origin', 'product_width', 'product_length', 'product_heigth', 'product_weight'].includes(name)) {
      parsedValue = value === '' ? null : Number(value);
    }
    
    setEditingProduct(prev => ({
      ...prev!,
      [name]: parsedValue
    }));
  };

  // บันทึกการแก้ไข/เพิ่มสินค้า
  const saveEditProduct = () => {
    if (!editingProduct) return;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!editingProduct.sku || !editingProduct.name_sku) {
      setError('กรุณากรอกรหัสสินค้า (SKU) และชื่อสินค้า');
      return;
    }
    
    if (editingIndex !== null) {
      // อัปเดตสินค้าที่มีอยู่
      setProducts(prev => prev.map((product, i) => i === editingIndex ? editingProduct : product));
    } else {
      // เพิ่มสินค้าใหม่
      setProducts(prev => [...prev, editingProduct]);
    }
    
    setEditingProduct(null);
    setEditingIndex(null);
    setError('');
    setSuccess('บันทึกสินค้าสำเร็จ');
  };

  // ลบสินค้า
  const removeProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  // บันทึกข้อมูลทั้งหมด
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupData) return;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!groupData.group_name) {
      setError('กรุณากรอกชื่อกลุ่มสินค้า');
      return;
    }
    
    if (products.length === 0) {
      setError('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // สร้างข้อมูลสำหรับส่งไปยัง API
      const data = {
        group: {
          ...groupData
        },
        products: products.map(product => ({
          ...product,
          group_name: groupData.group_name
        }))
      };
      
      // ส่งข้อมูลไปยัง API
      const response = await fetch(`/api/products/group/${params.uuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSuccess('บันทึกข้อมูลสำเร็จ');
        // อัปเดตข้อมูลเดิม
        setOriginalData({
          group: result.group,
          products: result.products
        });
        
        // เด้งไปหน้ารายการสินค้าหลังจากบันทึกสำเร็จ
        router.push('/products/list');
      } else {
        setError(result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาด:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setSubmitting(false);
    }
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

  if (!groupData || originalData === null) {
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
          href={`/products/view/${params.uuid}`}
          className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          กลับ
        </Link>
        <h1 className="text-3xl font-bold">แก้ไขกลุ่มสินค้า</h1>
      </div>
      
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
      
      <div className="bg-white p-6 rounded shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">ข้อมูลกลุ่มสินค้า</h2>
        
        <form>
          <div className="grid grid-cols-1 gap-4">
            <div className="mb-4">
              <label htmlFor="group_name" className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อกลุ่มสินค้า <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="group_name"
                name="group_name"
                className="w-full p-2 border border-gray-300 rounded"
                value={groupData.group_name}
                onChange={handleGroupChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                คำอธิบาย
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full p-2 border border-gray-300 rounded"
                value={groupData.description}
                onChange={handleGroupChange}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รูปภาพหลัก (สามารถเพิ่มได้หลายรูป)
              </label>
              
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  value={tempImageUrl}
                  onChange={(e) => setTempImageUrl(e.target.value)}
                  placeholder="ใส่ URL ของรูปภาพ"
                  className="flex-1 p-2 border border-gray-300 rounded-l"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition-colors"
                >
                  <PlusCircle size={20} />
                </button>
              </div>
              
              {/* แสดงรายการรูปภาพที่เพิ่มแล้ว */}
              {groupData.main_img_url.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">รูปภาพที่เพิ่มแล้ว:</p>
                  <div className="space-y-2">
                    {groupData.main_img_url.map((url, index) => (
                      <div key={index} className="flex items-center bg-gray-100 p-2 rounded">
                        <div className="flex-1 truncate">{url}</div>
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
      
      {/* รายการสินค้า */}
      <div className="bg-white p-6 rounded shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">รายการสินค้า ({products.length})</h2>
          {!editingProduct && (
            <button
              type="button"
              onClick={startAddProduct}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <PlusCircle size={20} />
              เพิ่มสินค้า
            </button>
          )}
        </div>
        
        {/* ฟอร์มแก้ไข/เพิ่มสินค้า */}
        {editingProduct && (
          <div className="border border-blue-200 bg-blue-50 p-4 rounded mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-blue-800">
                {editingProduct.isNew ? 'เพิ่มสินค้าใหม่' : 'แก้ไขสินค้า'}
              </h3>
              <button
                type="button"
                onClick={cancelEditProduct}
                className="text-gray-600 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสสินค้า (SKU) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={editingProduct.sku}
                  onChange={handleProductChange}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="name_sku" className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อสินค้า <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name_sku"
                  name="name_sku"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={editingProduct.name_sku}
                  onChange={handleProductChange}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  จำนวน <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={editingProduct.quantity || ''}
                  onChange={handleProductChange}
                  min="0"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="catagory" className="block text-sm font-medium text-gray-700 mb-1">
                  หมวดหมู่
                </label>
                <input
                  type="text"
                  id="catagory"
                  name="catagory"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={editingProduct.catagory || ''}
                  onChange={handleProductChange}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="collaction" className="block text-sm font-medium text-gray-700 mb-1">
                  คอลเลคชัน
                </label>
                <input
                  type="text"
                  id="collaction"
                  name="collaction"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={editingProduct.collaction || ''}
                  onChange={handleProductChange}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="make_price" className="block text-sm font-medium text-gray-700 mb-1">
                  ต้นทุน
                </label>
                <input
                  type="number"
                  id="make_price"
                  name="make_price"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={editingProduct.make_price || ''}
                  onChange={handleProductChange}
                  min="0"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="price_origin" className="block text-sm font-medium text-gray-700 mb-1">
                  ราคาขาย <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price_origin"
                  name="price_origin"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={editingProduct.price_origin || ''}
                  onChange={handleProductChange}
                  min="0"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="product_width" className="block text-sm font-medium text-gray-700 mb-1">
                  ความกว้าง (ซม.)
                </label>
                <input
                  type="number"
                  id="product_width"
                  name="product_width"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={editingProduct.product_width || ''}
                  onChange={handleProductChange}
                  min="0"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="product_length" className="block text-sm font-medium text-gray-700 mb-1">
                  ความยาว (ซม.)
                </label>
                <input
                  type="number"
                  id="product_length"
                  name="product_length"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={editingProduct.product_length || ''}
                  onChange={handleProductChange}
                  min="0"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="product_heigth" className="block text-sm font-medium text-gray-700 mb-1">
                  ความสูง (ซม.)
                </label>
                <input
                  type="number"
                  id="product_heigth"
                  name="product_heigth"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={editingProduct.product_heigth || ''}
                  onChange={handleProductChange}
                  min="0"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="product_weight" className="block text-sm font-medium text-gray-700 mb-1">
                  น้ำหนัก (กรัม)
                </label>
                <input
                  type="number"
                  id="product_weight"
                  name="product_weight"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={editingProduct.product_weight || ''}
                  onChange={handleProductChange}
                  min="0"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="img_url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL รูปภาพสินค้า
                </label>
                <input
                  type="text"
                  id="img_url"
                  name="img_url"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={editingProduct.img_url || ''}
                  onChange={handleProductChange}
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={cancelEditProduct}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-400 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={saveEditProduct}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Check size={16} />
                บันทึกสินค้า
              </button>
            </div>
          </div>
        )}
        
        {products.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-300 rounded">
            <p className="text-gray-500 mb-4">ยังไม่มีสินค้าในกลุ่มนี้</p>
            <button
              type="button"
              onClick={startAddProduct}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              เพิ่มสินค้าใหม่
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 border text-left">SKU</th>
                  <th className="p-2 border text-left">ชื่อสินค้า</th>
                  <th className="p-2 border text-left">ราคา</th>
                  <th className="p-2 border text-left">จำนวน</th>
                  <th className="p-2 border text-left">หมวดหมู่</th>
                  <th className="p-2 border text-left">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-2 border">{product.sku}</td>
                    <td className="p-2 border">{product.name_sku}</td>
                    <td className="p-2 border">{product.price_origin}</td>
                    <td className="p-2 border">{product.quantity}</td>
                    <td className="p-2 border">{product.catagory || '-'}</td>
                    <td className="p-2 border">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => startEditProduct(index)}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={!!editingProduct}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="text-red-600 hover:text-red-800"
                          disabled={!!editingProduct}
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
      </div>
      
      {/* ปุ่มบันทึกข้อมูลทั้งหมด */}
      <div className="bg-white p-6 rounded shadow-md">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || products.length === 0}
          className={`px-6 py-2 rounded flex items-center gap-2 ${
            submitting || products.length === 0
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-purple-600 text-white hover:bg-purple-700 transition-colors'
          }`}
        >
          <Save size={20} />
          {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลทั้งหมด'}
        </button>
      </div>
    </div>
  );
}