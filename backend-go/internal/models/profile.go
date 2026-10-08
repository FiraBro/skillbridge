package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Profile struct {
	ID              uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID          uuid.UUID      `gorm:"column:user_id;type:uuid;not null" json:"user_id"`
	Username        string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"username"`
	FullName        *string        `gorm:"column:full_name;type:varchar(120)" json:"full_name"`
	Bio             *string        `json:"bio"`
	Location        *string        `gorm:"type:varchar(120)" json:"location"`
	GitHubUsername  *string        `gorm:"column:github_username;type:varchar(100)" json:"github_username"`
	ReputationScore int            `gorm:"column:reputation_score;default:0" json:"reputation_score"`
	JoinedAt        time.Time      `gorm:"column:joined_at;autoCreateTime" json:"joined_at"`
	UpdatedAt       time.Time      `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	Skills          []Skill        `gorm:"many2many:profile_skills;joinForeignKey:profile_id;joinReferences:skill_id" json:"skills,omitempty"`
	GitHubStats     *GitHubStats   `gorm:"foreignKey:ProfileID" json:"github_stats,omitempty"`
	User            *User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (Profile) TableName() string { return "profiles" }

type Skill struct {
	ID   int    `gorm:"primaryKey" json:"id"`
	Name string `gorm:"type:varchar(50);uniqueIndex;not null" json:"name"`
}

func (Skill) TableName() string { return "skills" }

type ProfileSkill struct {
	ProfileID uuid.UUID `gorm:"type:uuid;primaryKey" json:"profile_id"`
	SkillID   int       `gorm:"primaryKey" json:"skill_id"`
}

func (ProfileSkill) TableName() string { return "profile_skills" }

type GitHubStats struct {
	ProfileID           uuid.UUID      `gorm:"type:uuid;primaryKey" json:"profile_id"`
	PublicRepos         *int           `gorm:"column:public_repos" json:"public_repos"`
	Followers           *int           `json:"followers"`
	TotalStars          *int           `gorm:"column:total_stars" json:"total_stars"`
	TotalCommits        *int           `gorm:"column:total_commits" json:"total_commits"`
	Commits30d          int            `gorm:"column:commits_30d;default:0" json:"commits_30d"`
	IsActive            bool           `gorm:"column:is_active;default:false" json:"is_active"`
	LastActivity        *time.Time     `gorm:"column:last_activity" json:"last_activity"`
	AccountCreated      *time.Time     `gorm:"column:account_created" json:"account_created"`
	LastSyncedAt        *time.Time     `gorm:"column:last_synced_at" json:"last_synced_at"`
	TopLanguages        json.RawMessage `gorm:"column:top_languages;type:jsonb" json:"top_languages"`
	ContributionStreak  *int            `gorm:"column:contribution_streak" json:"contribution_streak"`
	ConsistencyScore    *float64        `gorm:"column:consistency_score;type:decimal(3,2)" json:"consistency_score"`
	PinnedRepos         json.RawMessage `gorm:"column:pinned_repos;type:jsonb" json:"pinned_repos"`
	HiddenRepos         json.RawMessage `gorm:"column:hidden_repos;type:jsonb" json:"hidden_repos"`
	GitHubBio           *string         `gorm:"column:github_bio" json:"github_bio"`
	GitHubFollowing     *int            `gorm:"column:github_following" json:"github_following"`
	AccountAgeMonths    *int            `gorm:"column:account_age_months" json:"account_age_months"`
	WeeklyActivity      json.RawMessage `gorm:"column:weekly_activity;type:jsonb" json:"weekly_activity"`
	MostActiveDays      json.RawMessage `gorm:"column:most_active_days;type:jsonb" json:"most_active_days"`
	VerificationStatus  string         `gorm:"column:verification_status;type:varchar(20);default:verified" json:"verification_status"`
	LastSyncWithGitHub  *time.Time     `gorm:"column:last_sync_with_github" json:"last_sync_with_github"`
}

func (GitHubStats) TableName() string { return "github_stats" }

type GitHubRepository struct {
	ID                uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ProfileID         *uuid.UUID `gorm:"column:profile_id;type:uuid" json:"profile_id"`
	Name              string     `gorm:"type:varchar(255);not null" json:"name"`
	Description       *string    `json:"description"`
	Stars             int        `gorm:"default:0" json:"stars"`
	Forks             int        `gorm:"default:0" json:"forks"`
	Language          *string    `gorm:"type:varchar(100)" json:"language"`
	LastUpdated       *time.Time `gorm:"column:last_updated" json:"last_updated"`
	IsPinned          bool       `gorm:"column:is_pinned;default:false" json:"is_pinned"`
	IsHidden          bool       `gorm:"column:is_hidden;default:false" json:"is_hidden"`
	IsPublic          bool       `gorm:"column:is_public;default:true" json:"is_public"`
	CustomDescription *string    `gorm:"column:custom_description" json:"custom_description"`
	DemoURL           *string    `gorm:"column:demo_url;type:varchar(500)" json:"demo_url"`
	ReadmePreview     *string    `gorm:"column:readme_preview" json:"readme_preview"`
	CreatedAt         time.Time  `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time  `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

func (GitHubRepository) TableName() string { return "github_repositories" }
