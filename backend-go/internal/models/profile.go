package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Profile struct {
	ID              uuid.UUID    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID          uuid.UUID    `gorm:"column:user_id;type:uuid;not null" json:"userId"`
	Username        string       `gorm:"type:varchar(50);uniqueIndex;not null" json:"username"`
	FullName        *string      `gorm:"column:full_name;type:varchar(120)" json:"fullName"`
	Bio             *string      `json:"bio"`
	Location        *string      `gorm:"type:varchar(120)" json:"location"`
	GitHubUsername  *string      `gorm:"column:github_username;type:varchar(100)" json:"githubUsername"`
	ReputationScore int          `gorm:"column:reputation_score;default:0" json:"reputationScore"`
	JoinedAt        time.Time    `gorm:"column:joined_at;autoCreateTime" json:"joinedAt"`
	UpdatedAt       time.Time    `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	Skills          []Skill      `gorm:"many2many:profile_skills;joinForeignKey:profile_id;joinReferences:skill_id" json:"skills,omitempty"`
	GitHubStats     *GitHubStats `gorm:"foreignKey:ProfileID" json:"githubStats,omitempty"`
	User            *User        `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (Profile) TableName() string { return "profiles" }

type Skill struct {
	ID   int    `gorm:"primaryKey" json:"id"`
	Name string `gorm:"type:varchar(50);uniqueIndex;not null" json:"name"`
}

func (Skill) TableName() string { return "skills" }

type ProfileSkill struct {
	ProfileID uuid.UUID `gorm:"type:uuid;primaryKey" json:"profileId"`
	SkillID   int       `gorm:"primaryKey" json:"skillId"`
}

func (ProfileSkill) TableName() string { return "profile_skills" }

type GitHubStats struct {
	ProfileID          uuid.UUID       `gorm:"type:uuid;primaryKey" json:"profileId"`
	PublicRepos        *int            `gorm:"column:public_repos" json:"publicRepos"`
	Followers          *int            `json:"followers"`
	TotalStars         *int            `gorm:"column:total_stars" json:"totalStars"`
	TotalCommits       *int            `gorm:"column:total_commits" json:"totalCommits"`
	Commits30d         int             `gorm:"column:commits_30d;default:0" json:"commits30d"`
	IsActive           bool            `gorm:"column:is_active;default:false" json:"isActive"`
	LastActivity       *time.Time      `gorm:"column:last_activity" json:"lastActivity"`
	AccountCreated     *time.Time      `gorm:"column:account_created" json:"accountCreated"`
	LastSyncedAt       *time.Time      `gorm:"column:last_synced_at" json:"lastSyncedAt"`
	TopLanguages       json.RawMessage `gorm:"column:top_languages;type:jsonb" json:"topLanguages"`
	ContributionStreak *int            `gorm:"column:contribution_streak" json:"contributionStreak"`
	ConsistencyScore   *float64        `gorm:"column:consistency_score;type:decimal(3,2)" json:"consistencyScore"`
	PinnedRepos        json.RawMessage `gorm:"column:pinned_repos;type:jsonb" json:"pinnedRepos"`
	HiddenRepos        json.RawMessage `gorm:"column:hidden_repos;type:jsonb" json:"hiddenRepos"`
	GitHubBio          *string         `gorm:"column:github_bio" json:"githubBio"`
	GitHubFollowing    *int            `gorm:"column:github_following" json:"githubFollowing"`
	AccountAgeMonths   *int            `gorm:"column:account_age_months" json:"accountAgeMonths"`
	WeeklyActivity     json.RawMessage `gorm:"column:weekly_activity;type:jsonb" json:"weeklyActivity"`
	MostActiveDays     json.RawMessage `gorm:"column:most_active_days;type:jsonb" json:"mostActiveDays"`
	VerificationStatus string          `gorm:"column:verification_status;type:varchar(20);default:verified" json:"verificationStatus"`
	LastSyncWithGitHub *time.Time      `gorm:"column:last_sync_with_github" json:"lastSyncWithGitHub"`
}

func (GitHubStats) TableName() string { return "github_stats" }

type GitHubRepository struct {
	ID                uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ProfileID         *uuid.UUID `gorm:"column:profile_id;type:uuid" json:"profileId"`
	Name              string     `gorm:"type:varchar(255);not null" json:"name"`
	Description       *string    `json:"description"`
	Stars             int        `gorm:"default:0" json:"stars"`
	Forks             int        `gorm:"default:0" json:"forks"`
	Language          *string    `gorm:"type:varchar(100)" json:"language"`
	LastUpdated       *time.Time `gorm:"column:last_updated" json:"lastUpdated"`
	IsPinned          bool       `gorm:"column:is_pinned;default:false" json:"isPinned"`
	IsHidden          bool       `gorm:"column:is_hidden;default:false" json:"isHidden"`
	IsPublic          bool       `gorm:"column:is_public;default:true" json:"isPublic"`
	CustomDescription *string    `gorm:"column:custom_description" json:"customDescription"`
	DemoURL           *string    `gorm:"column:demo_url;type:varchar(500)" json:"demoUrl"`
	ReadmePreview     *string    `gorm:"column:readme_preview" json:"readmePreview"`
	CreatedAt         time.Time  `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt         time.Time  `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (GitHubRepository) TableName() string { return "github_repositories" }
