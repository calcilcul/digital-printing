package cart

// CartItem mencerminkan struktur tabel cart_items di PostgreSQL [cite: 1259 16643]
type CartItem struct {
	ID        int    `json:"id"`
	CartID    int    `json:"cart_id"`    // Terhubung ke tabel carts
	ProductID int    `json:"product_id"` // Produk yang dipesan
	VariantID int    `json:"variant_id"` // Pilihan varian
	Quantity  int    `json:"quantity"`   // Jumlah pesanan
	Notes     string `json:"notes"`      // Catatan tambahan dari customer
}

// Cart adalah induk dari item-item keranjang [cite: 1259 16626]
type Cart struct {
	ID        int        `json:"id"`
	UserID    int        `json:"user_id"` // UserID ada di sini, bukan di item [cite: 1259 16626]
	CreatedAt string     `json:"created_at"`
	Items     []CartItem `json:"items,omitempty"` // Slice untuk menampung banyak item
}
