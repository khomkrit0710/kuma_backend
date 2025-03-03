'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2, Save } from 'lucide-react';

interface ProductFormData {
  sku: string;
  name_sku: string;
  quantity: number;
  catagory?: string;
  collaction?: string;
  make_price?: number;
  price_origin: number;
  product_width?: number;
  product_length?: number;
  product_heigth?: number;
  product_weight?: number;
  img_url?: string;
}

interface GroupFormData {
  group_name: string;
  main_img_url: string[];
  description: string;
}

export default function AddProduct() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  
  // ข้อมูลกลุ่มสินค้า
  const [groupData, setGroupData] = useState<GroupFormData>({
    group_name: '',
    main_img_url: [],
    description: '',
  });
  
  // รายการสินค้าที่จะเพิ่ม
  const [products, setProducts] = useState<ProductFormData[]>([]);
  
  // สินค้าที่กำลังกรอกข้อมูล
  const [currentProduct, setCurrentProduct] = useState<ProductFormData>({
    sku: '',
    name_sku: '',
    quantity: 0,
    price_origin: 0,
    catagory: '',
    collaction: '',
    make_price: undefined,
    product_width: undefined,
    product_length: undefined,
    product_heigth: undefined,
    product_weight: undefined,
    img_url: '',
  });
  
  // URL รูปภาพที่กำลังกรอก
  const [tempImageUrl, setTempImageUrl] = useState('');

  // ตรวจสอบสถานะการล็อกอิน
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // อัพเดทข้อมูลกลุ่มสินค้า
  const handleGroupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGroupData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // เพิ่ม URL รูปภาพลงในรายการ
  const addImageUrl = () => {
    if (!tempImageUrl.trim()) return;
    
    setGroupData(prev => ({
      ...prev,
      main_img_url: [...prev.main_img_url, tempImageUrl]
    }));
    setTempImageUrl('');
  };

  // ลบ URL รูปภาพออกจากรายการ
  const removeImageUrl = (index: number) => {
    setGroupData(prev => ({
      ...prev,
      main_img_url: prev.main_img_url.filter((_, i) => i !== index)
    }));
  };

  // อัพเดทข้อมูลสินค้าปัจจุบัน
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number | undefined = value;
    
    // แปลงข้อมูลตัวเลขให้ถูกต้อง
    if (['quantity', 'make_price', 'price_origin', 'product_width', 'product_length', 'product_heigth', 'product_weight'].includes(name)) {
      parsedValue = value === '' ? undefined : Number(value);
    }
    
    setCurrentProduct(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  // เพิ่มสินค้าลงในรายการ
  const addProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!currentProduct.sku || !currentProduct.name_sku) {
      setError('กรุณากรอกรหัสสินค้า (SKU) และชื่อสินค้า');
      return;
    }
    
    // เพิ่มสินค้าลงในรายการ
    setProducts(prev => [...prev, currentProduct]);
    
    // รีเซ็ตฟอร์มสินค้า
    setCurrentProduct({
      sku: '',
      name_sku: '',
      quantity: 0,
      price_origin: 0,
      catagory: '',
      collaction: '',
      make_price: undefined,
      product_width: undefined,
      product_length: undefined,
      product_heigth: undefined,
      product_weight: undefined,
      img_url: '',
    });
    
    setError('');
    setSuccess('เพิ่มสินค้าลงในรายการเรียบร้อยแล้ว');
    
    // ซ่อนฟอร์มเพิ่มสินค้า
    setShowProductForm(false);
  };

  // ลบสินค้าออกจากรายการ
  const removeProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  // เริ่มต้นเพิ่มสินค้า
  const startAddProduct = () => {
    // ตรวจสอบว่ากรอกข้อมูลกลุ่มสินค้าแล้วหรือยัง
    if (!groupData.group_name) {
      setError('กรุณากรอกชื่อกลุ่มสินค้าก่อน');
      return;
    }
    
    setShowProductForm(true);
    setError('');
  };

  // บันทึกข้อมูลทั้งหมด
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!groupData.group_name) {
      setError('กรุณากรอกชื่อกลุ่มสินค้า');
      return;
    }
    
    if (products.length === 0) {
      setError('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ');
      return;
    }
    
    setLoading(true);
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
      const response = await fetch('/api/products/group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSuccess('บันทึกข้อมูลเรียบร้อยแล้ว');
        
        // รีเซ็ตฟอร์มทั้งหมด
        setGroupData({
          group_name: '',
          main_img_url: [],
          description: '',
        });
        setProducts([]);
        
        // เด้งไปหน้ารายการสินค้าหลังจากบันทึกสำเร็จ
        // router.push('/products/list');
      } else {
        setError(result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
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
      
      {/* รายการสินค้าที่เพิ่มแล้ว */}
      {products.length > 0 && (
        <div className="bg-white p-6 rounded shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">รายการสินค้าที่เพิ่มแล้ว ({products.length})</h2>
          
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
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* ฟอร์มเพิ่มสินค้า */}
      {showProductForm ? (
        <div className="bg-white p-6 rounded shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">เพิ่มสินค้า</h2>
            <button
              type="button"
              onClick={() => setShowProductForm(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <form onSubmit={addProduct}>
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
                  value={currentProduct.sku}
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
                  value={currentProduct.name_sku}
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
                  value={currentProduct.quantity}
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
                  value={currentProduct.catagory || ''}
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
                  value={currentProduct.collaction || ''}
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
                  value={currentProduct.make_price || ''}
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
                  value={currentProduct.price_origin}
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
                  value={currentProduct.product_width || ''}
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
                  value={currentProduct.product_length || ''}
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
                  value={currentProduct.product_heigth || ''}
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
                  value={currentProduct.product_weight || ''}
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
                  value={currentProduct.img_url || ''}
                  onChange={handleProductChange}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save size={20} />
                เพิ่มสินค้าลงในรายการ
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-6">
          <button
            type="button"
            onClick={startAddProduct}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusCircle size={20} />
            เพิ่มสินค้า
          </button>
        </div>
      )}
      
      {/* ปุ่มบันทึกข้อมูลทั้งหมด */}
      {products.length > 0 && (
        <div className="bg-white p-6 rounded shadow-md">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลทั้งหมด'}
          </button>
        </div>
      )}
    </div>
  );
}