package handlers

import (
	"net/http"

	"skillbridge/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm/clause"
)

func (h *Handler) DiscoverDevelopers(c *gin.Context) {
	page, limit := positiveInt(c.Query("page"), 1), min(positiveInt(c.Query("limit"), 9), 50)
	query := `SELECT u.id, u.name, u.username, u.avatar_url AS "avatarUrl", u.role, p.id AS "profileId", p.reputation_score AS "reputationScore", p.bio, COALESCE((SELECT json_agg(s.name) FROM profile_skills ps JOIN skills s ON s.id=ps.skill_id WHERE ps.profile_id=p.id),'[]'::json) AS skills FROM profiles p JOIN users u ON u.id=p.user_id WHERE u.role='developer'`
	args := []interface{}{}
	if term := c.Query("search"); term != "" {
		args = append(args, "%"+term+"%")
		query += ` AND (u.name ILIKE ? OR u.username ILIKE ? OR p.bio ILIKE ?)`
		args = append(args, args[len(args)-1], args[len(args)-1])
	}
	if reputation := intQuery(c.Query("minReputation"), 0); reputation > 0 {
		query += ` AND p.reputation_score >= ?`
		args = append(args, reputation)
	}
	if skills := splitCSV(c.Query("skills")); len(skills) > 0 {
		query += ` AND EXISTS (SELECT 1 FROM profile_skills ps JOIN skills s ON s.id=ps.skill_id WHERE ps.profile_id=p.id AND s.name IN ?)`
		args = append(args, skills)
	}
	var total int64
	countQuery := "SELECT COUNT(*) FROM profiles p JOIN users u ON u.id=p.user_id WHERE u.role='developer'"
	_ = h.DB.Raw(countQuery).Scan(&total).Error
	query += ` ORDER BY p.reputation_score DESC LIMIT ? OFFSET ?`
	args = append(args, limit, (page-1)*limit)
	var rows []map[string]interface{}
	if err := h.DB.Raw(query, args...).Scan(&rows).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to discover developers")
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Success", "data": gin.H{"data": rows, "page": page, "total": total, "totalPages": (total + int64(limit) - 1) / int64(limit)}})
}

func (h *Handler) GetCompanyProfile(c *gin.Context) {
	id, _ := userID(c)
	var profile models.CompanyProfile
	if err := h.DB.Where("user_id = ?", id).First(&profile).Error; err != nil {
		fail(c, http.StatusNotFound, "Company profile not found")
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Success", "data": profile})
}

func (h *Handler) UpdateCompanyProfile(c *gin.Context) {
	id, _ := userID(c)
	var input struct {
		Name        string  `json:"name"`
		LogoURL     *string `json:"logoUrl"`
		Description *string `json:"description"`
		Industry    *string `json:"industry"`
		Size        *string `json:"size"`
		Website     *string `json:"website"`
	}
	if !bindJSON(c, &input) {
		return
	}
	if input.Name == "" {
		fail(c, http.StatusBadRequest, "Company name is required")
		return
	}
	profile := models.CompanyProfile{UserID: id, Name: input.Name, LogoURL: input.LogoURL, Description: input.Description, Industry: input.Industry, Size: input.Size, Website: input.Website}
	if err := h.DB.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "user_id"}}, DoUpdates: clause.AssignmentColumns([]string{"name", "logo_url", "description", "industry", "size", "website", "updated_at"})}).Create(&profile).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to update company profile")
		return
	}
	httpxCompany(c, http.StatusOK, profile, "Profile updated successfully")
}

func (h *Handler) GetBookmarks(c *gin.Context) {
	id, _ := userID(c)
	companyID := id
	var rows []map[string]interface{}
	err := h.DB.Raw(`SELECT u.id, u.name, u.avatar_url AS "avatarUrl", p.id AS "profileId", p.reputation_score AS "reputationScore" FROM developer_bookmarks b JOIN users u ON u.id=b.developer_id JOIN profiles p ON p.user_id=u.id WHERE b.company_id=?`, companyID).Scan(&rows).Error
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to load bookmarks")
		return
	}
	httpxCompany(c, http.StatusOK, rows, "Success")
}

func (h *Handler) BookmarkDeveloper(c *gin.Context) {
	id, _ := userID(c)
	companyID := id
	developerID, err := uuid.Parse(c.Param("devId"))
	if err != nil {
		fail(c, http.StatusBadRequest, "Invalid developer ID")
		return
	}
	bookmark := models.DeveloperBookmark{CompanyID: companyID, DeveloperID: developerID}
	if err := h.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&bookmark).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to bookmark developer")
		return
	}
	httpxCompany(c, http.StatusCreated, bookmark, "Developer bookmarked")
}

func (h *Handler) RemoveBookmark(c *gin.Context) {
	id, _ := userID(c)
	companyID := id
	result := h.DB.Where("company_id = ? AND developer_id = ?", companyID, c.Param("devId")).Delete(&models.DeveloperBookmark{})
	if result.Error != nil {
		fail(c, http.StatusInternalServerError, "Unable to remove bookmark")
		return
	}
	httpxCompany(c, http.StatusOK, nil, "Bookmark removed")
}

func (h *Handler) UpdateCompanyApplication(c *gin.Context) {
	c.Params = append(c.Params, gin.Param{Key: "applicationId", Value: c.Param("appId")})
	h.UpdateApplicationFeedback(c)
}

func (h *Handler) companyProfileID(user uuid.UUID) (uuid.UUID, error) {
	var profile models.CompanyProfile
	err := h.DB.Select("id").Where("user_id = ?", user).First(&profile).Error
	return profile.ID, err
}

func httpxCompany(c *gin.Context, status int, data interface{}, message string) {
	c.JSON(status, gin.H{"success": true, "message": message, "data": data})
}
