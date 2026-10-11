package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Job struct {
	ID              uuid.UUID       `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	ClientID        uuid.UUID       `gorm:"column:client_id;type:uuid;not null" json:"clientId"`
	Title           string          `gorm:"type:varchar(255);not null" json:"title"`
	Description     string          `gorm:"type:text;not null" json:"description"`
	BudgetRange     *string         `gorm:"column:budget_range;type:varchar(100)" json:"budgetRange"`
	Status          string          `gorm:"type:varchar(20);default:open" json:"status"`
	RequiredSkills  json.RawMessage `gorm:"column:required_skills;type:jsonb" json:"requiredSkills"`
	ExpectedOutcome *string         `gorm:"column:expected_outcome" json:"expectedOutcome"`
	TrialFriendly   bool            `gorm:"column:trial_friendly;default:false" json:"trialFriendly"`
	IsPublished     bool            `gorm:"column:is_published;default:true" json:"isPublished"`
	CreatedAt       time.Time       `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt       time.Time       `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	Client          *User           `gorm:"foreignKey:ClientID" json:"client,omitempty"`
}

func (Job) TableName() string { return "jobs" }

type JobApplication struct {
	ID             uuid.UUID       `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	JobID          uuid.UUID       `gorm:"column:job_id;type:uuid;not null;uniqueIndex:idx_job_dev" json:"jobId"`
	DeveloperID    uuid.UUID       `gorm:"column:developer_id;type:uuid;not null;uniqueIndex:idx_job_dev" json:"developerId"`
	Message        *string         `json:"message"`
	Status         string          `gorm:"type:varchar(20);default:pending" json:"status"`
	Milestones     json.RawMessage `gorm:"type:jsonb" json:"milestones"`
	TotalBidAmount *float64        `gorm:"column:total_bid_amount" json:"totalBidAmount"`
	AppliedAt      time.Time       `gorm:"column:applied_at;autoCreateTime" json:"appliedAt"`
	PrivateNotes   *string         `gorm:"column:private_notes" json:"privateNotes"`
	HiringStatus   string          `gorm:"column:hiring_status;type:varchar(20);default:applied" json:"hiringStatus"`
	Job            *Job            `gorm:"foreignKey:JobID" json:"job,omitempty"`
	Developer      *User           `gorm:"foreignKey:DeveloperID" json:"developer,omitempty"`
}

func (JobApplication) TableName() string { return "job_applications" }
