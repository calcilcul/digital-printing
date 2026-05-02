package material

import "context"

type Repository interface {
	Create(ctx context.Context, m *Material) error
	FindAll(ctx context.Context) ([]Material, error)
	FindByID(ctx context.Context, id int) (*Material, error)
	AdjustStock(ctx context.Context, materialID int, changeType string, quantity float64, reference string) error
}
