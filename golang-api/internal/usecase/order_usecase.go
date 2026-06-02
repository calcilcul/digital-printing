package usecase

import (
	"context"
	"encoding/json"
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
func (u *OrderUsecase) Cancel(ctx context.Context, orderID int, userID int, reason, ip, ua string) error {
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

	// Validasi status — boleh cancel sebelum masuk cetak
	cancellableStatuses := map[string]bool{
		"waiting_payment": true, "payment_verification": true, "payment_rejected": true,
		"pending_design": true, "design_uploaded": true, "design_review": true,
		"revision_requested": true,
	}
	if !cancellableStatuses[o.Status] {
		return errors.New("pesanan tidak dapat dibatalkan karena sudah dalam proses cetak")
	}

	if reason == "" {
		reason = "Dibatalkan oleh customer"
	}
	if err := u.repo.Cancel(ctx, orderID, userID, reason); err != nil {
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

// =========================================================================
// BUY NOW (beli langsung 1 item)
// =========================================================================
func (u *OrderUsecase) BuyNow(ctx context.Context, userID int, productID int, variantID int, quantity int, notes string) (int, string, float64, error) {
	orderID, orderCode, total, err := u.repo.BuyNow(ctx, userID, productID, variantID, quantity, notes)
	if err != nil {
		return 0, "", 0, err
	}
	u.wsHub.BroadcastNotification(fmt.Sprintf("🔔 Pesanan Baru (Beli Sekarang): %s", orderCode))
	return orderID, orderCode, total, nil
}

// =========================================================================
// UPLOAD DESIGN
// =========================================================================
func (u *OrderUsecase) UploadDesign(ctx context.Context, orderID int, orderItemID int, filePath string, userID int) error {
	return u.repo.UploadDesign(ctx, orderID, orderItemID, filePath, userID)
}

// =========================================================================
// REUPLOAD DESIGN (setelah revisi)
// =========================================================================
func (u *OrderUsecase) ReuploadDesign(ctx context.Context, orderID int, orderItemID int, filePath string, userID int) error {
	return u.repo.ReuploadDesign(ctx, orderID, orderItemID, filePath, userID)
}

// =========================================================================
// UPLOAD PAYMENT
// =========================================================================
func (u *OrderUsecase) UploadPayment(ctx context.Context, orderID int, userID int, filePath string, amount float64) error {
	err := u.repo.UploadPayment(ctx, orderID, userID, filePath, amount)
	if err != nil {
		return err
	}
	u.wsHub.BroadcastNotification(fmt.Sprintf("💰 Bukti Bayar Baru untuk Order #%d", orderID))
	return nil
}

// =========================================================================
// REUPLOAD PAYMENT (setelah ditolak)
// =========================================================================
func (u *OrderUsecase) ReuploadPayment(ctx context.Context, orderID int, userID int, filePath string) error {
	return u.repo.ReuploadPayment(ctx, orderID, userID, filePath)
}

// =========================================================================
// STAFF: APPROVE PAYMENT
// =========================================================================
func (u *OrderUsecase) ApprovePayment(ctx context.Context, orderID int, staffID int) error {
	err := u.repo.ApprovePayment(ctx, orderID, staffID)
	if err != nil {
		return err
	}
	payload := map[string]interface{}{
		"event":    "payment_approved",
		"title":    "Pembayaran Disetujui",
		"message":  fmt.Sprintf("Pembayaran untuk order #%d telah disetujui", orderID),
		"order_id": orderID,
	}
	jsonStr, _ := json.Marshal(payload)
	u.wsHub.BroadcastNotification(string(jsonStr))
	return nil
}

// =========================================================================
// STAFF: REJECT PAYMENT
// =========================================================================
func (u *OrderUsecase) RejectPayment(ctx context.Context, orderID int, staffID int, reason string) error {
	err := u.repo.RejectPayment(ctx, orderID, staffID, reason)
	if err != nil {
		return err
	}
	payload := map[string]interface{}{
		"event":    "payment_rejected",
		"title":    "Pembayaran Ditolak",
		"message":  reason,
		"order_id": orderID,
	}
	jsonStr, _ := json.Marshal(payload)
	u.wsHub.BroadcastNotification(string(jsonStr))
	return nil
}

// =========================================================================
// STAFF: APPROVE DESIGN
// =========================================================================
func (u *OrderUsecase) ApproveDesign(ctx context.Context, orderID int, staffID int) error {
	err := u.repo.ApproveDesign(ctx, orderID, staffID)
	if err != nil {
		return err
	}
	payload := map[string]interface{}{
		"event":    "design_approved",
		"title":    "Desain Disetujui",
		"message":  fmt.Sprintf("Desain untuk order #%d telah disetujui", orderID),
		"order_id": orderID,
	}
	jsonStr, _ := json.Marshal(payload)
	u.wsHub.BroadcastNotification(string(jsonStr))
	return nil
}

// =========================================================================
// STAFF: REQUEST REVISION
// =========================================================================
func (u *OrderUsecase) RequestRevision(ctx context.Context, orderID int, staffID int, notes string) error {
	err := u.repo.RequestRevision(ctx, orderID, staffID, notes)
	if err != nil {
		return err
	}
	payload := map[string]interface{}{
		"event":    "design_revision",
		"title":    "Desain Perlu Direvisi",
		"message":  notes,
		"order_id": orderID,
	}
	jsonStr, _ := json.Marshal(payload)
	u.wsHub.BroadcastNotification(string(jsonStr))
	return nil
}

// =========================================================================
// STAFF: FINISH PRINTING
// =========================================================================
func (u *OrderUsecase) FinishPrinting(ctx context.Context, orderID int, staffID int) error {
	err := u.repo.FinishPrinting(ctx, orderID, staffID)
	if err != nil {
		return err
	}
	payload := map[string]interface{}{
		"event":    "order_ready",
		"title":    "Pesanan Siap Diambil",
		"message":  fmt.Sprintf("Pesanan #%d selesai dicetak dan siap diambil", orderID),
		"order_id": orderID,
	}
	jsonStr, _ := json.Marshal(payload)
	u.wsHub.BroadcastNotification(string(jsonStr))
	return nil
}

