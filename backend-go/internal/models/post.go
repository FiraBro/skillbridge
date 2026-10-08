package models

import (
	"time"

	"github.com/google/uuid"
)

type Post struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	AuthorID      *uuid.UUID `gorm:"column:author_id;type:uuid" json:"author_id"`
	Title         string    `gorm:"type:text;not null" json:"title"`
	Slug          string    `gorm:"type:text;uniqueIndex;not null" json:"slug"`
	Markdown      string    `gorm:"type:text;not null" json:"markdown"`
	SanitizedHTML string    `gorm:"column:sanitized_html;type:text;not null" json:"sanitized_html"`
	Views         int       `gorm:"default:0" json:"views"`
	SharesCount   int       `gorm:"column:shares_count;default:0" json:"shares_count"`
	LikeCount     int       `gorm:"column:like_count;default:0" json:"like_count"`
	CreatedAt     time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	Tags          []Tag     `gorm:"many2many:post_tags;joinForeignKey:post_id;joinReferences:tag_id" json:"tags,omitempty"`
	Author        *User     `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
}

func (Post) TableName() string { return "posts" }

type Tag struct {
	ID   int    `gorm:"primaryKey" json:"id"`
	Name string `gorm:"type:text;uniqueIndex;not null" json:"name"`
}

func (Tag) TableName() string { return "tags" }

type PostTag struct {
	PostID uuid.UUID `gorm:"type:uuid;primaryKey" json:"post_id"`
	TagID  int       `gorm:"primaryKey" json:"tag_id"`
}

func (PostTag) TableName() string { return "post_tags" }

type PostLike struct {
	ID     int       `gorm:"primaryKey" json:"id"`
	PostID uuid.UUID `gorm:"column:post_id;type:uuid;uniqueIndex:idx_post_like" json:"post_id"`
	UserID uuid.UUID `gorm:"column:user_id;type:uuid;uniqueIndex:idx_post_like" json:"user_id"`
}

func (PostLike) TableName() string { return "post_likes" }

type PostComment struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	PostID    uuid.UUID `gorm:"column:post_id;type:uuid" json:"post_id"`
	UserID    uuid.UUID `gorm:"column:user_id;type:uuid" json:"user_id"`
	Text      string    `gorm:"type:text;not null" json:"text"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	User      *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (PostComment) TableName() string { return "post_comments" }
