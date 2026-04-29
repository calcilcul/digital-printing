package audit

const (
	// 🔥 AUTH
	ActionLogin         = "login"
	ActionRegister      = "register"
	ActionRegisterStaff = "register_staff"

	// 🔥 PAYMENT
	ActionCreatePayment  = "create_payment"
	ActionApprovePayment = "approve_payment"
	ActionRejectPayment  = "reject_payment"

	// 🔥 ORDER
	ActionCreateOrder = "create_order"
	ActionCheckout    = "checkout"
	ActionCancelOrder = "cancel_order" // Tambahan buat cancel yang tadi udah kamu buat

	// 🔥 PRODUCTION (Persiapan untuk langkah selanjutnya)
	ActionStartProduction  = "start_production"
	ActionFinishProduction = "finish_production"
	ActionUpdateStatus     = "update_status"
)
