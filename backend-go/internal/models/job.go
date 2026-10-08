package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Job struct {
	ID              uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	ClientID        uuid.UUID      `gorm:"column:client_id;type:uuid;not null" json:"client_id"`
	Title           string         `gorm:"type:varchar(255);not null" json:"title"`
	Description     string         `gorm:"type:text;not null" json:"description"`
	BudgetRange     *string        `gorm:"column:budget_range;type:varchar(100)" json:"budget_range"`
	Status          string         `gorm:"type:varchar(20);default:open" json:"status"`
	RequiredSkills  json.RawMessage `gorm:"column:required_skills;type:jsonb" json:"required_skills"`
	ExpectedOutcome *string        `gorm:"column:expected_outcome" json:"expected_outcome"`
	TrialFriendly   bool           `gorm:"column:trial_friendly;default:false" json:"trial_friendly"`
	IsPublished     bool           `gorm:"column:is_published;default:true" json:"is_published"`
	CreatedAt       time.Time      `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	Client          *User          `gorm:"foreignKey:ClientID" json:"client,omitempty"`
}

func (Job) TableName() string { return "jobs" }

type JobApplication struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	JobID         uuid.UUID `gorm:"column:job_id;type:uuid;not null;uniqueIndex:idx_job_dev" json:"job_id"`
	DeveloperID   uuid.UUID `gorm:"column:developer_id;type:uuid;not null;uniqueIndex:idx_job_dev" json:"developer_id"`
	Message       *string   `json:"message"`
	Status        string    `gorm:"type:varchar(20);default:pending" json:"status"`
	AppliedAt     time.Time `gorm:"column:applied_at;autoCreateTime" json:"applied_at"`
	PrivateNotes  *string   `gorm:"column:private_notes" json:"private_notes"`
	HiringStatus  string    `gorm:"column:hiring_status;type:varchar(20);default:applied" json:"hiring_status"`
	Job           *Job      `gorm:"foreignKey:JobID" json:"job,omitempty"`
	Developer     *User     `gorm:"foreignKey:DeveloperID" json:"developer,omitempty"`
}

func (JobApplication) TableName() string { return "job_applications" }
