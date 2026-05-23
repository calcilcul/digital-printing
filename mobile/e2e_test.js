const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:8080';

async function runTests() {
  console.log('🚀 Memulai End-to-End API Test Jaya Mandiri...\n');
  try {
    // 1. Customer Login
    console.log('--- 1. CUSTOMER FLOW ---');
    const custRes = await axios.post(`${API_URL}/login`, {
      email: 'customer@gmail.com',
      password: '123456'
    });
    const custToken = custRes.data.data.token;
    console.log('✅ Customer Login Berhasil');

    const custAxios = axios.create({
      baseURL: API_URL,
      headers: { Authorization: `Bearer ${custToken}` }
    });

    // 2. Ambil Katalog
    const catRes = await custAxios.get('/products');
    const products = catRes.data.data;
    if (products.length === 0) throw new Error('Katalog kosong');
    const testProduct = products[0];
    const testVariant = testProduct.variants[0];
    console.log(`✅ Ambil Katalog Berhasil (Memilih: ${testProduct.name})`);

    // 3. Tambah ke Keranjang
    await custAxios.post('/api/cart', {
      product_id: testProduct.id,
      variant_id: testVariant.id,
      quantity: 2,
      notes: JSON.stringify({ Material: testVariant.variant_name })
    });
    console.log('✅ Tambah ke Keranjang Berhasil');

    // 4. Checkout
    const checkoutRes = await custAxios.post('/api/checkout');
    const orderId = checkoutRes.data.order_id;
    console.log(`✅ Checkout Berhasil (Order ID: ${orderId})`);

    // 5. Upload Dummy Payment
    // For local test, we'll just mock a file or skip if it requires real multipart
    // Wait, the API requires multipart/form-data. Let's just create a dummy file
    const FormData = require('form-data');
    const form = new FormData();
    form.append('order_id', orderId);
    form.append('amount', '50000');
    form.append('payment_proof', Buffer.from('dummy image content'), { filename: 'dummy.jpg', contentType: 'image/jpeg' });
    
    await custAxios.post('/api/payments', form, { headers: form.getHeaders() });
    console.log('✅ Upload Pembayaran Berhasil');

    // 6. Upload Dummy Design
    // Get Order Details to find the item ID
    const orderDetailRes = await custAxios.get(`/api/orders/${orderId}`);
    const orderItemId = orderDetailRes.data.data.items[0].id;
    
    const designForm = new FormData();
    designForm.append('design_file', Buffer.from('dummy design content'), { filename: 'design.pdf', contentType: 'application/pdf' });
    await custAxios.post(`/api/orders/items/${orderItemId}/design`, designForm, { headers: designForm.getHeaders() });
    console.log('✅ Upload Desain Berhasil');


    // 7. Staff Login & Verification
    console.log('\n--- 2. STAFF FLOW ---');
    const staffRes = await axios.post(`${API_URL}/login`, {
      email: 'admin@gmail.com',
      password: '123456'
    });
    const staffToken = staffRes.data.data.token;
    console.log('✅ Staff Login Berhasil');

    const staffAxios = axios.create({
      baseURL: API_URL,
      headers: { Authorization: `Bearer ${staffToken}` }
    });

    // 8. Approve Payment
    // Need paymentId from order
    const staffOrderRes = await staffAxios.get('/api/staff/orders');
    const orderForStaff = staffOrderRes.data.data.find(o => o.id === orderId);
    if (!orderForStaff.payment_id) throw new Error('Payment ID not found');
    
    await staffAxios.put(`/api/staff/payments/${orderForStaff.payment_id}/approve`);
    console.log('✅ Staff Verifikasi Pembayaran Berhasil');

    // 9. Start Production
    await staffAxios.put(`/api/staff/production/${orderId}/start`, { notes: "OK" });
    console.log('✅ Staff Memulai Produksi Berhasil');

    // 10. Finish Production
    await staffAxios.put(`/api/staff/production/${orderId}/finish`, { notes: "Done" });
    console.log('✅ Staff Menyelesaikan Produksi Berhasil');

    // 11. Customer Mark Completed
    console.log('\n--- 3. PENYELESAIAN ---');
    await custAxios.put(`/api/orders/${orderId}/complete`);
    console.log('✅ Customer Menyelesaikan Pesanan Berhasil');

    console.log('\n🎉 SEMUA TEST BERHASIL! Alur utama berjalan sempurna.');

  } catch (error) {
    console.error('\n❌ TEST GAGAL:', error.response?.data || error.message);
  }
}

runTests();
