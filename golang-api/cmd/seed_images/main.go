//go:build ignore
// +build ignore

package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  .env tidak ditemukan")
	}

	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable search_path=public",
		os.Getenv("DB_HOST"), os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"), os.Getenv("DB_PASS"), os.Getenv("DB_NAME"),
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("❌ Gagal buka DB:", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("❌ Gagal ping DB:", err)
	}
	log.Println("✅ Terhubung ke PostgreSQL")

	// ─── 1. CEK DAN TAMBAH KOLOM image_url (jika punya hak akses) ─────────
	_, alterErr := db.Exec(`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT ''`)
	if alterErr != nil {
		log.Printf("⚠️  Tidak bisa ALTER TABLE (bukan owner): %v", alterErr)
		log.Println("ℹ️  Akan mencoba UPDATE image_url langsung (kolom mungkin sudah ada)")
	} else {
		log.Println("✅ Kolom image_url siap")
	}

	// ─── 2. TAMBAH CATEGORIES ──────────────────────────────────────────────
	categories := []struct{ ID int; Name string }{
		{2, "Banner & Spanduk"},
		{3, "Sticker & Label"},
		{4, "Kartu Nama"},
		{5, "Brosur & Flyer"},
		{6, "Poster"},
		{7, "Merchandise"},
		{8, "Stempel"},
		{9, "Undangan"},
	}
	for _, c := range categories {
		_, err = db.Exec(`INSERT INTO categories (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, c.ID, c.Name)
		if err != nil {
			log.Printf("⚠️  Category %s: %v", c.Name, err)
		} else {
			log.Printf("  ✅ Category: %s", c.Name)
		}
	}
	db.Exec(`SELECT setval('public.categories_id_seq', 9, true)`)

	// ─── 3. PRODUK + GAMBAR ───────────────────────────────────────────────
	type Variant struct {
		SKU   string
		Name  string
		Price float64
		Stock int
	}
	type Product struct {
		ID       int
		CatID    int
		Name     string
		Desc     string
		Price    float64
		Days     int
		ImageURL string
		Variants []Variant
	}

	products := []Product{
		{10, 2, "Spanduk Flexi Korea",
			"Spanduk flexi outdoor bahan Korea 440gsm tahan cuaca dan hujan. Cocok untuk promosi toko, acara, maupun event outdoor. Cetak full color dengan ketajaman warna yang memukau.",
			28000, 2, "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
			[]Variant{
				{"SPD-KR-IN", "Flexi Korea Indoor (harga/m²)", 35000, 999},
				{"SPD-KR-OUT", "Flexi Korea Outdoor 440gsm (harga/m²)", 28000, 999},
			}},
		{11, 2, "X-Banner Premium",
			"X-Banner 60x160 cm dengan bahan flexi korea indoor high resolution. Berdiri kokoh dengan frame aluminium ringan. Ideal untuk pameran dan presentation point.",
			90000, 2, "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
			[]Variant{
				{"XBN-ALB-IN", "Albatros Indoor High Resolution", 150000, 50},
				{"XBN-KR440-OUT", "Flexi Korea 440 Outdoor", 80000, 50},
				{"XBN-CN280-OUT", "Flexi China 280 Outdoor", 70000, 50},
			}},
		{12, 2, "Roll Up Banner",
			"Roll Up Banner retractable 85x200 cm. Material albatros indoor dengan tripod stainless. Mudah dibawa kemana-mana. Dilengkapi tas canvas premium.",
			350000, 3, "https://images.unsplash.com/photo-1569017388730-020b5f80a004?w=800&q=80",
			[]Variant{
				{"RUB-85-STD", "Roll Up 85x200 Standar + Frame", 350000, 20},
				{"RUB-100-PRE", "Roll Up 100x200 Premium + Frame Stainless", 450000, 20},
			}},
		{13, 3, "Stiker Vinyl Custom",
			"Stiker vinyl premium waterproof dengan cutting presisi tinggi. Tersedia dalam pilihan glossy, matte, dan transparant. Tahan air, panas, dan goresan.",
			15000, 2, "https://images.unsplash.com/photo-1612538498456-e861df91d4d0?w=800&q=80",
			[]Variant{
				{"STK-VGLS", "Vinyl Glossy + Kiss Cut (A3)", 15000, 500},
				{"STK-VMTT", "Vinyl Matte + Kiss Cut (A3)", 15000, 500},
				{"STK-VTRN", "Vinyl Transparant + Kiss Cut (A3)", 16000, 500},
			}},
		{14, 3, "Label Kemasan Produk",
			"Label kemasan profesional untuk branding produk UMKM. Tersedia berbagai ukuran. Bahan chromo CMYK tahan air dengan cutting presisi laser.",
			500, 2, "https://images.unsplash.com/photo-1559163499-413811fb2344?w=800&q=80",
			[]Variant{
				{"LBL-CHRM-5X5", "Chromo 5x5 cm (per 100 pcs)", 500, 999},
				{"LBL-CHRM-7X5", "Chromo 7x5 cm (per 100 pcs)", 700, 999},
				{"LBL-VNYL-5X5", "Vinyl 5x5 cm (per 100 pcs)", 800, 999},
			}},
		{15, 4, "Kartu Nama Art Carton 260gsm",
			"Kartu nama eksklusif cetak full color dua sisi di atas art carton 260gsm. Finishing glossy lamination. Ukuran standar 9x5.5 cm. Minimum order 100 lembar.",
			350, 2, "https://images.unsplash.com/photo-1606836576983-8b458e75221d?w=800&q=80",
			[]Variant{
				{"KN-AC-1S", "Art Carton 260gsm 1 Sisi (per 100 pcs)", 350, 999},
				{"KN-AC-2S", "Art Carton 260gsm 2 Sisi (per 100 pcs)", 500, 999},
			}},
		{16, 4, "Kartu Nama Linen Emboss",
			"Kartu nama premium bahan linen dengan efek emboss timbul. Finishing spot UV untuk detail yang menonjol. Kesan mewah dan profesional. Min. 50 pcs.",
			750, 3, "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&q=80",
			[]Variant{
				{"KN-LN-1S", "Linen Emboss 1 Sisi (per 50 pcs)", 750, 200},
				{"KN-LN-2S", "Linen Emboss 2 Sisi (per 50 pcs)", 1000, 200},
			}},
		{17, 5, "Brosur A4 Glossy Premium",
			"Brosur A4 full color dua sisi di atas kertas glossy 150gsm. Cocok untuk company profile, menu restoran, dan katalog produk.",
			1500, 2, "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80",
			[]Variant{
				{"BRS-A4-GLS", "Glossy 150gsm (per lembar)", 1500, 999},
				{"BRS-A4-MTT", "Matte 150gsm (per lembar)", 1700, 999},
				{"BRS-A4-ARTC", "Art Carton 210gsm (per lembar)", 2500, 999},
			}},
		{18, 5, "Flyer A5 Matte",
			"Flyer A5 single side matte 150gsm. Ideal untuk promosi event, diskon, dan launching produk. Quick print. Min. order 100 lembar.",
			800, 1, "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?w=800&q=80",
			[]Variant{
				{"FLY-A5-GLS", "Glossy 150gsm 1 Sisi (per lembar)", 800, 999},
				{"FLY-A5-MTT", "Matte 150gsm 1 Sisi (per lembar)", 900, 999},
			}},
		{19, 6, "Poster Art Carton UV",
			"Poster cetak UV pada art carton 230gsm. Warna vivid dengan proteksi UV coating. Ukuran A1 hingga A3.",
			50000, 2, "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
			[]Variant{
				{"PST-A1-UV", "Poster A1 Art Carton 230gsm UV", 50000, 100},
				{"PST-A2-UV", "Poster A2 Art Carton 230gsm UV", 30000, 100},
				{"PST-A3-UV", "Poster A3 Art Carton 230gsm UV", 18000, 100},
			}},
		{20, 7, "Mug Custom Full Print",
			"Mug keramik 11oz dengan desain custom full wrap print. Teknik sublimasi menghasilkan warna tahan lama. Cocok untuk souvenir pernikahan dan korporat.",
			45000, 3, "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80",
			[]Variant{
				{"MUG-11OZ", "Mug 11oz Keramik Full Wrap", 45000, 50},
				{"MUG-11OZ-BOX", "Mug 11oz + Box Kemasan Premium", 60000, 50},
			}},
		{21, 7, "Kaos Custom DTF Print",
			"Kaos custom cotton combed 30s dengan print DTF. Full color dengan ketajaman tinggi. Tidak retak meski dicuci berulang. Ukuran XS hingga XXL.",
			75000, 3, "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
			[]Variant{
				{"KOS-DTF-S", "Kaos Cotton 30s DTF Print (S-XL)", 75000, 100},
				{"KOS-DTF-XXL", "Kaos Cotton 30s DTF Print (XXL)", 85000, 50},
			}},
		{22, 7, "Tote Bag Canvas Print",
			"Tote bag canvas 270gsm dengan print sablon atau DTF. Ukuran 35x40 cm. Ramah lingkungan dan stylish sebagai souvenir atau merchandise brand.",
			55000, 3, "https://images.unsplash.com/photo-1591378603223-e15b45a81640?w=800&q=80",
			[]Variant{
				{"TTB-CAN-STD", "Canvas 270gsm Print Sablon 1 Warna", 55000, 100},
				{"TTB-CAN-FULL", "Canvas 270gsm Full Color DTF Print", 75000, 100},
			}},
		{23, 8, "Stempel Flash Kotak",
			"Stempel flash kotak 1 warna berbagai ukuran. Proses cepat 1 hari kerja. Tinta waterproof tahan lama. Termasuk bantal tinta refillable.",
			55000, 1, "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=800&q=80",
			[]Variant{
				{"STP-K4-40", "Stempel Kotak 40x40mm", 80000, 100},
				{"STP-K5-25", "Stempel Kotak 25x25mm", 60000, 100},
				{"STP-B5-40", "Stempel Bulat 40mm", 75000, 100},
			}},
		{24, 9, "Undangan Pernikahan Hard Cover",
			"Undangan eksklusif hard cover 400gsm, finishing laminasi doff + spot UV + pita satin. Kesan mewah untuk tamu spesial.",
			8500, 5, "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
			[]Variant{
				{"UND-HC-1P", "Hard Cover + Pita (per set 100 pcs)", 8500, 200},
				{"UND-HC-FOIL", "Hard Cover + Foil Gold (per set 100 pcs)", 12000, 100},
			}},
		{25, 9, "Undangan Digital + Cetak",
			"Paket undangan digital (e-invite) + cetak fisik soft cover. Desain modern minimalis. Min. 100 pcs.",
			3500, 3, "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
			[]Variant{
				{"UND-DIG-A5", "Digital + Cetak A5 Soft Cover (100 pcs)", 3500, 999},
				{"UND-DIG-A5-PLUS", "Digital + Cetak A5 Laminasi Doff (100 pcs)", 5000, 999},
			}},
	}

	// ─── 4. INSERT PRODUCTS ────────────────────────────────────────────────
	successCount := 0
	for _, p := range products {
		// Upsert product (tanpa image_url dulu, karena kolom mungkin belum ada)
		var productID int
		err := db.QueryRow(`
			INSERT INTO products (id, category_id, name, description, base_price, estimated_days, is_active, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW())
			ON CONFLICT (id) DO UPDATE SET
				name = EXCLUDED.name, description = EXCLUDED.description,
				base_price = EXCLUDED.base_price, category_id = EXCLUDED.category_id
			RETURNING id
		`, p.ID, p.CatID, p.Name, p.Desc, p.Price, p.Days).Scan(&productID)
		if err != nil {
			log.Printf("  ❌ Product '%s': %v", p.Name, err)
			continue
		}

		// Coba UPDATE image_url (jika kolom sudah ada)
		_, imgErr := db.Exec(`UPDATE products SET image_url = $1 WHERE id = $2`, p.ImageURL, productID)
		if imgErr != nil {
			log.Printf("    ℹ️  image_url belum bisa diupdate (kolom belum ada): %v", imgErr)
		}

		// Upsert variants
		for _, v := range p.Variants {
			_, err = db.Exec(`
				INSERT INTO product_variants (product_id, sku, variant_name, price, stock, is_active, created_at)
				VALUES ($1, $2, $3, $4, $5, TRUE, NOW())
				ON CONFLICT (sku) DO UPDATE SET
					price = EXCLUDED.price, variant_name = EXCLUDED.variant_name
			`, productID, v.SKU, v.Name, v.Price, v.Stock)
			if err != nil {
				log.Printf("    ⚠️  Variant '%s': %v", v.Name, err)
			}
		}
		successCount++
		log.Printf("  ✅ #%d %s (%d varian)", productID, p.Name, len(p.Variants))
	}

	// Update sequence
	db.Exec(`SELECT setval('public.products_id_seq', 25, true)`)
	db.Exec(`SELECT setval('public.product_variants_id_seq', (SELECT MAX(id) FROM product_variants), true)`)

	log.Printf("🎉 Selesai! %d produk berhasil diseed ke database.", successCount)
}
