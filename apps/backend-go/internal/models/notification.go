package models

import (
	"time"

	"github.com/google/uuid"
)

type ProfileView struct {
	ID         uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	ProfileID  uuid.UUID  `gorm:"column:profile_id;type:uuid;not null" json:"profileId"`
	ViewerID   *uuid.UUID `gorm:"column:viewer_id;type:uuid" json:"viewerId"`
	ViewerRole *string    `gorm:"column:viewer_role;type:varchar(50)" json:"viewerRole"`
	CreatedAt  time.Time  `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
}

func (ProfileView) TableName() string { return "profile_views" }

type Conversation struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	UserOne       uuid.UUID  `gorm:"column:user_one;type:uuid;not null;uniqueIndex:idx_conversation_pair" json:"userOne"`
	UserTwo       uuid.UUID  `gorm:"column:user_two;type:uuid;not null;uniqueIndex:idx_conversation_pair" json:"userTwo"`
	LastMessageAt *time.Time `gorm:"column:last_message_at" json:"lastMessageAt"`
	CreatedAt     time.Time  `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
}

func (Conversation) TableName() string { return "conversations" }

type Message struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	ConversationID uuid.UUID `gorm:"column:conversation_id;type:uuid;not null" json:"conversationId"`
	SenderID       uuid.UUID `gorm:"column:sender_id;type:uuid;not null" json:"senderId"`
	MessageText    string    `gorm:"column:message_text;type:text;not null" json:"message"`
	CreatedAt      time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
}

func (Message) TableName() string { return "messages" }

type ContactRequest struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	SenderID   uuid.UUID `gorm:"column:sender_id;type:uuid;not null;uniqueIndex:idx_contact_pair" json:"senderId"`
	ReceiverID uuid.UUID `gorm:"column:receiver_id;type:uuid;not null;uniqueIndex:idx_contact_pair" json:"receiverId"`
	Status     string    `gorm:"type:varchar(20);default:pending" json:"status"`
	Message    *string   `json:"message"`
	CreatedAt  time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt  time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (ContactRequest) TableName() string { return "contact_requests" }

type ContentReport struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	ReporterID  *uuid.UUID `gorm:"column:reporter_id;type:uuid" json:"reporterId"`
	ContentType string     `gorm:"column:content_type;type:varchar(50);not null" json:"contentType"`
	ContentID   uuid.UUID  `gorm:"column:content_id;type:uuid;not null" json:"contentId"`
	Reason      string     `gorm:"type:text;not null" json:"reason"`
	Status      string     `gorm:"type:varchar(20);default:pending" json:"status"`
	AdminNotes  *string    `gorm:"column:admin_notes" json:"adminNotes"`
	CreatedAt   time.Time  `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time  `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (ContentReport) TableName() string { return "content_reports" }

type PlatformSetting struct {
	Key         string    `gorm:"primaryKey;type:varchar(100)" json:"key"`
	Value       []byte    `gorm:"type:jsonb;not null" json:"value"`
	Description *string   `json:"description"`
	UpdatedAt   time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (PlatformSetting) TableName() string { return "platform_settings" }
