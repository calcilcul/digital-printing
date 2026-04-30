package postgres

import (
	"context"
	"database/sql"

	"golang-api/internal/domain/report"
)

type reportRepository struct {
	db *sql.DB
}

func NewReportRepository(db *sql.DB) report.Repository {
	return &reportRepository{db: db}
}

// =========================================================================
// REVENUE REPORT
// =========================================================================
func (r *reportRepository) GetRevenueReport(ctx context.Context, startDate, endDate string) ([]report.RevenueData, error) {
	query := `
		SELECT 
			TO_CHAR(created_at, 'YYYY-MM-DD') AS date,
			COUNT(id) AS total_orders,
			COALESCE(SUM(total_price), 0) AS total_revenue
		FROM orders
		WHERE status IN ('paid', 'printing', 'ready', 'completed')
		  AND created_at >= $1::date AND created_at < ($2::date + interval '1 day')
		GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
		ORDER BY date ASC
	`

	rows, err := r.db.QueryContext(ctx, query, startDate, endDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var data []report.RevenueData
	for rows.Next() {
		var rd report.RevenueData
		if err := rows.Scan(&rd.Date, &rd.TotalOrders, &rd.TotalRevenue); err != nil {
			return nil, err
		}
		data = append(data, rd)
	}
	return data, rows.Err()
}

// =========================================================================
// TOP PRODUCTS
// =========================================================================
func (r *reportRepository) GetTopProducts(ctx context.Context, limit int) ([]report.ProductStat, error) {
	query := `
		SELECT 
			p.id AS product_id,
			p.name AS product_name,
			SUM(oi.quantity) AS total_sold,
			SUM(oi.quantity * oi.price) AS total_revenue
		FROM order_items oi
		JOIN products p ON oi.product_id = p.id
		JOIN orders o ON oi.order_id = o.id
		WHERE o.status IN ('paid', 'printing', 'ready', 'completed')
		GROUP BY p.id, p.name
		ORDER BY total_sold DESC
		LIMIT $1
	`

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var data []report.ProductStat
	for rows.Next() {
		var ps report.ProductStat
		if err := rows.Scan(&ps.ProductID, &ps.ProductName, &ps.TotalSold, &ps.TotalRevenue); err != nil {
			return nil, err
		}
		data = append(data, ps)
	}
	return data, rows.Err()
}

// =========================================================================
// AUDIT LOGS
// =========================================================================
func (r *reportRepository) GetAuditLogs(ctx context.Context, limit int) ([]report.AuditLogDisplay, error) {
	query := `
		SELECT 
			a.id, u.name, a.role, a.action, a.entity_type, 
			COALESCE(a.entity_id, 0), COALESCE(a.ip_address, ''), a.created_at
		FROM audit_logs a
		LEFT JOIN users u ON a.user_id = u.id
		ORDER BY a.created_at DESC
		LIMIT $1
	`

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []report.AuditLogDisplay
	for rows.Next() {
		var l report.AuditLogDisplay
		var entityID sql.NullInt64
		if err := rows.Scan(&l.ID, &l.UserName, &l.Role, &l.Action, &l.EntityType, &entityID, &l.IPAddress, &l.CreatedAt); err != nil {
			return nil, err
		}
		l.EntityID = int(entityID.Int64)
		logs = append(logs, l)
	}
	return logs, rows.Err()
}

// =========================================================================
// LOGIN LOGS
// =========================================================================
func (r *reportRepository) GetLoginLogs(ctx context.Context, limit int) ([]report.LoginLogDisplay, error) {
	query := `
		SELECT 
			l.id, u.name, l.activity_type, 
			COALESCE(l.ip_address, ''), COALESCE(l.user_agent, ''), l.created_at
		FROM login_logs l
		LEFT JOIN users u ON l.user_id = u.id
		ORDER BY l.created_at DESC
		LIMIT $1
	`

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []report.LoginLogDisplay
	for rows.Next() {
		var l report.LoginLogDisplay
		if err := rows.Scan(&l.ID, &l.UserName, &l.ActivityType, &l.IPAddress, &l.UserAgent, &l.CreatedAt); err != nil {
			return nil, err
		}
		logs = append(logs, l)
	}
	return logs, rows.Err()
}

// =========================================================================
// PRODUCTION LOGS
// =========================================================================
func (r *reportRepository) GetProductionLogs(ctx context.Context, limit int) ([]report.ProductionLogDisplay, error) {
	query := `
		SELECT 
			p.id, o.order_code, u.name, 
			p.start_time, p.end_time, COALESCE(p.notes, ''), p.created_at
		FROM production_logs p
		JOIN orders o ON p.order_id = o.id
		LEFT JOIN users u ON p.staff_id = u.id
		ORDER BY p.created_at DESC
		LIMIT $1
	`

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []report.ProductionLogDisplay
	for rows.Next() {
		var l report.ProductionLogDisplay
		var startTime, endTime sql.NullTime
		if err := rows.Scan(&l.ID, &l.OrderCode, &l.StaffName, &startTime, &endTime, &l.Notes, &l.CreatedAt); err != nil {
			return nil, err
		}
		if startTime.Valid {
			l.StartTime = &startTime.Time
		}
		if endTime.Valid {
			l.EndTime = &endTime.Time
		}
		logs = append(logs, l)
	}
	return logs, rows.Err()
}
