'use client';

import React, { useState } from 'react';

export default function ApiTest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testGet = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/products');
      
      console.log('Status:', response.status);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        console.log('HTML Response:', text.substring(0, 200));
        setResult('ได้รับการตอบกลับเป็น HTML: ' + text.substring(0, 200));
      } else {
        const data = await response.json();
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.error('Error:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const testPost = async () => {
    setLoading(true);
    setError('');
    try {
      const testData = {
        sku: 'TEST-001',
        name: 'ทดสอบสินค้า',
        price: 100,
        product_type: 'ทดสอบ',
        product_set: 'ทดสอบ'
      };
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      console.log('Status:', response.status);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        console.log('HTML Response:', text.substring(0, 200));
        setResult('ได้รับการตอบกลับเป็น HTML: ' + text.substring(0, 200));
      } else {
        const data = await response.json();
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.error('Error:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">API Test</h1>
      
      <div className="flex space-x-4 mb-4">
        <button 
          onClick={testGet} 
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ทดสอบ GET
        </button>
        
        <button 
          onClick={testPost} 
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ทดสอบ POST
        </button>
      </div>
      
      {loading && <p className="mb-4">กำลังโหลด...</p>}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">
          <p className="font-bold">ข้อผิดพลาด:</p>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <p className="font-bold mb-2">ผลลัพธ์:</p>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}