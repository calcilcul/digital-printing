package usecase

import (
	"context"
	"errors"
	"fmt"
	"time"

	"golang-api/internal/domain/audit"
	"golang-api/internal/domain/order"
	"golang-api/internal/delivery/websocket"
)

type OrderUsecase struct {
	repo      order.Repository
	auditRepo audit.Repository
	wsHub     *websocket.Hub
}

func NewOrderUsecase(repo order.Repository, auditRepo audit.Repository, wsHub *websocket.Hub) *OrderUsecase {
	return &OrderUsecase{
		repo:      repo,
		auditRepo: auditRepo,
		wsHub:     wsHub,
	}
}

// =========================================================================
// CREATE ORDER (MANUAL/OPTIONAL)
// =========================================================================
func (u *OrderUsecase) Create(ctx context.Context, userID int, items []order.OrderItem, ip, ua string) error {
	if len(items) == 0 {
		return errors.New("pesanan harus memiliki setidaknya satu item")
	}

	orderCode := fmt.Sprintf("ORD-%d", time.Now().Unix())

	o := &order.Order{
		UserID:    userID,
		OrderCode: orderCode,
		Status:    "waiting_payment",
	}

	if err := u.repo.Create(ctx, o, items); err != nil {
		return err
	}

	// Catat Audit Log dengan Metadata Lengkap
	_ = u.auditRepo.Create(ctx, &audit.AuditLog{
		UserID:    userID,
		Role:      "customer",
		Action:    audit.ActionCreateOrder,
		EntityType:"orders",
		EntityID:  o.ID,
		IPAddress: ip,
		UserAgent: ua,
	})

	// Kirim Notifikasi WebSocket ke Staff/Manager
	u.wsHub.BroadcastNotification(fmt.Sprintf("🔔 Pesanan Baru: %s", orderCode))

	return nil
}

// =========================================================================
// CHECKOUT (PROSES UTAMA DARI KERANJANG)
// =========================================================================
func (u *OrderUsecase) Checkout(ctx context.Context, userID int, ip, ua string) (int, string, float64, error) {
	// Panggil repo checkout (Transaksi DB)
	orderID, orderCode, total, err := u.repo.Checkout(ctx, userID)
	if err != nil {
		return 0, "", 0, err
	}

	// Catat Audit Log Checkout
	_ = u.auditRepo.Create(ctx, &audit.AuditLog{
		UserID:    userID,
		Role:      "customer",
		Action:    audit.ActionCheckout,
		EntityType:"orders",
		EntityID:  orderID,
		IPAddress: ip,
		UserAgent: ua,
	})

	// Kirim Notifikasi WebSocket ke Staff/Manager
	u.wsHub.BroadcastNotification(fmt.Sprintf("🔔 Pesanan Baru (Checkout): %s", orderCode))

	return orderID, orderCode, total, nil
}

// =========================================================================
// CANCEL ORDER
// =========================================================================
func (u *OrderUsecase) Cancel(ctx context.Context, orderID int, userID int, ip, ua string) error {
	o, err := u.repo.FindByID(ctx, orderID)
	if err != nil {
		return err
	}
	if o == nil {
		return errors.New("pesanan tidak ditemukan")
	}

	// Validasi kepemilikan
	if o.UserID != userID {
		return errors.New("anda tidak memiliki akses untuk membatalkan pesanan ini")
	}

	// Validasi status
	if o.Status != "waiting_payment" && o.Status != "payment_verification" {
		return errors.New("pesanan tidak dapat dibatalkan karena sudah dalam proses")
	}

	if err := u.repo.Cancel(ctx, orderID, userID); err != nil {
		return err
	}

	// Catat Audit Log Pembatalan
	_ = u.auditRepo.Create(ctx, &audit.AuditLog{
		UserID:    userID,
		Role:      "customer",
		Action:    "CANCEL_ORDER",
		EntityType:"orders",
		EntityID:  orderID,
		IPAddress: ip,
		UserAgent: ua,
	})

	return nil
}

// =========================================================================
// GET MY ORDERS (Customer — hanya pesanan miliknya)
// =========================================================================
func (u *OrderUsecase) GetMyOrders(ctx context.Context, userID int) ([]order.Order, error) {
	return u.repo.GetOrdersByUserID(ctx, userID)
}

// =========================================================================
// GET ALL ORDERS (Owner/Admin Dashboard)
// =========================================================================
func (u *OrderUsecase) GetAllOrders(ctx context.Context) ([]order.Order, error) {
	return u.repo.GetAllOrders(ctx)
}

// =========================================================================
// GET ORDER DETAIL (INVOICE)
// =========================================================================
func (u *OrderUsecase) GetOrderDetail(ctx context.Context, orderID int, userID int, role string) (*order.OrderDetail, error) {
	// RBAC: Jika user adalah customer, pastikan ini pesanannya sendiri
	if role == "customer" {
		o, err := u.repo.FindByID(ctx, orderID)
		if err != nil {
			return nil, err
		}
		if o == nil {
			return nil, errors.New("pesanan tidak ditemukan")
		}
		if o.UserID != userID {
			return nil, errors.New("anda tidak memiliki akses untuk melihat pesanan ini")
		}
	}

	// Panggil repository untuk mendapatkan detail lengkap
	detail, err := u.repo.FindDetailByID(ctx, orderID)
	if err != nil {
		return nil, err
	}

	return detail, nil
}

// =========================================================================
// COMPLETE ORDER (Customer)
// =========================================================================
func (u *OrderUsecase) CompleteOrder(ctx context.Context, orderID int, userID int, ip string, ua string) error {
	// Panggil repository untuk update status menjadi completed
	err := u.repo.CompleteOrder(ctx, orderID, userID)
	if err != nil {
		return err
	}

	// Catat Audit Log
	_ = u.auditRepo.Create(ctx, &audit.AuditLog{
		UserID:     userID,
		Role:       "customer",
		Action:     "COMPLETE_ORDER",
		EntityType: "orders",
		EntityID:   orderID,
		IPAddress:  ip,
		UserAgent:  ua,
	})

	return nil
}
