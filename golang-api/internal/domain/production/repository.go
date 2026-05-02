package production

import "context"

type Repository interface {
	StartProduction(ctx context.Context, orderID int, staffID int, notes string) error
	FinishProduction(ctx context.Context, orderID int, staffID int, notes string) error
}
