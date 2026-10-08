package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Endorsement struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	EndorserID uuid.UUID `gorm:"column:endorser_id;type:uuid;not null" json:"endorser_id"`
	EndorsedID uuid.UUID `gorm:"column:endorsed_id;type:uuid;not null" json:"endorsed_id"`
	SkillID    *int      `gorm:"column:skill_id" json:"skill_id"`
	Message    *string   `json:"message"`
	CreatedAt  time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	Endorser   *User     `gorm:"foreignKey:EndorserID" json:"endorser,omitempty"`
	Endorsed   *User     `gorm:"foreignKey:EndorsedID" json:"endorsed,omitempty"`
	Skill      *Skill    `gorm:"foreignKey:SkillID" json:"skill,omitempty"`
}

func (Endorsement) TableName() string { return "endorsements" }

type ReputationHistory struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID        uuid.UUID      `gorm:"column:user_id;type:uuid;not null" json:"user_id"`
	PreviousScore int            `gorm:"column:previous_score;not null" json:"previous_score"`
	NewScore      int            `gorm:"column:new_score;not null" json:"new_score"`
	ChangeAmount  int            `gorm:"column:change_amount;not null" json:"change_amount"`
	Reason        string         `gorm:"type:varchar(50);not null" json:"reason"`
	Metadata      json.RawMessage `gorm:"type:jsonb" json:"metadata"`
	CreatedAt     time.Time      `gorm:"column:created_at;autoCreateTime" json:"created_at"`
}

func (ReputationHistory) TableName() string { return "reputation_history" }
