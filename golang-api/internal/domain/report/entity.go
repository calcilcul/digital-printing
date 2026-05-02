package report

import "time"

// RevenueData menyimpan data agregasi pendapatan per bulan/hari
type RevenueData struct {
	Date        string  `json:"date"`
	TotalOrders int     `json:"total_orders"`
	TotalRevenue float64 `json:"total_revenue"`
}

// ProductStat menyimpan statistik produk mana yang paling laris
type ProductStat struct {
	ProductID   int     `json:"product_id"`
	ProductName string  `json:"product_name"`
	TotalSold   int     `json:"total_sold"`
	TotalRevenue float64 `json:"total_revenue"`
}

// Log struct untuk kebutuhan dashboard Admin
type AuditLogDisplay struct {
	ID         int       `json:"id"`
	UserName   string    `json:"user_name"`
	Role       string    `json:"role"`
	Action     string    `json:"action"`
	EntityType string    `json:"entity_type"`
	EntityID   int       `json:"entity_id"`
	IPAddress  string    `json:"ip_address"`
	CreatedAt  time.Time `json:"created_at"`
}

type LoginLogDisplay struct {
	ID           int       `json:"id"`
	UserName     string    `json:"user_name"`
	ActivityType string    `json:"activity_type"`
	IPAddress    string    `json:"ip_address"`
	UserAgent    string    `json:"user_agent"`
	CreatedAt    time.Time `json:"created_at"`
}

type ProductionLogDisplay struct {
	ID          int        `json:"id"`
	OrderCode   string     `json:"order_code"`
	StaffName   string     `json:"staff_name"`
	StartTime   *time.Time `json:"start_time"`
	EndTime     *time.Time `json:"end_time"`
	Notes       string     `json:"notes"`
	CreatedAt   time.Time  `json:"created_at"`
}
