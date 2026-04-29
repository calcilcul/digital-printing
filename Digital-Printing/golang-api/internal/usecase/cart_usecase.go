package usecase

import (
	"context"
	"errors"

	"golang-api/internal/domain/cart"
)

type CartUsecase struct {
	repo cart.Repository
}

// NewCartUsecase menginisialisasi usecase dengan repository yang sesuai
func NewCartUsecase(repo cart.Repository) *CartUsecase {
	return &CartUsecase{
		repo: repo,
	}
}

// =========================================================================
// ADD TO CART
// =========================================================================
func (u *CartUsecase) Add(
	ctx context.Context,
	userID int,
	productID int,
	variantID int,
	qty int,
	notes string,
) error {

	// 1. Validasi Input Dasar
	if qty <= 0 {
		return errors.New("jumlah pesanan harus lebih dari 0")
	}

	if productID <= 0 {
		return errors.New("produk tidak valid")
	}

	// 2. Mapping ke Domain Entity
	// UserID tidak dimasukkan ke CartItem karena secara skema UserID milik tabel Carts
	item := &cart.CartItem{
		ProductID: productID,
		VariantID: variantID,
		Quantity:  qty,
		Notes:     notes,
	}

	// 3. Simpan ke Repository
	return u.repo.Add(ctx, userID, item)
}

// =========================================================================
// GET CART
// =========================================================================
func (u *CartUsecase) Get(ctx context.Context, userID int) ([]map[string]interface{}, error) {
	if userID <= 0 {
		return nil, errors.New("unauthorized: user id required")
	}

	return u.repo.GetByUserID(ctx, userID)
}

// =========================================================================
// UPDATE CART ITEM
// =========================================================================
// Menggunakan cartItemID agar perubahan kuantitas tepat sasaran pada item tertentu
func (u *CartUsecase) Update(ctx context.Context, cartItemID int, qty int) error {
	if qty <= 0 {
		return errors.New("kuantitas minimal adalah 1")
	}

	if cartItemID <= 0 {
		return errors.New("item keranjang tidak valid")
	}

	return u.repo.Update(ctx, cartItemID, qty)
}

// =========================================================================
// DELETE FROM CART
// =========================================================================
func (u *CartUsecase) Delete(ctx context.Context, cartItemID int) error {
	if cartItemID <= 0 {
		return errors.New("item keranjang tidak valid")
	}

	return u.repo.Delete(ctx, cartItemID)
}
