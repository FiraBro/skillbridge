package handlers

import (
	"net/http"
	"time"

	"skillbridge/backend/internal/models"

	"github.com/gin-gonic/gin"
)

func (h *Handler) AdminDashboard(c *gin.Context) {
	var users gin.H = gin.H{}
	_ = h.DB.Raw(`SELECT COUNT(*) FILTER (WHERE role='developer') AS developers, COUNT(*) FILTER (WHERE role='company') AS companies FROM users`).Scan(&users).Error
	var result gin.H = gin.H{}
	result["users"] = users
	var posts, projects, jobs, reports int64
	_ = h.DB.Model(&models.Post{}).Count(&posts).Error
	_ = h.DB.Model(&models.Project{}).Count(&projects).Error
	_ = h.DB.Model(&models.Job{}).Where("is_published = true").Count(&jobs).Error
	_ = h.DB.Model(&models.ContentReport{}).Where("status IN ?", []string{"open", "pending"}).Count(&reports).Error
	result["posts"], result["projects"], result["jobs"], result["reports"] = posts, projects, jobs, reports
	c.JSON(http.StatusOK, result)
}

func (h *Handler) AdminUsers(c *gin.Context) {
	page, limit := positiveInt(c.Query("page"), 1), min(positiveInt(c.Query("limit"), 20), 100)
	query := h.DB.Table("users").Select(`id, name, email, role, is_active AS "isActive", created_at AS "createdAt"`)
	if role := c.Query("role"); role != "" {
		query = query.Where("role = ?", role)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("name ILIKE ?", "%"+search+"%")
	}
	var users []map[string]interface{}
	if err := query.Order("created_at DESC").Limit(limit).Offset((page - 1) * limit).Find(&users).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to fetch users")
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *Handler) ToggleSuspendUser(c *gin.Context) {
	var user models.User
	if err := h.DB.First(&user, "id = ?", c.Param("id")).Error; err != nil {
		fail(c, http.StatusNotFound, "User not found")
		return
	}
	user.IsActive = !user.IsActive
	if err := h.DB.Model(&user).Update("is_active", user.IsActive).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to update user status")
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": user.ID, "isActive": user.IsActive})
}

func (h *Handler) AdminReports(c *gin.Context) {
	page, limit := positiveInt(c.Query("page"), 1), min(positiveInt(c.Query("limit"), 20), 100)
	var reports []map[string]interface{}
	err := h.DB.Raw(`SELECT r.*, u.name AS "reporterName" FROM content_reports r LEFT JOIN users u ON u.id=r.reporter_id ORDER BY r.created_at DESC LIMIT ? OFFSET ?`, limit, (page-1)*limit).Scan(&reports).Error
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to fetch reports")
		return
	}
	c.JSON(http.StatusOK, reports)
}

func (h *Handler) ResolveReport(c *gin.Context) {
	result := h.DB.Model(&models.ContentReport{}).Where("id = ?", c.Param("id")).Updates(map[string]interface{}{"status": "resolved", "updated_at": time.Now()})
	if result.Error != nil || result.RowsAffected == 0 {
		fail(c, http.StatusNotFound, "Report not found")
		return
	}
	var report models.ContentReport
	_ = h.DB.First(&report, "id = ?", c.Param("id")).Error
	c.JSON(http.StatusOK, report)
}

func (h *Handler) AdminActivity(c *gin.Context) {
	page, limit := positiveInt(c.Query("page"), 1), min(positiveInt(c.Query("limit"), 20), 100)
	var rows []map[string]interface{}
	err := h.DB.Raw(`(SELECT 'post' AS type, id, title AS label, created_at AS "createdAt" FROM posts ORDER BY created_at DESC LIMIT ?) UNION ALL (SELECT 'project' AS type, id, title AS label, created_at AS "createdAt" FROM projects ORDER BY created_at DESC LIMIT ?) ORDER BY "createdAt" DESC LIMIT ? OFFSET ?`, limit, limit, limit, (page-1)*limit).Scan(&rows).Error
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to fetch activity")
		return
	}
	c.JSON(http.StatusOK, rows)
}

func (h *Handler) SystemHealth(c *gin.Context) {
	status := "connected"
	sqlDB, err := h.DB.DB()
	if err != nil || sqlDB.Ping() != nil {
		status = "down"
	}
	c.JSON(http.StatusOK, gin.H{"api": "healthy", "database": status, "timestamp": time.Now().UTC()})
}
