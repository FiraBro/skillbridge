package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type Project struct {
	ID              int            `gorm:"primaryKey" json:"id"`
	UserID          uuid.UUID      `gorm:"column:user_id;type:uuid" json:"user_id"`
	Title           string         `gorm:"type:varchar(100);not null" json:"title"`
	GitHubRepo      string         `gorm:"column:github_repo;type:text;not null" json:"github_repo"`
	LiveDemo        *string        `gorm:"column:live_demo" json:"live_demo"`
	TechStack       pq.StringArray `gorm:"column:tech_stack;type:text[]" json:"tech_stack"`
	Description     string         `gorm:"type:text;not null" json:"description"`
	DescriptionHTML *string        `gorm:"column:description_html" json:"description_html"`
	Thumbnail       *string        `json:"thumbnail"`
	Views           int            `gorm:"default:0" json:"views"`
	Visibility      string         `gorm:"type:varchar(20);default:public" json:"visibility"`
	CreatedAt       time.Time      `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	User            *User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (Project) TableName() string { return "projects" }
