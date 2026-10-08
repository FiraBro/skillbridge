package handlers

import (
	"net/http"

	"skillbridge/backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (h *Handler) CreateProfile(c *gin.Context) {
	id, ok := userID(c)
	if !ok {
		fail(c, http.StatusUnauthorized, "Authentication required")
		return
	}
	var input struct {
		Username       string  `json:"username"`
		FullName       *string `json:"fullName"`
		Bio            *string `json:"bio"`
		Location       *string `json:"location"`
		GitHubUsername *string `json:"githubUsername"`
	}
	if !bindJSON(c, &input) {
		return
	}
	if input.Username == "" {
		fail(c, http.StatusBadRequest, "Username is required")
		return
	}
	profile := models.Profile{UserID: id, Username: input.Username, FullName: input.FullName, Bio: input.Bio, Location: input.Location, GitHubUsername: input.GitHubUsername}
	if err := h.DB.Create(&profile).Error; err != nil {
		fail(c, http.StatusConflict, "Unable to create profile")
		return
	}
	c.JSON(http.StatusCreated, profile)
}

func (h *Handler) GetProfile(c *gin.Context) {
	var profile map[string]interface{}
	err := h.DB.Raw(`SELECT p.id, p.user_id AS "userId", p.username, p.full_name AS "fullName", p.bio, p.location,
		COALESCE(p.github_username, gs.github_username, u.github_username) AS "githubUsername",
		p.reputation_score AS "reputationScore", p.joined_at AS "joinedAt", p.updated_at AS "updatedAt",
		COALESCE((SELECT json_agg(s.name) FROM profile_skills ps JOIN skills s ON s.id = ps.skill_id WHERE ps.profile_id = p.id), '[]'::json) AS skills,
		gs.public_repos AS "publicRepos", gs.followers, gs.total_stars AS "totalStars", gs.total_commits AS "totalCommits",
		gs.commits_30d AS "commits30d", gs.is_active AS "isActive", gs.last_activity AS "lastActivity", gs.account_created AS "accountCreated", gs.last_synced_at AS "lastSyncedAt"
		FROM profiles p LEFT JOIN users u ON u.id = p.user_id LEFT JOIN github_stats gs ON gs.profile_id = p.id
		WHERE LOWER(TRIM(p.username)) = LOWER(TRIM(?)) AND p.deleted_at IS NULL LIMIT 1`, c.Param("username")).Scan(&profile).Error
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to fetch profile")
		return
	}
	if len(profile) == 0 {
		fail(c, http.StatusNotFound, "Profile not found")
		return
	}
	var profileID interface{} = profile["id"]
	var views int64
	_ = h.DB.Model(&models.ProfileView{}).Where("profile_id = ?", profileID).Count(&views).Error
	profile["views"] = views
	c.JSON(http.StatusOK, profile)
}

func (h *Handler) SyncProfile(c *gin.Context) {
	owner, ok := userID(c)
	if !ok {
		fail(c, http.StatusUnauthorized, "Authentication required")
		return
	}
	var input struct {
		Username string `json:"username"`
	}
	if !bindJSON(c, &input) {
		return
	}
	if input.Username == "" {
		fail(c, http.StatusBadRequest, "Username is required")
		return
	}
	var profile models.Profile
	if err := h.DB.Where("username = ?", input.Username).First(&profile).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			fail(c, http.StatusNotFound, "Profile not found")
			return
		}
		fail(c, http.StatusInternalServerError, "Unable to load profile")
		return
	}
	if profile.UserID != owner {
		fail(c, http.StatusForbidden, "You can only sync your own profile")
		return
	}
	if profile.GitHubUsername == nil || *profile.GitHubUsername == "" {
		fail(c, http.StatusBadRequest, "GitHub username is not connected")
		return
	}
	h.SyncGitHub(c)
}
