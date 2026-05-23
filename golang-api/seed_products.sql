-- ============================================================
-- MIGRATION: Tambah kolom image_url ke tabel products
-- ============================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';

-- ============================================================
-- SEED: Hapus produk lama (opsional, hapus comment jika mau reset)
-- ============================================================
-- DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE category_id = 1);
-- DELETE FROM products WHERE category_id = 1;

-- ============================================================
-- INSERT CATEGORIES (jika belum ada)
-- ============================================================
INSERT INTO categories (id, name) VALUES
  (2, 'Banner & Spanduk'),
  (3, 'Sticker & Label'),
  (4, 'Kartu Nama'),
  (5, 'Brosur & Flyer'),
  (6, 'Poster'),
  (7, 'Merchandise'),
  (8, 'Stempel'),
  (9, 'Undangan')
ON CONFLICT (id) DO NOTHING;

SELECT setval('public.categories_id_seq', 9, true);

-- ============================================================
-- INSERT PRODUCTS WITH IMAGE_URL
-- ============================================================
INSERT INTO products (id, category_id, name, description, base_price, estimated_days, is_active, image_url, created_at) VALUES

-- BANNER & SPANDUK
(10, 2, 'Spanduk Flexi Korea',
 'Spanduk flexi outdoor bahan Korea 440gsm tahan cuaca dan hujan. Cocok untuk promosi toko, acara, maupun event outdoor. Cetak full color dengan ketajaman warna yang memukau.',
 28000, 2, true,
 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80', NOW()),

(11, 2, 'X-Banner Premium',
 'X-Banner 60x160 cm dengan bahan flexi korea indoor high resolution. Berdiri kokoh dengan frame aluminium ringan. Ideal untuk pameran, showroom, dan presentation point.',
 90000, 2, true,
 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80', NOW()),

(12, 2, 'Roll Up Banner',
 'Roll Up Banner retractable 85x200 cm. Material albatros indoor dengan tripod stainless. Mudah dibawa kemana-mana. Dilengkapi tas canvas premium.',
 350000, 3, true,
 'https://images.unsplash.com/photo-1569017388730-020b5f80a004?w=800&q=80', NOW()),

-- STICKER & LABEL
(13, 3, 'Stiker Vinyl Custom',
 'Stiker vinyl premium waterproof dengan cutting presisi tinggi. Tersedia dalam pilihan glossy, matte, dan transparant. Tahan air, panas, dan goresan. Cocok untuk produk, kemasan, dan dekorasi.',
 15000, 2, true,
 'https://images.unsplash.com/photo-1612538498456-e861df91d4d0?w=800&q=80', NOW()),

(14, 3, 'Label Kemasan Produk',
 'Label kemasan profesional untuk branding produk UMKM. Tersedia dalam berbagai ukuran dan bentuk. Bahan chromo CMYK tahan air dengan cutting presisi laser.',
 500, 2, true,
 'https://images.unsplash.com/photo-1559163499-413811fb2344?w=800&q=80', NOW()),

-- KARTU NAMA
(15, 4, 'Kartu Nama Art Carton 260gsm',
 'Kartu nama eksklusif cetak full color dua sisi di atas art carton 260gsm. Finishing glossy lamination untuk kesan premium. Ukuran standar 9x5.5 cm. Minimum order 100 lembar.',
 350, 2, true,
 'https://images.unsplash.com/photo-1606836576983-8b458e75221d?w=800&q=80', NOW()),

(16, 4, 'Kartu Nama Linen Emboss',
 'Kartu nama premium bahan linen dengan efek emboss timbul. Finishing spot UV untuk detail yang menonjol. Kesan mewah dan profesional yang tak tertandingi. Min. 50 pcs.',
 750, 3, true,
 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&q=80', NOW()),

-- BROSUR & FLYER
(17, 5, 'Brosur A4 Glossy Premium',
 'Brosur A4 full color dua sisi di atas kertas glossy 150gsm. Cocok untuk company profile, menu restoran, dan katalog produk. Warna tajam dan cerah dengan teknologi UV printing.',
 1500, 2, true,
 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80', NOW()),

(18, 5, 'Flyer A5 Matte',
 'Flyer A5 single side matte 150gsm. Ideal untuk promosi event, diskon, dan launching produk. Quick print tersedia untuk kebutuhan mendesak. Min. order 100 lembar.',
 800, 1, true,
 'https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?w=800&q=80', NOW()),

-- POSTER
(19, 6, 'Poster Art Carton UV',
 'Poster cetak UV pada art carton 230gsm. Warna vivid dengan proteksi UV coating. Ukuran A1 hingga A3. Cocok untuk dekorasi dinding, promosi toko, maupun galeri.',
 50000, 2, true,
 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80', NOW()),

-- MERCHANDISE
(20, 7, 'Mug Custom Full Print',
 'Mug keramik 11oz dengan desain custom full wrap print. Teknik sublimasi menghasilkan warna yang tahan lama dan tidak pudar. Cocok untuk souvenir pernikahan, ulang tahun, dan korporat.',
 45000, 3, true,
 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80', NOW()),

(21, 7, 'Kaos Custom DTF Print',
 'Kaos custom cotton combed 30s dengan print DTF (Direct To Film). Full color dengan ketajaman tinggi. Tidak retak meski dicuci berulang kali. Tersedia ukuran XS hingga XXL.',
 75000, 3, true,
 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80', NOW()),

(22, 7, 'Tote Bag Canvas Print',
 'Tote bag canvas 270gsm dengan print sablon atau DTF. Ukuran 35x40 cm dengan handle kulit sintetis. Ramah lingkungan dan stylish sebagai souvenir atau merchandise brand.',
 55000, 3, true,
 'https://images.unsplash.com/photo-1591378603223-e15b45a81640?w=800&q=80', NOW()),

-- STEMPEL
(23, 8, 'Stempel Flash Kotak',
 'Stempel flash kotak 1 warna berbagai ukuran. Proses cepat 1 hari kerja. Tinta waterproof tahan lama. Tersedia ukuran 20x20 mm hingga 40x40 mm. Termasuk bantal tinta refillable.',
 55000, 1, true,
 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=800&q=80', NOW()),

-- UNDANGAN
(24, 9, 'Undangan Pernikahan Hard Cover',
 'Undangan pernikahan eksklusif dengan cover hard karton tebal 400gsm, finishing laminasi doff + spot UV + pita satin. Cetak full color premium di dalam. Kesan mewah yang berkesan untuk tamu spesial.',
 8500, 5, true,
 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', NOW()),

(25, 9, 'Undangan Digital + Cetak',
 'Paket undangan digital (e-invite) + cetak fisik soft cover. Desain modern minimalis. File digital siap share via WhatsApp. Cetak A5 130gsm. Harga per set minimum 100 pcs.',
 3500, 3, true,
 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80', NOW())

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  image_url = EXCLUDED.image_url;

SELECT setval('public.products_id_seq', 25, true);

-- ============================================================
-- INSERT VARIANTS
-- ============================================================
INSERT INTO product_variants (product_id, sku, variant_name, price, stock, is_active, created_at) VALUES
-- Spanduk Flexi Korea (10)
(10, 'SPD-KR-IN', 'Flexi Korea Indoor (harga/m²)', 35000, 999, true, NOW()),
(10, 'SPD-KR-OUT', 'Flexi Korea Outdoor 440gsm (harga/m²)', 28000, 999, true, NOW()),

-- X-Banner (11)
(11, 'XBN-ALB-IN', 'Albatros Indoor High Resolution', 150000, 50, true, NOW()),
(11, 'XBN-KR440-OUT', 'Flexi Korea 440 Outdoor', 80000, 50, true, NOW()),
(11, 'XBN-CN280-OUT', 'Flexi China 280 Outdoor', 70000, 50, true, NOW()),

-- Roll Up Banner (12)
(12, 'RUB-85-STD', 'Roll Up 85x200 Standar + Frame', 350000, 20, true, NOW()),
(12, 'RUB-100-PRE', 'Roll Up 100x200 Premium + Frame Stainless', 450000, 20, true, NOW()),

-- Stiker Vinyl (13)
(13, 'STK-VGLS', 'Vinyl Glossy + Kiss Cut (harga/lembar A3)', 15000, 500, true, NOW()),
(13, 'STK-VMTT', 'Vinyl Matte + Kiss Cut (harga/lembar A3)', 15000, 500, true, NOW()),
(13, 'STK-VTRN', 'Vinyl Transparant + Kiss Cut (harga/lembar A3)', 16000, 500, true, NOW()),

-- Label Kemasan (14)
(14, 'LBL-CHRM-5X5', 'Chromo 5x5 cm (per 100 pcs)', 500, 999, true, NOW()),
(14, 'LBL-CHRM-7X5', 'Chromo 7x5 cm (per 100 pcs)', 700, 999, true, NOW()),
(14, 'LBL-VNYL-5X5', 'Vinyl 5x5 cm (per 100 pcs)', 800, 999, true, NOW()),

-- Kartu Nama Art Carton (15)
(15, 'KN-AC-1S', 'Art Carton 260gsm 1 Sisi (per 100 pcs)', 350, 999, true, NOW()),
(15, 'KN-AC-2S', 'Art Carton 260gsm 2 Sisi (per 100 pcs)', 500, 999, true, NOW()),

-- Kartu Nama Linen (16)
(16, 'KN-LN-1S', 'Linen Emboss 1 Sisi (per 50 pcs)', 750, 200, true, NOW()),
(16, 'KN-LN-2S', 'Linen Emboss 2 Sisi (per 50 pcs)', 1000, 200, true, NOW()),

-- Brosur A4 (17)
(17, 'BRS-A4-GLS', 'Glossy 150gsm (per lembar)', 1500, 999, true, NOW()),
(17, 'BRS-A4-MTT', 'Matte 150gsm (per lembar)', 1700, 999, true, NOW()),
(17, 'BRS-A4-ARTC', 'Art Carton 210gsm (per lembar)', 2500, 999, true, NOW()),

-- Flyer A5 (18)
(18, 'FLY-A5-GLS', 'Glossy 150gsm 1 Sisi (per lembar)', 800, 999, true, NOW()),
(18, 'FLY-A5-MTT', 'Matte 150gsm 1 Sisi (per lembar)', 900, 999, true, NOW()),

-- Poster (19)
(19, 'PST-A1-UV', 'Poster A1 Art Carton 230gsm UV', 50000, 100, true, NOW()),
(19, 'PST-A2-UV', 'Poster A2 Art Carton 230gsm UV', 30000, 100, true, NOW()),
(19, 'PST-A3-UV', 'Poster A3 Art Carton 230gsm UV', 18000, 100, true, NOW()),

-- Mug (20)
(20, 'MUG-11OZ', 'Mug 11oz Keramik Full Wrap', 45000, 50, true, NOW()),
(20, 'MUG-11OZ-BOX', 'Mug 11oz + Box Kemasan Premium', 60000, 50, true, NOW()),

-- Kaos (21)
(21, 'KOS-DTF-S', 'Kaos Cotton 30s DTF Print (S-XL)', 75000, 100, true, NOW()),
(21, 'KOS-DTF-XXL', 'Kaos Cotton 30s DTF Print (XXL)', 85000, 50, true, NOW()),

-- Tote Bag (22)
(22, 'TTB-CAN-STD', 'Canvas 270gsm Print Sablon 1 Warna', 55000, 100, true, NOW()),
(22, 'TTB-CAN-FULL', 'Canvas 270gsm Full Color DTF Print', 75000, 100, true, NOW()),

-- Stempel (23)
(23, 'STP-K4-40', 'Stempel Kotak 40x40mm', 80000, 100, true, NOW()),
(23, 'STP-K5-25', 'Stempel Kotak 25x25mm', 60000, 100, true, NOW()),
(23, 'STP-B5-40', 'Stempel Bulat 40mm', 75000, 100, true, NOW()),

-- Undangan Hard Cover (24)
(24, 'UND-HC-1P', 'Hard Cover + Pita (per set 100 pcs)', 8500, 200, true, NOW()),
(24, 'UND-HC-FOIL', 'Hard Cover + Foil Gold/Silver (per set 100 pcs)', 12000, 100, true, NOW()),

-- Undangan Digital + Cetak (25)
(25, 'UND-DIG-A5', 'Paket Digital + Cetak A5 Soft Cover (100 pcs)', 3500, 999, true, NOW()),
(25, 'UND-DIG-A5-PLUS', 'Paket Digital + Cetak A5 Laminasi Doff (100 pcs)', 5000, 999, true, NOW())

ON CONFLICT (sku) DO UPDATE SET
  price = EXCLUDED.price,
  variant_name = EXCLUDED.variant_name;
