package audit

import "time"

type AuditLog struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Role       string    `json:"role"`
	Action     string    `json:"action"`
	EntityType string    `json:"entity_type"`
	EntityID   int       `json:"entity_id"`
	IPAddress string    `json:"ip_address"` // Harus 'IPAddress' (IP kapital)
	UserAgent string    `json:"user_agent"` // Harus 'UserAgent' (UA kapital)
	CreatedAt time.Time `json:"created_at"`
}
