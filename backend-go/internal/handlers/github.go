package handlers

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"skillbridge/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func (h *Handler) RedirectToGitHub(c *gin.Context) {
	if h.Cfg.GitHubClientID == "" {
		fail(c, http.StatusServiceUnavailable, "GitHub OAuth is not configured")
		return
	}
	id, _ := userID(c)
	username, _ := c.Get("username")
	stateJSON, _ := json.Marshal(gin.H{"userId": id.String(), "username": username})
	query := url.Values{"client_id": {h.Cfg.GitHubClientID}, "scope": {"read:user repo"}, "state": {base64.RawURLEncoding.EncodeToString(stateJSON)}, "redirect_uri": {h.Cfg.GitHubCallbackURL}}
	c.Redirect(http.StatusFound, "https://github.com/login/oauth/authorize?"+query.Encode())
}

func (h *Handler) GitHubCallback(c *gin.Context) {
	stateBytes, err := base64.RawURLEncoding.DecodeString(c.Query("state"))
	if err != nil {
		stateBytes, err = base64.StdEncoding.DecodeString(c.Query("state"))
	}
	var state struct {
		UserID   string `json:"userId"`
		Username string `json:"username"`
	}
	if err != nil || json.Unmarshal(stateBytes, &state) != nil || state.UserID == "" || c.Query("code") == "" {
		c.Redirect(http.StatusFound, strings.TrimRight(h.Cfg.FrontendURL, "/")+"/profile?error=invalid_state")
		return
	}
	if err := h.connectGitHub(c, state.UserID, c.Query("code")); err != nil {
		c.Redirect(http.StatusFound, strings.TrimRight(h.Cfg.FrontendURL, "/")+"/profile?error=github_connection_failed")
		return
	}
	var profile models.Profile
	_ = h.DB.Select("username").Where("user_id = ?", state.UserID).First(&profile).Error
	username := state.Username
	if profile.Username != "" {
		username = profile.Username
	}
	destination := "/profile"
	if username != "" {
		destination += "/" + url.PathEscape(username)
	}
	c.Redirect(http.StatusFound, strings.TrimRight(h.Cfg.FrontendURL, "/")+destination+"?success=github_connected")
}

func (h *Handler) GetGitHubProfile(c *gin.Context) {
	var profile map[string]interface{}
	err := h.DB.Raw(`SELECT u.id AS "userId", p.id AS "profileId", p.username, p.full_name AS "fullName", p.bio, p.location FROM users u JOIN profiles p ON p.user_id=u.id WHERE p.username=? LIMIT 1`, c.Param("username")).Scan(&profile).Error
	if err != nil || len(profile) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	user := profile["userId"]
	var stats map[string]interface{}
	err = h.DB.Raw(`SELECT github_username AS username, github_bio AS bio, followers, github_following AS following, public_repos AS "publicRepos", total_stars AS "totalStars", total_commits AS "totalCommits", commits_30d AS "commits30d", contribution_streak AS "contributionStreak", account_age_months AS "accountAgeMonths", top_languages AS "topLanguages", weekly_activity AS "weeklyActivity", most_active_days AS "mostActiveDays", is_active AS "isActive", verification_status AS "verificationStatus" FROM github_stats WHERE profile_id=(SELECT id FROM profiles WHERE user_id=?)`, user).Scan(&stats).Error
	if err != nil || len(stats) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "GitHub profile not connected"})
		return
	}
	var repos []map[string]interface{}
	_ = h.DB.Raw(`SELECT name, description, stars, forks, language, last_updated AS "lastUpdated", is_pinned AS "isPinned", is_hidden AS "isHidden", is_public AS "isPublic", custom_description AS "customDescription", demo_url AS "demoUrl", readme_preview AS "readmePreview" FROM github_repositories WHERE profile_id=(SELECT id FROM profiles WHERE user_id=?) AND is_hidden=false ORDER BY is_pinned DESC, stars DESC`, user).Scan(&repos).Error
	stats["repositories"] = repos
	c.JSON(http.StatusOK, gin.H{"profile": profile, "github": stats})
}

func (h *Handler) SyncGitHub(c *gin.Context) {
	owner, _ := userID(c)
	var profile models.Profile
	if err := h.DB.Where("user_id = ?", owner).First(&profile).Error; err != nil || profile.GitHubUsername == nil || *profile.GitHubUsername == "" {
		fail(c, http.StatusBadRequest, "GitHub account is not connected")
		return
	}
	var account struct {
		Login       string  `json:"login"`
		Bio         *string `json:"bio"`
		Followers   int     `json:"followers"`
		Following   int     `json:"following"`
		PublicRepos int     `json:"public_repos"`
		CreatedAt   string  `json:"created_at"`
	}
	if err := h.githubGET(c, "/users/"+url.PathEscape(*profile.GitHubUsername), &account); err != nil {
		fail(c, http.StatusBadGateway, "Unable to fetch GitHub profile")
		return
	}
	var repositories []struct {
		Name        string     `json:"name"`
		Description *string    `json:"description"`
		Stars       int        `json:"stargazers_count"`
		Forks       int        `json:"forks_count"`
		Language    *string    `json:"language"`
		UpdatedAt   *time.Time `json:"updated_at"`
		PushedAt    *time.Time `json:"pushed_at"`
		Private     bool       `json:"private"`
		Fork        bool       `json:"fork"`
	}
	if err := h.githubGET(c, "/users/"+url.PathEscape(*profile.GitHubUsername)+"/repos?per_page=100&sort=updated", &repositories); err != nil {
		fail(c, http.StatusBadGateway, "Unable to fetch GitHub repositories")
		return
	}
	languages := map[string]int{}
	stars, publicCount := 0, 0
	var lastActivity *time.Time
	for _, repo := range repositories {
		if repo.Fork || repo.Private {
			continue
		}
		publicCount++
		stars += repo.Stars
		if repo.Language != nil {
			languages[*repo.Language]++
		}
		if repo.PushedAt != nil && (lastActivity == nil || repo.PushedAt.After(*lastActivity)) {
			lastActivity = repo.PushedAt
		}
	}
	languageJSON, _ := json.Marshal(languages)
	var createdAt *time.Time
	if parsed, err := time.Parse(time.RFC3339, account.CreatedAt); err == nil {
		createdAt = &parsed
	}
	now := time.Now().UTC()
	active := lastActivity != nil && lastActivity.After(now.AddDate(0, 0, -30))
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		stats := models.GitHubStats{ProfileID: profile.ID, PublicRepos: &publicCount, Followers: &account.Followers, TotalStars: &stars, GitHubFollowing: &account.Following, GitHubBio: account.Bio, AccountCreated: createdAt, LastActivity: lastActivity, LastSyncedAt: &now, LastSyncWithGitHub: &now, TopLanguages: languageJSON, IsActive: active, VerificationStatus: "verified"}
		if err := tx.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "profile_id"}}, DoUpdates: clause.AssignmentColumns([]string{"public_repos", "followers", "total_stars", "github_following", "github_bio", "account_created", "last_activity", "last_synced_at", "last_sync_with_github", "top_languages", "is_active", "verification_status"})}).Create(&stats).Error; err != nil {
			return err
		}
		profileID := profile.ID
		for _, repo := range repositories {
			if repo.Fork || repo.Private {
				continue
			}
			var stored models.GitHubRepository
			err := tx.Where("profile_id = ? AND name = ?", profile.ID, repo.Name).First(&stored).Error
			if err == nil {
				if err := tx.Model(&stored).Updates(map[string]interface{}{"description": repo.Description, "stars": repo.Stars, "forks": repo.Forks, "language": repo.Language, "last_updated": repo.UpdatedAt, "is_public": true}).Error; err != nil {
					return err
				}
				continue
			}
			entry := models.GitHubRepository{ProfileID: &profileID, Name: repo.Name, Description: repo.Description, Stars: repo.Stars, Forks: repo.Forks, Language: repo.Language, LastUpdated: repo.UpdatedAt, IsPublic: true}
			if err := tx.Create(&entry).Error; err != nil {
				return err
			}
		}
		return tx.Model(&profile).Update("github_username", account.Login).Error
	})
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to save GitHub data")
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "GitHub data synced successfully"})
}

func (h *Handler) githubGET(c *gin.Context, path string, target interface{}) error {
	req, err := http.NewRequestWithContext(c.Request.Context(), http.MethodGet, "https://api.github.com"+path, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "SkillBridge/1.0")
	if h.Cfg.GitHubToken != "" {
		req.Header.Set("Authorization", "Bearer "+h.Cfg.GitHubToken)
	}
	response, err := (&http.Client{Timeout: 15 * time.Second}).Do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("GitHub API returned %s", response.Status)
	}
	return json.NewDecoder(response.Body).Decode(target)
}

func (h *Handler) DisconnectGitHub(c *gin.Context) {
	owner, _ := userID(c)
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		var profile models.Profile
		if err := tx.Where("user_id = ?", owner).First(&profile).Error; err != nil {
			return err
		}
		if err := tx.Where("profile_id = ?", profile.ID).Delete(&models.GitHubRepository{}).Error; err != nil {
			return err
		}
		if err := tx.Where("profile_id = ?", profile.ID).Delete(&models.GitHubStats{}).Error; err != nil {
			return err
		}
		if err := tx.Model(&profile).Update("github_username", nil).Error; err != nil {
			return err
		}
		return tx.Model(&models.User{}).Where("id = ?", owner).Updates(map[string]interface{}{"github_id": nil, "github_username": nil, "github_verified": false, "github_connected_at": nil}).Error
	})
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to disconnect GitHub")
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "GitHub account disconnected successfully"})
}

func (h *Handler) UpdatePinnedRepos(c *gin.Context) {
	h.updateRepositoryVisibility(c, "pinnedRepos", "is_pinned")
}
func (h *Handler) UpdateHiddenRepos(c *gin.Context) {
	h.updateRepositoryVisibility(c, "hiddenRepos", "is_hidden")
}

func (h *Handler) updateRepositoryVisibility(c *gin.Context, field, column string) {
	owner, _ := userID(c)
	var input map[string][]string
	if !bindJSON(c, &input) {
		return
	}
	ids := input[field]
	var profile models.Profile
	if err := h.DB.Where("user_id = ?", owner).First(&profile).Error; err != nil {
		fail(c, http.StatusNotFound, "Profile not found")
		return
	}
	if err := h.DB.Model(&models.GitHubRepository{}).Where("profile_id = ?", profile.ID).Update(column, false).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to update repositories")
		return
	}
	if len(ids) > 0 {
		if err := h.DB.Model(&models.GitHubRepository{}).Where("profile_id = ? AND name IN ?", profile.ID, ids).Update(column, true).Error; err != nil {
			fail(c, http.StatusInternalServerError, "Unable to update repositories")
			return
		}
	}
	message := "Pinned repositories updated"
	if field == "hiddenRepos" {
		message = "Hidden repositories updated"
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": message})
}

func (h *Handler) ExchangeGitHubCode(c *gin.Context) {
	owner, _ := userID(c)
	var input struct {
		Code string `json:"code"`
	}
	if !bindJSON(c, &input) {
		return
	}
	if input.Code == "" {
		fail(c, http.StatusBadRequest, "Code is required")
		return
	}
	if err := h.connectGitHub(c, owner.String(), input.Code); err != nil {
		fail(c, http.StatusBadGateway, "Failed to connect GitHub account")
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "GitHub account connected successfully"})
}

func (h *Handler) connectGitHub(c *gin.Context, userID, code string) error {
	if h.Cfg.GitHubClientID == "" || h.Cfg.GitHubClientSecret == "" {
		return fmt.Errorf("GitHub OAuth is not configured")
	}
	form := url.Values{"client_id": {h.Cfg.GitHubClientID}, "client_secret": {h.Cfg.GitHubClientSecret}, "code": {code}, "redirect_uri": {h.Cfg.GitHubCallbackURL}}
	req, err := http.NewRequestWithContext(c.Request.Context(), http.MethodPost, "https://github.com/login/oauth/access_token", strings.NewReader(form.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	client := &http.Client{Timeout: 15 * time.Second}
	response, err := client.Do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	var tokenData struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(response.Body).Decode(&tokenData); err != nil || tokenData.AccessToken == "" {
		return fmt.Errorf("GitHub token exchange failed")
	}
	userReq, err := http.NewRequestWithContext(c.Request.Context(), http.MethodGet, "https://api.github.com/user", nil)
	if err != nil {
		return err
	}
	userReq.Header.Set("Authorization", "Bearer "+tokenData.AccessToken)
	userReq.Header.Set("User-Agent", "SkillBridge/1.0")
	userReq.Header.Set("Accept", "application/vnd.github+json")
	userResponse, err := client.Do(userReq)
	if err != nil {
		return err
	}
	defer userResponse.Body.Close()
	var githubUser struct {
		ID        int64   `json:"id"`
		Login     string  `json:"login"`
		AvatarURL string  `json:"avatar_url"`
		Bio       *string `json:"bio"`
		Followers int     `json:"followers"`
		Following int     `json:"following"`
		CreatedAt string  `json:"created_at"`
	}
	if err := json.NewDecoder(userResponse.Body).Decode(&githubUser); err != nil || githubUser.Login == "" {
		return fmt.Errorf("GitHub user fetch failed")
	}
	id, err := uuid.Parse(userID)
	if err != nil {
		return err
	}
	return h.DB.Transaction(func(tx *gorm.DB) error {
		var profile models.Profile
		if err := tx.Where("user_id = ?", id).First(&profile).Error; err != nil {
			return err
		}
		if err := tx.Model(&models.User{}).Where("id = ?", id).Updates(map[string]interface{}{"github_id": githubUser.ID, "github_username": githubUser.Login, "avatar_url": githubUser.AvatarURL, "github_verified": true, "github_connected_at": time.Now()}).Error; err != nil {
			return err
		}
		if err := tx.Model(&profile).Update("github_username", githubUser.Login).Error; err != nil {
			return err
		}
		var accountCreated *time.Time
		if parsed, err := time.Parse(time.RFC3339, githubUser.CreatedAt); err == nil {
			accountCreated = &parsed
		}
		stats := models.GitHubStats{ProfileID: profile.ID, Followers: &githubUser.Followers, GitHubFollowing: &githubUser.Following, GitHubBio: githubUser.Bio, AccountCreated: accountCreated, VerificationStatus: "verified", LastSyncedAt: ptrTime(time.Now())}
		return tx.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "profile_id"}}, DoUpdates: clause.AssignmentColumns([]string{"followers", "github_following", "github_bio", "account_created", "verification_status", "last_synced_at"})}).Create(&stats).Error
	})
}

func ptrTime(value time.Time) *time.Time { return &value }
