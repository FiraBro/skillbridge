package models

import (
	"time"

	"github.com/google/uuid"
)

type ProfileView struct {
	ID         uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	ProfileID  uuid.UUID  `gorm:"column:profile_id;type:uuid;not null" json:"profile_id"`
	ViewerID   *uuid.UUID `gorm:"column:viewer_id;type:uuid" json:"viewer_id"`
	ViewerRole *string    `gorm:"column:viewer_role;type:varchar(50)" json:"viewer_role"`
	CreatedAt  time.Time  `gorm:"column:created_at;autoCreateTime" json:"created_at"`
}

func (ProfileView) TableName() string { return "profile_views" }

type ContactRequest struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	SenderID   uuid.UUID `gorm:"column:sender_id;type:uuid;not null;uniqueIndex:idx_contact_pair" json:"sender_id"`
	ReceiverID uuid.UUID `gorm:"column:receiver_id;type:uuid;not null;uniqueIndex:idx_contact_pair" json:"receiver_id"`
	Status     string    `gorm:"type:varchar(20);default:pending" json:"status"`
	Message    *string   `json:"message"`
	CreatedAt  time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

func (ContactRequest) TableName() string { return "contact_requests" }

type ContentReport struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	ReporterID  *uuid.UUID `gorm:"column:reporter_id;type:uuid" json:"reporter_id"`
	ContentType string    `gorm:"column:content_type;type:varchar(50);not null" json:"content_type"`
	ContentID   uuid.UUID `gorm:"column:content_id;type:uuid;not null" json:"content_id"`
	Reason      string    `gorm:"type:text;not null" json:"reason"`
	Status      string    `gorm:"type:varchar(20);default:pending" json:"status"`
	AdminNotes  *string   `gorm:"column:admin_notes" json:"admin_notes"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

func (ContentReport) TableName() string { return "content_reports" }

type PlatformSetting struct {
	Key         string    `gorm:"primaryKey;type:varchar(100)" json:"key"`
	Value       []byte    `gorm:"type:jsonb;not null" json:"value"`
	Description *string   `json:"description"`
	UpdatedAt   time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

func (PlatformSetting) TableName() string { return "platform_settings" }
