package models

import (
	"time"

	"github.com/google/uuid"
)

type Post struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	AuthorID      *uuid.UUID `gorm:"column:author_id;type:uuid" json:"authorId"`
	Title         string     `gorm:"type:text;not null" json:"title"`
	Slug          string     `gorm:"type:text;uniqueIndex;not null" json:"slug"`
	Markdown      string     `gorm:"type:text;not null" json:"markdown"`
	SanitizedHTML string     `gorm:"column:sanitized_html;type:text;not null" json:"sanitizedHtml"`
	CoverImage    *string    `gorm:"column:cover_image" json:"coverImage"`
	Views         int        `gorm:"default:0" json:"views"`
	SharesCount   int        `gorm:"column:shares_count;default:0" json:"sharesCount"`
	LikeCount     int        `gorm:"column:like_count;default:0" json:"likeCount"`
	CreatedAt     time.Time  `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt     time.Time  `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	Tags          []Tag      `gorm:"many2many:post_tags;joinForeignKey:post_id;joinReferences:tag_id" json:"tags,omitempty"`
	Author        *User      `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
}

func (Post) TableName() string { return "posts" }

type Tag struct {
	ID   int    `gorm:"primaryKey" json:"id"`
	Name string `gorm:"type:text;uniqueIndex;not null" json:"name"`
}

func (Tag) TableName() string { return "tags" }

type PostTag struct {
	PostID uuid.UUID `gorm:"type:uuid;primaryKey" json:"postId"`
	TagID  int       `gorm:"primaryKey" json:"tagId"`
}

func (PostTag) TableName() string { return "post_tags" }

type PostLike struct {
	ID     int       `gorm:"primaryKey" json:"id"`
	PostID uuid.UUID `gorm:"column:post_id;type:uuid;uniqueIndex:idx_post_like" json:"postId"`
	UserID uuid.UUID `gorm:"column:user_id;type:uuid;uniqueIndex:idx_post_like" json:"userId"`
}

func (PostLike) TableName() string { return "post_likes" }

type PostComment struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	PostID    uuid.UUID `gorm:"column:post_id;type:uuid" json:"postId"`
	UserID    uuid.UUID `gorm:"column:user_id;type:uuid" json:"userId"`
	Text      string    `gorm:"column:content;type:text;not null" json:"text"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	User      *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (PostComment) TableName() string { return "post_comments" }
