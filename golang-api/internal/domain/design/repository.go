package design

import "context"

type Repository interface {
	UploadDesign(ctx context.Context, design *DesignFile) error
	GetDesignsByOrderItemID(ctx context.Context, orderItemID int) ([]DesignFile, error)
	GetLatestVersion(ctx context.Context, orderItemID int) (int, error)
	GetDesignByID(ctx context.Context, designID int) (*DesignFile, error)
	AddReview(ctx context.Context, review *DesignReview) error
	// VerifyOrderItemOwnership memastikan order_item milik user tersebut
	VerifyOrderItemOwnership(ctx context.Context, orderItemID int, userID int) (bool, error)
}
