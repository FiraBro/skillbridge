package models

import (
	"time"

	"github.com/google/uuid"
)

type CompanyProfile struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	UserID      uuid.UUID `gorm:"column:user_id;type:uuid;not null;uniqueIndex" json:"userId"`
	Name        string    `gorm:"type:varchar(255);not null" json:"name"`
	LogoURL     *string   `gorm:"column:logo_url" json:"logoUrl"`
	Description *string   `json:"description"`
	Industry    *string   `gorm:"type:varchar(100)" json:"industry"`
	Size        *string   `gorm:"type:varchar(50)" json:"size"`
	Website     *string   `json:"website"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (CompanyProfile) TableName() string { return "company_profiles" }

type DeveloperBookmark struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CompanyID   uuid.UUID `gorm:"column:company_id;type:uuid;not null;uniqueIndex:idx_company_dev" json:"companyId"`
	DeveloperID uuid.UUID `gorm:"column:developer_id;type:uuid;not null;uniqueIndex:idx_company_dev" json:"developerId"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
}

func (DeveloperBookmark) TableName() string { return "developer_bookmarks" }
