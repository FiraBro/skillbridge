package handlers

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"skillbridge/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type postInput struct {
	Title      string   `json:"title"`
	Markdown   string   `json:"markdown"`
	Tags       []string `json:"tags"`
	CoverImage *string  `json:"coverImage"`
}

func (h *Handler) ListPosts(c *gin.Context) {
	page := positiveInt(c.Query("page"), 1)
	limit := min(positiveInt(c.Query("limit"), 10), 100)
	args := []interface{}{}
	isLiked, isFollowing := "FALSE", "FALSE"
	if id, ok := userID(c); ok {
		isLiked = "EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id=p.id AND pl.user_id=?)"
		isFollowing = "EXISTS(SELECT 1 FROM follows f WHERE f.follower_id=? AND f.following_id=p.author_id)"
		args = append(args, id, id)
	}
	query := fmt.Sprintf(`SELECT p.id, p.author_id AS "authorId", u.name AS "authorName", pr.username AS "authorUsername", p.title, p.slug, p.markdown, p.cover_image AS "coverImage", p.views, p.shares_count AS "sharesCount", p.created_at AS "createdAt", COALESCE((SELECT json_agg(t.name) FROM post_tags pt JOIN tags t ON t.id=pt.tag_id WHERE pt.post_id=p.id), '[]'::json) AS tags, (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id=p.id) AS "likesCount", (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id=p.id AND pc.deleted_at IS NULL) AS "commentsCount", %s AS "isLiked", %s AS "isFollowingAuthor" FROM posts p LEFT JOIN users u ON u.id=p.author_id LEFT JOIN profiles pr ON pr.user_id=u.id WHERE p.deleted_at IS NULL`, isLiked, isFollowing)
	if tag := c.Query("tag"); tag != "" {
		query += ` AND EXISTS (SELECT 1 FROM post_tags pt JOIN tags t ON t.id=pt.tag_id WHERE pt.post_id=p.id AND t.name=?)`
		args = append(args, tag)
	}
	if authorID := c.Query("authorId"); authorID != "" {
		query += ` AND p.author_id=?`
		args = append(args, authorID)
	}
	args = append(args, limit, (page-1)*limit)
	query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
	var posts []map[string]interface{}
	if err := h.DB.Raw(query, args...).Scan(&posts).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to list posts")
		return
	}
	c.JSON(http.StatusOK, posts)
}

func (h *Handler) GetPost(c *gin.Context) {
	var post map[string]interface{}
	query := `SELECT p.id, p.author_id AS "authorId", u.name AS "authorName", pr.username AS "authorUsername", p.title, p.slug, p.markdown, p.sanitized_html AS "sanitizedHtml", p.cover_image AS "coverImage", p.views, p.shares_count AS "sharesCount", p.created_at AS "createdAt", p.updated_at AS "updatedAt", COALESCE((SELECT json_agg(t.name) FROM post_tags pt JOIN tags t ON t.id=pt.tag_id WHERE pt.post_id=p.id), '[]'::json) AS tags, (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id=p.id) AS "likesCount", (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id=p.id AND pc.deleted_at IS NULL) AS "commentsCount"`
	args := []interface{}{}
	if id, ok := userID(c); ok {
		query += `, EXISTS(SELECT 1 FROM post_likes WHERE post_id=p.id AND user_id=?) AS "isLiked"`
		args = append(args, id)
	}
	query += ` FROM posts p LEFT JOIN users u ON u.id=p.author_id LEFT JOIN profiles pr ON pr.user_id=u.id WHERE p.slug=? AND p.deleted_at IS NULL`
	args = append(args, c.Param("id"))
	err := h.DB.Raw(query, args...).Scan(&post).Error
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to fetch post")
		return
	}
	if len(post) == 0 {
		fail(c, http.StatusNotFound, "Post not found")
		return
	}
	postID := post["id"]
	var comments []map[string]interface{}
	_ = h.DB.Raw(`SELECT c.id, c.post_id AS "postId", c.user_id AS "userId", c.content AS text, c.created_at AS "createdAt", COALESCE(pr.username, 'Deleted User') AS username FROM post_comments c LEFT JOIN profiles pr ON pr.user_id=c.user_id WHERE c.post_id=? AND c.deleted_at IS NULL ORDER BY c.created_at`, postID).Scan(&comments).Error
	post["comments"] = comments
	c.JSON(http.StatusOK, post)
}

func (h *Handler) CreatePost(c *gin.Context) {
	author, _ := userID(c)
	var input postInput
	var coverImage *string
	if strings.HasPrefix(c.ContentType(), "multipart/form-data") {
		if err := c.Request.ParseMultipartForm(5 << 20); err != nil {
			fail(c, http.StatusBadRequest, "Invalid multipart request")
			return
		}
		input.Title = c.PostForm("title")
		input.Markdown = c.PostForm("markdown")
		if tags := c.PostForm("tags"); tags != "" {
			_ = json.Unmarshal([]byte(tags), &input.Tags)
		}
		if file, err := c.FormFile("cover_image"); err == nil {
			coverImage, err = saveCoverImage(c, file)
			if err != nil {
				fail(c, http.StatusBadRequest, err.Error())
				return
			}
		}
	} else {
		if !bindJSON(c, &input) {
			return
		}
		coverImage = input.CoverImage
	}
	if len(strings.TrimSpace(input.Title)) < 5 || len(strings.TrimSpace(input.Markdown)) < 10 || len(input.Tags) > 5 {
		fail(c, http.StatusBadRequest, "Invalid post fields")
		return
	}
	base := slugify(input.Title)
	slug := base + "-" + uuid.NewString()[:8]
	post := models.Post{AuthorID: &author, Title: input.Title, Slug: slug, Markdown: input.Markdown, SanitizedHTML: template.HTMLEscapeString(input.Markdown), CoverImage: coverImage}
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&post).Error; err != nil {
			return err
		}
		return savePostTags(tx, post.ID, input.Tags)
	})
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to create post")
		return
	}
	c.JSON(http.StatusCreated, post)
}

func saveCoverImage(c *gin.Context, file *multipart.FileHeader) (*string, error) {
	if file.Size > 5<<20 {
		return nil, fmt.Errorf("Image must be 5 MB or smaller")
	}
	extension := strings.ToLower(filepath.Ext(file.Filename))
	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true}
	if !allowed[extension] {
		return nil, fmt.Errorf("Only JPEG, PNG, GIF, and WebP images are allowed")
	}
	source, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("Unable to read cover image")
	}
	defer source.Close()
	header := make([]byte, 512)
	read, err := source.Read(header)
	if err != nil && err != io.EOF {
		return nil, fmt.Errorf("Unable to read cover image")
	}
	contentType := http.DetectContentType(header[:read])
	if !strings.HasPrefix(contentType, "image/") || contentType == "image/svg+xml" {
		return nil, fmt.Errorf("Only raster images are allowed")
	}
	if _, err := source.Seek(0, io.SeekStart); err != nil {
		return nil, fmt.Errorf("Unable to read cover image")
	}
	if err := os.MkdirAll("uploads", 0755); err != nil {
		return nil, fmt.Errorf("Unable to save cover image")
	}
	name := uuid.NewString() + extension
	path := filepath.Join("uploads", name)
	destination, err := os.Create(path)
	if err != nil {
		return nil, fmt.Errorf("Unable to save cover image")
	}
	if _, err := io.Copy(destination, source); err != nil {
		_ = destination.Close()
		_ = os.Remove(path)
		return nil, fmt.Errorf("Unable to save cover image")
	}
	if err := destination.Close(); err != nil {
		return nil, fmt.Errorf("Unable to save cover image")
	}
	publicPath := "/uploads/" + name
	return &publicPath, nil
}

func (h *Handler) UpdatePost(c *gin.Context) {
	owner, _ := userID(c)
	var input postInput
	if !bindJSON(c, &input) {
		return
	}
	var post models.Post
	if err := h.DB.First(&post, "id = ? AND deleted_at IS NULL", c.Param("id")).Error; err != nil {
		fail(c, http.StatusNotFound, "Post not found")
		return
	}
	role, _ := c.Get("role")
	if post.AuthorID == nil || *post.AuthorID != owner && role != "admin" {
		fail(c, http.StatusForbidden, "Unauthorized")
		return
	}
	updates := map[string]interface{}{}
	if input.Title != "" {
		updates["title"] = input.Title
	}
	if input.Markdown != "" {
		updates["markdown"] = input.Markdown
		updates["sanitized_html"] = template.HTMLEscapeString(input.Markdown)
	}
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if len(updates) > 0 {
			if err := tx.Model(&post).Updates(updates).Error; err != nil {
				return err
			}
		}
		if input.Tags != nil {
			if err := tx.Where("post_id = ?", post.ID).Delete(&models.PostTag{}).Error; err != nil {
				return err
			}
			return savePostTags(tx, post.ID, input.Tags)
		}
		return nil
	})
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to update post")
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Post updated"})
}

func (h *Handler) DeletePost(c *gin.Context) {
	owner, _ := userID(c)
	var post models.Post
	if err := h.DB.First(&post, "id = ? AND deleted_at IS NULL", c.Param("id")).Error; err != nil {
		fail(c, http.StatusNotFound, "Post not found")
		return
	}
	role, _ := c.Get("role")
	if post.AuthorID == nil || *post.AuthorID != owner && role != "admin" {
		fail(c, http.StatusForbidden, "Unauthorized")
		return
	}
	if err := h.DB.Model(&post).Update("deleted_at", h.DB.NowFunc()).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to delete post")
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Post deleted"})
}

func (h *Handler) SharePost(c *gin.Context) {
	result := h.DB.Model(&models.Post{}).Where("id = ? AND deleted_at IS NULL", c.Param("id")).UpdateColumn("shares_count", gorm.Expr("shares_count + 1"))
	if result.Error != nil || result.RowsAffected == 0 {
		fail(c, http.StatusNotFound, "Post not found")
		return
	}
	var post models.Post
	_ = h.DB.Select("shares_count").First(&post, "id = ?", c.Param("id")).Error
	c.JSON(http.StatusOK, gin.H{"sharesCount": post.SharesCount})
}

func (h *Handler) LikePost(c *gin.Context)   { h.setLike(c, true) }
func (h *Handler) UnlikePost(c *gin.Context) { h.setLike(c, false) }

func (h *Handler) setLike(c *gin.Context, like bool) {
	owner, _ := userID(c)
	postID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		fail(c, http.StatusBadRequest, "Invalid post ID")
		return
	}
	if like {
		_ = h.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.PostLike{PostID: postID, UserID: owner}).Error
	} else {
		_ = h.DB.Where("post_id = ? AND user_id = ?", postID, owner).Delete(&models.PostLike{}).Error
	}
	var count int64
	_ = h.DB.Model(&models.PostLike{}).Where("post_id = ?", postID).Count(&count).Error
	c.JSON(http.StatusOK, gin.H{"likesCount": count})
}

func (h *Handler) AddComment(c *gin.Context) {
	owner, _ := userID(c)
	var input struct {
		Text string `json:"text"`
	}
	if !bindJSON(c, &input) {
		return
	}
	if strings.TrimSpace(input.Text) == "" {
		fail(c, http.StatusBadRequest, "Comment text is required")
		return
	}
	var comment map[string]interface{}
	err := h.DB.Raw(`INSERT INTO post_comments(post_id,user_id,content) VALUES(?,?,?) RETURNING id, post_id AS "postId", user_id AS "userId", content AS text, created_at AS "createdAt"`, c.Param("id"), owner, input.Text).Scan(&comment).Error
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to add comment")
		return
	}
	c.JSON(http.StatusCreated, comment)
}

func (h *Handler) GetComments(c *gin.Context) {
	page, limit := positiveInt(c.Query("page"), 1), min(positiveInt(c.Query("limit"), 20), 100)
	var comments []map[string]interface{}
	err := h.DB.Raw(`SELECT c.id, c.post_id AS "postId", c.user_id AS "userId", c.content AS text, c.created_at AS "createdAt", COALESCE(u.name,'Deleted User') AS username FROM post_comments c LEFT JOIN users u ON u.id=c.user_id WHERE c.post_id=? AND c.deleted_at IS NULL ORDER BY c.created_at ASC LIMIT ? OFFSET ?`, c.Param("id"), limit, (page-1)*limit).Scan(&comments).Error
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to fetch comments")
		return
	}
	c.JSON(http.StatusOK, comments)
}

func (h *Handler) DeleteComment(c *gin.Context) {
	owner, _ := userID(c)
	role, _ := c.Get("role")
	var comment models.PostComment
	if err := h.DB.First(&comment, "id = ? AND deleted_at IS NULL", c.Param("commentId")).Error; err != nil {
		fail(c, http.StatusNotFound, "Comment not found")
		return
	}
	var post models.Post
	_ = h.DB.Select("author_id").First(&post, "id = ?", comment.PostID).Error
	if comment.UserID != owner && (post.AuthorID == nil || *post.AuthorID != owner) && role != "admin" {
		fail(c, http.StatusForbidden, "You are not authorized to delete this comment")
		return
	}
	if err := h.DB.Exec("UPDATE post_comments SET deleted_at=NOW() WHERE id=?", comment.ID).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to delete comment")
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted"})
}

func (h *Handler) ToggleFollowAuthor(c *gin.Context) {
	owner, _ := userID(c)
	followingID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		fail(c, http.StatusBadRequest, "Invalid user ID")
		return
	}
	var user models.User
	if err := h.DB.Select("id").First(&user, "id = ?", followingID).Error; err != nil {
		fail(c, http.StatusNotFound, "User not found")
		return
	}
	if followingID == owner {
		fail(c, http.StatusBadRequest, "You cannot follow yourself")
		return
	}
	var existing models.Follow
	err = h.DB.Where("follower_id = ? AND following_id = ?", owner, followingID).First(&existing).Error
	following := err != nil
	if following {
		err = h.DB.Create(&models.Follow{FollowerID: owner, FollowingID: followingID}).Error
	} else {
		err = h.DB.Delete(&existing).Error
	}
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to update follow")
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "isFollowingAuthor": following, "authorId": followingID})
}

func savePostTags(tx *gorm.DB, postID uuid.UUID, names []string) error {
	for _, name := range names {
		name = strings.TrimSpace(name)
		if name == "" {
			continue
		}
		var tag models.Tag
		if err := tx.Where("name = ?", name).FirstOrCreate(&tag, models.Tag{Name: name}).Error; err != nil {
			return err
		}
		if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.PostTag{PostID: postID, TagID: tag.ID}).Error; err != nil {
			return err
		}
	}
	return nil
}

var slugPattern = regexp.MustCompile(`[^a-z0-9]+`)

func slugify(value string) string {
	return strings.Trim(slugPattern.ReplaceAllString(strings.ToLower(value), "-"), "-")
}
