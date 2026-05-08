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
	// Load .env dari root golang-api
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  .env tidak ditemukan, menggunakan system env")
	}

	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASS")
	dbname := os.Getenv("DB_NAME")

	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable search_path=public",
		host, port, user, pass, dbname,
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("❌ Gagal membuka koneksi DB:", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("❌ Gagal ping DB:", err)
	}
	log.Println("✅ Terhubung ke PostgreSQL")

	// =====================================================================
	// 1. BUAT TABEL categories JIKA BELUM ADA
	// =====================================================================
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS categories (
			id SERIAL PRIMARY KEY,
			name VARCHAR(100) NOT NULL UNIQUE,
			description TEXT DEFAULT '',
			is_active BOOLEAN DEFAULT TRUE,
			created_at TIMESTAMP DEFAULT NOW()
		);
		
		-- Memastikan kolom is_active ada jika tabel sudah terlanjur dibuat tanpa kolom tersebut
		ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
		ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
		
		-- Memastikan tabel products dibuat jika belum ada
		CREATE TABLE IF NOT EXISTS products (
			id SERIAL PRIMARY KEY,
			category_id INT,
			name VARCHAR(255) NOT NULL,
			description TEXT DEFAULT '',
			base_price NUMERIC(12,2) DEFAULT 0,
			estimated_days INT DEFAULT 1,
			is_active BOOLEAN DEFAULT TRUE,
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP NULL,
			deleted_at TIMESTAMP NULL
		);

		-- Memastikan tabel product_variants dibuat jika belum ada
		CREATE TABLE IF NOT EXISTS product_variants (
			id SERIAL PRIMARY KEY,
			product_id INT,
			sku VARCHAR(50),
			variant_name VARCHAR(100),
			price NUMERIC(12,2) DEFAULT 0,
			stock INT DEFAULT 0,
			is_active BOOLEAN DEFAULT TRUE,
			material_id INT NULL,
			material_usage NUMERIC(10,2) DEFAULT 0,
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP NULL
		);

		-- Mengantisipasi jika tabel sudah ada tapi ada kolom yang kurang
		ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INT;
		ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
		ALTER TABLE products ADD COLUMN IF NOT EXISTS base_price NUMERIC(12,2) DEFAULT 0;
		ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated_days INT DEFAULT 1;
		ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
		ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
		
		ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS sku VARCHAR(50);
		ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS variant_name VARCHAR(100);
		ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS price NUMERIC(12,2) DEFAULT 0;
		ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS stock INT DEFAULT 0;
		ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
		ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS material_id INT NULL;
		ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS material_usage NUMERIC(10,2) DEFAULT 0;
	`)
	if err != nil {
		log.Fatal("❌ Gagal membuat/mengubah tabel:", err)
	}

	// =====================================================================
	// 2. INSERT CATEGORIES
	// =====================================================================
	categories := []struct {
		Name        string
		Description string
	}{
		{"Fotocopy Digital", "Layanan fotocopy warna dan hitam putih dengan kualitas digital"},
		{"Print Digital", "Layanan cetak digital berbagai ukuran dengan kualitas tinggi"},
		{"Plotter A2 | A1 | A0", "Layanan cetak plotter untuk ukuran besar A2, A1, dan A0"},
		{"Media Promosi", "Spanduk, banner, foamboard, dan media promosi lainnya"},
		{"Sticker | Label & Kemasan", "Stiker vinyl, chromo, dan label untuk berbagai kebutuhan"},
		{"Poster", "Cetak poster berkualitas tinggi berbagai ukuran"},
		{"Merchandise", "Produk merchandise custom sesuai kebutuhan"},
		{"Stempel Flash", "Stempel flash berbagai ukuran dan bentuk"},
		{"Scanning", "Layanan scan dokumen dan gambar berbagai ukuran"},
		{"Sertifikat dan Plakat", "Cetak sertifikat dan plakat profesional"},
		{"Perlengkapan Kantor", "Alat tulis dan perlengkapan kantor lainnya"},
		{"Cetak Foto dan Hiasan Dinding", "Cetak foto dan hiasan dinding berkualitas"},
		{"Penjilidan", "Layanan penjilidan dokumen profesional"},
	}

	categoryIDs := make(map[string]int)

	for _, cat := range categories {
		var id int
		err := db.QueryRow(`SELECT id FROM categories WHERE name = $1 LIMIT 1`, cat.Name).Scan(&id)
		
		if err == sql.ErrNoRows {
			// Kategori belum ada, lakukan INSERT
			err = db.QueryRow(`
				INSERT INTO categories (name, description, is_active)
				VALUES ($1, $2, TRUE)
				RETURNING id
			`, cat.Name, cat.Description).Scan(&id)
		} else if err == nil {
			// Kategori sudah ada, lakukan UPDATE (opsional)
			_, err = db.Exec(`UPDATE categories SET description = $1 WHERE id = $2`, cat.Description, id)
		}
		
		if err != nil {
			log.Fatalf("❌ Gagal insert category '%s': %v", cat.Name, err)
		}
		categoryIDs[cat.Name] = id
		log.Printf("  ✅ Category: %s (ID: %d)", cat.Name, id)
	}

	// =====================================================================
	// 3. INSERT PRODUCTS + VARIANTS
	// =====================================================================
	type Variant struct {
		SKU   string
		Name  string
		Price float64
		Stock int
	}

	type Product struct {
		Category      string
		Name          string
		Description   string
		BasePrice     float64
		EstimatedDays int
		Variants      []Variant
	}

	products := []Product{
		// ---- FOTOCOPY DIGITAL ----
		{
			Category: "Fotocopy Digital", Name: "Fotocopy Warna",
			Description: "Fotocopy warna berkualitas tinggi untuk berbagai ukuran kertas",
			BasePrice: 3500, EstimatedDays: 1,
			Variants: []Variant{
				{"FC-WRN-A3", "Fotocopy Warna A3", 7500, 999},
				{"FC-WRN-A5A4F4", "Fotocopy Warna A5 - A4 / F4", 3500, 999},
			},
		},

		// ---- PRINT DIGITAL ----
		{
			Category: "Print Digital", Name: "Print Hitam Putih",
			Description: "Cetak hitam putih HVS 80 gram berbagai ukuran",
			BasePrice: 1000, EstimatedDays: 1,
			Variants: []Variant{
				{"PRN-A3-BW", "Print A3 Hitam Putih HVS 80 Gram", 2000, 999},
				{"PRN-A4-BW", "Print A4 Hitam Putih HVS 80 Gram", 1000, 999},
			},
		},
		{
			Category: "Print Digital", Name: "Print Warna",
			Description: "Cetak warna HVS 80 gram 1 sisi berbagai ukuran",
			BasePrice: 3500, EstimatedDays: 1,
			Variants: []Variant{
				{"PRN-A3-CLR", "Print A3 Warna HVS 80 Gram 1 Sisi", 7500, 999},
				{"PRN-A4-CLR", "Print A4 Warna HVS 80 Gram 1 Sisi", 3500, 999},
			},
		},

		// ---- PLOTTER ----
		{
			Category: "Plotter A2 | A1 | A0", Name: "Plot Kalkir Hitam Putih",
			Description: "Cetak plotter kalkir hitam putih untuk kebutuhan teknik dan arsitektur",
			BasePrice: 10000, EstimatedDays: 1,
			Variants: []Variant{
				{"PLT-A0-KLK", "Plot A0 Kalkir Hitam Putih", 36000, 999},
				{"PLT-A1-KLK", "Plot A1 Kalkir Hitam Putih", 18000, 999},
				{"PLT-A2-KLK", "Plot A2 Kalkir Hitam Putih", 10000, 999},
			},
		},
		{
			Category: "Plotter A2 | A1 | A0", Name: "Plot HVS Hitam Putih",
			Description: "Cetak plotter HVS hitam putih untuk kebutuhan umum",
			BasePrice: 8000, EstimatedDays: 1,
			Variants: []Variant{
				{"PLT-A0-HVS", "Plot A0 HVS Hitam Putih", 21000, 999},
				{"PLT-A1-HVS", "Plot A1 HVS Hitam Putih", 12000, 999},
				{"PLT-A2-HVS", "Plot A2 HVS Hitam Putih", 8000, 999},
			},
		},

		// ---- MEDIA PROMOSI ----
		{
			Category: "Media Promosi", Name: "Foamboard + Sticker Vinyl",
			Description: "Foamboard with sticker vinyl China untuk display promosi",
			BasePrice: 90000, EstimatedDays: 2,
			Variants: []Variant{
				{"FMB-60x60", "Foamboard + Sticker Vinyl China UK 60x60", 90000, 100},
			},
		},
		{
			Category: "Media Promosi", Name: "Spanduk Flexi",
			Description: "Spanduk flexi outdoor berbagai kualitas bahan",
			BasePrice: 28000, EstimatedDays: 2,
			Variants: []Variant{
				{"SPD-KR440", "Spanduk Flexi Korea 440 Outdoor", 40000, 100},
				{"SPD-CN280", "Spanduk Flexi China 280 Outdoor", 28000, 100},
			},
		},
		{
			Category: "Media Promosi", Name: "X Banner",
			Description: "X Banner 60x160 berbagai bahan dan resolusi",
			BasePrice: 70000, EstimatedDays: 2,
			Variants: []Variant{
				{"XBN-ALB-IN", "X Banner 60x160 Albatros Indoor (High Resolution)", 150000, 50},
				{"XBN-KR440-IN", "X Banner 60x160 Flexi Korea 440 Indoor (High Resolution)", 135000, 50},
				{"XBN-CN280-IN", "X Banner 60x160 Flexi China 280 Indoor (High Resolution)", 90000, 50},
				{"XBN-KR440-OUT", "X Banner 60x160 Flexi Korea 440 Outdoor (Medium Resolution)", 80000, 50},
				{"XBN-CN280-OUT", "X Banner 60x160 Flexi China 280 Outdoor (Medium Resolution)", 70000, 50},
			},
		},

		// ---- STICKER ----
		{
			Category: "Sticker | Label & Kemasan", Name: "Stiker Vinyl + Cutting Kiss Cut",
			Description: "Stiker vinyl premium dengan cutting kiss cut presisi tinggi",
			BasePrice: 13000, EstimatedDays: 2,
			Variants: []Variant{
				{"STK-VTRN", "Stiker Vinyl Transparant + Cutting Kiss Cut", 16000, 500},
				{"STK-VMTT", "Stiker Vinyl Matte + Cutting Kiss Cut", 15000, 500},
				{"STK-VGLS", "Stiker Vinyl Glossy + Cutting Kiss Cut", 15000, 500},
				{"STK-CHRM", "Stiker Chromo CMYK + Cutting Kiss Cut", 13000, 500},
			},
		},

		// ---- POSTER ----
		{
			Category: "Poster", Name: "Poster Art Cartoon",
			Description: "Poster cetak UV print pada media art cartoon berkualitas tinggi",
			BasePrice: 50000, EstimatedDays: 2,
			Variants: []Variant{
				{"PST-A1-ART", "Poster A1 Art Cartoon 230 UV Print", 50000, 100},
			},
		},

		// ---- STEMPEL FLASH ----
		{
			Category: "Stempel Flash", Name: "Stempel Flash Kotak (K Series)",
			Description: "Stempel flash kotak 1 warna berbagai ukuran",
			BasePrice: 55000, EstimatedDays: 3,
			Variants: []Variant{
				{"STP-K4-40", "Stempel K4 (40 x 40 mm) 1 Warna", 80000, 100},
				{"STP-K8-30", "Stempel K8 (30 x 30 mm) 1 Warna", 65000, 100},
				{"STP-K5-25", "Stempel K5 (25 x 25 mm) 1 Warna", 60000, 100},
				{"STP-K4-22", "Stempel K4 (22 x 22 mm) 1 Warna", 55000, 100},
			},
		},
		{
			Category: "Stempel Flash", Name: "Stempel Flash Oval (O Series)",
			Description: "Stempel flash oval 1 warna berbagai ukuran",
			BasePrice: 60000, EstimatedDays: 3,
			Variants: []Variant{
				{"STP-O3-3551", "Stempel O3 (35 x 51 mm) 1 Warna", 70000, 100},
				{"STP-O3-3345", "Stempel O3 (33 x 45 mm) 1 Warna", 65000, 100},
				{"STP-O2-2535", "Stempel O2 (25 x 35 mm) 1 Warna", 60000, 100},
			},
		},
		{
			Category: "Stempel Flash", Name: "Stempel Flash Bulat (B Series)",
			Description: "Stempel flash bulat berbagai ukuran",
			BasePrice: 65000, EstimatedDays: 3,
			Variants: []Variant{
				{"STP-B5-40", "Stempel B5 (40 x 40 mm)", 75000, 100},
				{"STP-B4-38", "Stempel B4 (38 x 38 mm)", 70000, 100},
				{"STP-B3-33", "Stempel B3 (33 x 33 mm) 1 Warna", 65000, 100},
			},
		},
		{
			Category: "Stempel Flash", Name: "Stempel Flash Panjang (K Series)",
			Description: "Stempel flash bentuk panjang berbagai ukuran",
			BasePrice: 55000, EstimatedDays: 3,
			Variants: []Variant{
				{"STP-K5-1350", "Stempel K5 (13 x 50 mm)", 60000, 100},
				{"STP-K3-1335", "Stempel K3 (13 x 35 mm)", 55000, 100},
				{"STP-K2-1045", "Stempel K2 (10 x 45 mm)", 55000, 100},
			},
		},

		// ---- SCANNING ----
		{
			Category: "Scanning", Name: "Scan Warna",
			Description: "Layanan scan warna berbagai ukuran dokumen dan gambar",
			BasePrice: 3000, EstimatedDays: 1,
			Variants: []Variant{
				{"SCN-A0-CLR", "Scan Warna A0", 70000, 999},
				{"SCN-A1-CLR", "Scan Warna A1", 35000, 999},
				{"SCN-A2-CLR", "Scan Warna A2", 17500, 999},
				{"SCN-A3-CLR", "Scan Warna A3", 5000, 999},
				{"SCN-A4F4-CLR", "Scan Warna A4 / F4", 3000, 999},
			},
		},
	}

	successCount := 0

	for _, p := range products {
		catID, ok := categoryIDs[p.Category]
		if !ok {
			log.Printf("  ⚠️  Category '%s' not found, skipping product '%s'", p.Category, p.Name)
			continue
		}

		// Insert product
		var productID int
		err := db.QueryRow(`
			INSERT INTO products (category_id, name, description, base_price, estimated_days, is_active, created_at)
			VALUES ($1, $2, $3, $4, $5, TRUE, NOW())
			RETURNING id
		`, catID, p.Name, p.Description, p.BasePrice, p.EstimatedDays).Scan(&productID)
		if err != nil {
			log.Printf("  ❌ Gagal insert product '%s': %v", p.Name, err)
			continue
		}

		// Insert variants
		for _, v := range p.Variants {
			_, err := db.Exec(`
				INSERT INTO product_variants (product_id, sku, variant_name, price, stock, is_active, created_at)
				VALUES ($1, $2, $3, $4, $5, TRUE, NOW())
			`, productID, v.SKU, v.Name, v.Price, v.Stock)
			if err != nil {
				log.Printf("    ❌ Gagal insert variant '%s': %v", v.Name, err)
			} else {
				log.Printf("    ✅ Variant: %s — Rp %s", v.Name, formatPrice(v.Price))
			}
		}

		successCount++
		log.Printf("  ✅ Product #%d: %s (%d varian)", productID, p.Name, len(p.Variants))
	}

	log.Println("==================================================")
	log.Printf("🎉 Selesai! %d produk berhasil ditambahkan ke katalog.", successCount)
	log.Println("==================================================")
}

func formatPrice(price float64) string {
	p := int(price)
	if p < 1000 {
		return fmt.Sprintf("%d", p)
	}
	return fmt.Sprintf("%d.%03d", p/1000, p%1000)
}
