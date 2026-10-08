package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type Project struct {
	ID              int            `gorm:"primaryKey" json:"id"`
	UserID          uuid.UUID      `gorm:"column:user_id;type:uuid" json:"userId"`
	Title           string         `gorm:"type:varchar(100);not null" json:"title"`
	GitHubRepo      string         `gorm:"column:github_repo;type:text;not null" json:"githubRepo"`
	LiveDemo        *string        `gorm:"column:live_demo" json:"liveDemo"`
	TechStack       pq.StringArray `gorm:"column:tech_stack;type:text[]" json:"techStack"`
	Description     string         `gorm:"type:text;not null" json:"description"`
	DescriptionHTML *string        `gorm:"column:description_html" json:"descriptionHtml"`
	Thumbnail       *string        `json:"thumbnail"`
	Views           int            `gorm:"default:0" json:"views"`
	Visibility      string         `gorm:"type:varchar(20);default:public" json:"visibility"`
	CreatedAt       time.Time      `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt       time.Time      `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	User            *User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (Project) TableName() string { return "projects" }
