package report

import "context"

type Repository interface {
	// Reporting
	GetRevenueReport(ctx context.Context, startDate, endDate string) ([]RevenueData, error)
	GetTopProducts(ctx context.Context, limit int) ([]ProductStat, error)

	// Logging / Monitoring
	GetAuditLogs(ctx context.Context, limit int) ([]AuditLogDisplay, error)
	GetLoginLogs(ctx context.Context, limit int) ([]LoginLogDisplay, error)
	GetProductionLogs(ctx context.Context, limit int) ([]ProductionLogDisplay, error)
}
