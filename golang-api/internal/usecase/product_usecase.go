package usecase

import (
	"fmt"

	"golang-api/internal/domain/product"
)

type ProductUsecase struct {
	repo product.Repository
}

func NewProductUsecase(repo product.Repository) *ProductUsecase {
	return &ProductUsecase{repo}
}

// ========================
// GET ALL PRODUCTS
// ========================
func (u *ProductUsecase) GetAll() ([]product.Product, error) {

	products, err := u.repo.FindAll()
	if err != nil {
		return nil, fmt.Errorf("failed to get products: %w", err)
	}

	return products, nil
}

// ========================
// CREATE PRODUCT
// ========================
func (u *ProductUsecase) Create(req product.ProductRequest) error {
	// Map request to entity
	newProduct := product.Product{
		CategoryID:    req.CategoryID,
		Name:          req.Name,
		Description:   req.Description,
		BasePrice:     req.BasePrice,
		EstimatedDays: req.EstimatedDays,
		IsActive:      *req.IsActive,
	}

	for _, vReq := range req.Variants {
		newProduct.Variants = append(newProduct.Variants, product.ProductVariant{
			SKU:           vReq.SKU,
			VariantName:   vReq.VariantName,
			Price:         vReq.Price,
			Stock:         vReq.Stock,
			IsActive:      *vReq.IsActive,
			MaterialID:    vReq.MaterialID,
			MaterialUsage: vReq.MaterialUsage,
		})
	}

	err := u.repo.Create(&newProduct)
	if err != nil {
		return fmt.Errorf("failed to create product: %w", err)
	}

	return nil
}

// ========================
// UPDATE PRODUCT
// ========================
func (u *ProductUsecase) Update(id int, req product.ProductRequest) error {
	// Map request to entity
	updatedProduct := product.Product{
		ID:            id,
		CategoryID:    req.CategoryID,
		Name:          req.Name,
		Description:   req.Description,
		BasePrice:     req.BasePrice,
		EstimatedDays: req.EstimatedDays,
		IsActive:      *req.IsActive,
	}

	for _, vReq := range req.Variants {
		updatedProduct.Variants = append(updatedProduct.Variants, product.ProductVariant{
			ID:            vReq.ID,
			SKU:           vReq.SKU,
			VariantName:   vReq.VariantName,
			Price:         vReq.Price,
			Stock:         vReq.Stock,
			IsActive:      *vReq.IsActive,
			MaterialID:    vReq.MaterialID,
			MaterialUsage: vReq.MaterialUsage,
		})
	}

	err := u.repo.Update(&updatedProduct)
	if err != nil {
		return fmt.Errorf("failed to update product: %w", err)
	}

	return nil
}

// ========================
// DELETE PRODUCT
// ========================
func (u *ProductUsecase) Delete(id int) error {
	err := u.repo.Delete(id)
	if err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}

	return nil
}
