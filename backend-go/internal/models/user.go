package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                   uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Email                string     `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash         string     `gorm:"column:password_hash;type:text" json:"-"`
	Name                 *string    `gorm:"type:varchar(120)" json:"name"`
	Username             *string    `gorm:"type:varchar(120)" json:"username"`
	Role                 string     `gorm:"type:varchar(50);default:developer" json:"role"`
	IsActive             bool       `gorm:"column:is_active;default:true" json:"isActive"`
	IsVerified           bool       `gorm:"column:is_verified;default:false" json:"isVerified"`
	PasswordResetToken   *string    `gorm:"column:password_reset_token" json:"-"`
	PasswordResetExpires *time.Time `gorm:"column:password_reset_expires" json:"-"`
	GitHubID             *int64     `gorm:"column:github_id;uniqueIndex" json:"githubId"`
	GitHubUsername       *string    `gorm:"column:github_username;type:varchar(100)" json:"githubUsername"`
	AvatarURL            *string    `gorm:"column:avatar_url" json:"avatarUrl"`
	OnboardingCompleted  bool       `gorm:"column:onboarding_completed;default:false" json:"onboardingCompleted"`
	GitHubVerified       bool       `gorm:"column:github_verified;default:false" json:"githubVerified"`
	GitHubConnectedAt    *time.Time `gorm:"column:github_connected_at" json:"githubConnectedAt"`
	CreatedAt            time.Time  `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt            time.Time  `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (User) TableName() string { return "users" }

type Follow struct {
	FollowerID  uuid.UUID `gorm:"type:uuid;primaryKey" json:"followerId"`
	FollowingID uuid.UUID `gorm:"type:uuid;primaryKey" json:"followingId"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
}

func (Follow) TableName() string { return "follows" }
