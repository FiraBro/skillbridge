package handlers

import (
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"skillbridge/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type projectInput struct {
	Title       string   `json:"title"`
	GitHubRepo  string   `json:"githubRepo"`
	LiveDemo    *string  `json:"liveDemo"`
	TechStack   []string `json:"techStack"`
	Description string   `json:"description"`
	Thumbnail   *string  `json:"thumbnail"`
}

func (h *Handler) ListProjects(c *gin.Context) {
	page := positiveInt(c.Query("page"), 1)
	limit := min(positiveInt(c.Query("limit"), 20), 50)
	query := h.DB.Model(&models.Project{}).Preload("User").Where("visibility = ?", "public")
	if tech := c.Query("tech"); tech != "" {
		query = query.Where("? = ANY(tech_stack)", tech)
	}
	var projects []models.Project
	if err := query.Order("created_at DESC").Limit(limit).Offset((page - 1) * limit).Find(&projects).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to list projects")
		return
	}
	c.JSON(http.StatusOK, projects)
}

func (h *Handler) GetProject(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		fail(c, http.StatusBadRequest, "Invalid project ID")
		return
	}
	var project models.Project
	if err := h.DB.Preload("User").First(&project, id).Error; err != nil {
		fail(c, http.StatusNotFound, "Not found")
		return
	}
	_ = h.DB.Model(&project).UpdateColumn("views", project.Views+1).Error
	project.Views++
	c.JSON(http.StatusOK, project)
}

func (h *Handler) CreateProject(c *gin.Context) {
	owner, ok := userID(c)
	if !ok {
		fail(c, http.StatusUnauthorized, "Authentication required")
		return
	}
	var input projectInput
	if !bindJSON(c, &input) {
		return
	}
	if !validProject(input) {
		fail(c, http.StatusBadRequest, "Invalid project fields")
		return
	}
	project := models.Project{UserID: owner, Title: input.Title, GitHubRepo: input.GitHubRepo, LiveDemo: input.LiveDemo, TechStack: input.TechStack, Description: input.Description, Thumbnail: input.Thumbnail, Visibility: "public"}
	if err := h.DB.Create(&project).Error; err != nil {
		fail(c, http.StatusConflict, "Duplicate GitHub repo or invalid project")
		return
	}
	c.JSON(http.StatusCreated, project)
}

func (h *Handler) UpdateProject(c *gin.Context) {
	owner, ok := userID(c)
	if !ok {
		fail(c, http.StatusUnauthorized, "Authentication required")
		return
	}
	var input projectInput
	if !bindJSON(c, &input) {
		return
	}
	if !validProject(input) {
		fail(c, http.StatusBadRequest, "Invalid project fields")
		return
	}
	var project models.Project
	if err := h.DB.Where("id = ? AND user_id = ?", c.Param("id"), owner).First(&project).Error; err != nil {
		fail(c, http.StatusNotFound, "Project not found")
		return
	}
	updates := map[string]interface{}{"title": input.Title, "live_demo": input.LiveDemo, "tech_stack": input.TechStack, "description": input.Description, "thumbnail": input.Thumbnail, "updated_at": h.DB.NowFunc()}
	if err := h.DB.Model(&project).Updates(updates).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to update project")
		return
	}
	_ = h.DB.First(&project, project.ID).Error
	c.JSON(http.StatusOK, project)
}

func (h *Handler) DeleteProject(c *gin.Context) {
	owner, ok := userID(c)
	if !ok {
		fail(c, http.StatusUnauthorized, "Authentication required")
		return
	}
	result := h.DB.Where("id = ? AND user_id = ?", c.Param("id"), owner).Delete(&models.Project{})
	if result.Error != nil {
		fail(c, http.StatusInternalServerError, "Unable to delete project")
		return
	}
	if result.RowsAffected == 0 {
		fail(c, http.StatusNotFound, "Project not found")
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Project deleted"})
}

func validProject(input projectInput) bool {
	if len(strings.TrimSpace(input.Title)) < 3 || len(input.Title) > 100 || len(strings.TrimSpace(input.Description)) < 10 || len(input.TechStack) == 0 {
		return false
	}
	if _, err := url.ParseRequestURI(input.GitHubRepo); err != nil || !strings.HasPrefix(input.GitHubRepo, "http") {
		return false
	}
	return true
}

func positiveInt(value string, fallback int) int {
	n, err := strconv.Atoi(value)
	if err != nil || n < 1 {
		return fallback
	}
	return n
}

var _ = uuid.Nil
