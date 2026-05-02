package usecase

import (
	"context"
	"time"

	"golang-api/internal/domain/report"
)

type ReportUsecase struct {
	repo report.Repository
}

func NewReportUsecase(repo report.Repository) *ReportUsecase {
	return &ReportUsecase{repo: repo}
}

func (u *ReportUsecase) GetRevenueReport(ctx context.Context, startDate, endDate string) ([]report.RevenueData, error) {
	// Jika kosong, default 30 hari terakhir
	if startDate == "" || endDate == "" {
		now := time.Now()
		endDate = now.Format("2006-01-02")
		startDate = now.AddDate(0, 0, -30).Format("2006-01-02")
	}
	return u.repo.GetRevenueReport(ctx, startDate, endDate)
}

func (u *ReportUsecase) GetTopProducts(ctx context.Context, limit int) ([]report.ProductStat, error) {
	if limit <= 0 {
		limit = 10 // default top 10
	}
	return u.repo.GetTopProducts(ctx, limit)
}

func (u *ReportUsecase) GetAuditLogs(ctx context.Context, limit int) ([]report.AuditLogDisplay, error) {
	if limit <= 0 {
		limit = 50
	}
	return u.repo.GetAuditLogs(ctx, limit)
}

func (u *ReportUsecase) GetLoginLogs(ctx context.Context, limit int) ([]report.LoginLogDisplay, error) {
	if limit <= 0 {
		limit = 50
	}
	return u.repo.GetLoginLogs(ctx, limit)
}

func (u *ReportUsecase) GetProductionLogs(ctx context.Context, limit int) ([]report.ProductionLogDisplay, error) {
	if limit <= 0 {
		limit = 50
	}
	return u.repo.GetProductionLogs(ctx, limit)
}
