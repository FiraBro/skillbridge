package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"skillbridge/backend/internal/httpx"
	"skillbridge/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

func (h *Handler) BrowseJobs(c *gin.Context) {
	limit := min(positiveInt(c.Query("limit"), 20), 100)
	offset := max(intQuery(c.Query("offset"), 0), 0)
	query := h.DB.Model(&models.Job{}).Preload("Client").Where("jobs.status = ?", "open")
	if search := strings.TrimSpace(c.Query("search")); search != "" {
		like := "%" + search + "%"
		query = query.Where("(jobs.title ILIKE ? OR jobs.description ILIKE ?)", like, like)
	}
	if skills := c.Query("skills"); skills != "" {
		var values []string
		for _, skill := range strings.Split(skills, ",") {
			if skill = strings.TrimSpace(skill); skill != "" {
				values = append(values, skill)
			}
		}
		if len(values) > 0 {
			query = query.Where("jsonb_exists_any(jobs.required_skills, ?)", pq.StringArray(values))
		}
	}
	var jobs []models.Job
	if err := query.Order("jobs.created_at DESC").Limit(limit).Offset(offset).Find(&jobs).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to browse jobs")
		return
	}
	httpx.Success(c, http.StatusOK, jobs, "Success")
}

func (h *Handler) GetJob(c *gin.Context) {
	var job models.Job
	if err := h.DB.Preload("Client").First(&job, "id = ?", c.Param("id")).Error; err != nil {
		fail(c, http.StatusNotFound, "Job not found")
		return
	}
	var clientName *string
	_ = h.DB.Table("users").Select("name").Where("id = ?", job.ClientID).Scan(&clientName).Error
	var applicationStatus interface{}
	if id, ok := userID(c); ok {
		var application models.JobApplication
		if h.DB.Select("hiring_status").Where("job_id = ? AND developer_id = ?", job.ID, id).First(&application).Error == nil {
			applicationStatus = application.HiringStatus
		}
	}
	c.JSON(http.StatusOK, gin.H{"id": job.ID, "clientId": job.ClientID, "clientName": clientName, "title": job.Title, "description": job.Description, "budgetRange": job.BudgetRange, "status": job.Status, "requiredSkills": job.RequiredSkills, "expectedOutcome": job.ExpectedOutcome, "trialFriendly": job.TrialFriendly, "isPublished": job.IsPublished, "createdAt": job.CreatedAt, "updatedAt": job.UpdatedAt, "applicationStatus": applicationStatus})
}

func (h *Handler) GetRecommendedJobs(c *gin.Context) {
	id, _ := userID(c)
	var skills []string
	_ = h.DB.Table("profile_skills").Select("skills.name").Joins("JOIN profiles ON profiles.id = profile_skills.profile_id").Joins("JOIN skills ON skills.id = profile_skills.skill_id").Where("profiles.user_id = ?", id).Scan(&skills).Error
	var jobs []models.Job
	if err := h.DB.Preload("Client").Where("status = ?", "open").Order("created_at DESC").Find(&jobs).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to load recommended jobs")
		return
	}
	type recommendation struct {
		models.Job
		MatchPercentage int  `json:"matchPercentage"`
		IsRecommended   bool `json:"isRecommended"`
	}
	results := make([]recommendation, 0, len(jobs))
	for _, job := range jobs {
		var required []string
		_ = json.Unmarshal(job.RequiredSkills, &required)
		matches := 0
		for _, requiredSkill := range required {
			for _, skill := range skills {
				if strings.EqualFold(requiredSkill, skill) {
					matches++
					break
				}
			}
		}
		percent := 0
		if len(required) > 0 {
			percent = matches * 100 / len(required)
		}
		results = append(results, recommendation{Job: job, MatchPercentage: percent, IsRecommended: percent >= 70})
	}
	httpx.Success(c, http.StatusOK, results, "Success")
}

func (h *Handler) CreateJob(c *gin.Context) {
	owner, _ := userID(c)
	var input struct {
		Title           string          `json:"title"`
		Description     string          `json:"description"`
		BudgetRange     *string         `json:"budgetRange"`
		RequiredSkills  json.RawMessage `json:"requiredSkills"`
		ExpectedOutcome *string         `json:"expectedOutcome"`
		TrialFriendly   bool            `json:"trialFriendly"`
	}
	if !bindJSON(c, &input) {
		return
	}
	if strings.TrimSpace(input.Title) == "" || strings.TrimSpace(input.Description) == "" {
		fail(c, http.StatusBadRequest, "Job title and description are required")
		return
	}
	if len(input.RequiredSkills) == 0 {
		input.RequiredSkills = json.RawMessage("[]")
	}
	job := models.Job{ClientID: owner, Title: input.Title, Description: input.Description, BudgetRange: input.BudgetRange, RequiredSkills: input.RequiredSkills, ExpectedOutcome: input.ExpectedOutcome, TrialFriendly: input.TrialFriendly, Status: "open", IsPublished: true}
	if err := h.DB.Create(&job).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to create job")
		return
	}
	httpx.Success(c, http.StatusCreated, job, "Job created successfully")
}

func (h *Handler) ApplyToJob(c *gin.Context) {
	developer, _ := userID(c)
	var input struct {
		Message    *string                  `json:"message"`
		Milestones []map[string]interface{} `json:"milestones"`
	}
	if !bindJSON(c, &input) {
		return
	}
	if len(input.Milestones) == 0 {
		fail(c, http.StatusBadRequest, "You must provide at least one milestone.")
		return
	}
	var job models.Job
	if err := h.DB.First(&job, "id = ?", c.Param("id")).Error; err != nil {
		fail(c, http.StatusNotFound, "Job not found")
		return
	}
	if job.Status != "open" {
		fail(c, http.StatusBadRequest, "Job is no longer accepting applications")
		return
	}
	var app models.JobApplication
	var milestones json.RawMessage
	encoded, _ := json.Marshal(input.Milestones)
	milestones = encoded
	total := 0.0
	for _, milestone := range input.Milestones {
		amount, ok := milestone["amount"].(float64)
		if !ok || amount <= 0 {
			fail(c, http.StatusBadRequest, "Each milestone must have a valid amount greater than 0")
			return
		}
		total += amount
	}
	err := h.DB.Raw(`INSERT INTO job_applications (job_id, developer_id, message, milestones, total_bid_amount) VALUES (?, ?, ?, ?::jsonb, ?) ON CONFLICT (job_id, developer_id) DO NOTHING RETURNING *`, job.ID, developer, input.Message, milestones, total).Scan(&app).Error
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to submit proposal")
		return
	}
	if app.ID == uuid.Nil {
		fail(c, http.StatusConflict, "You have already applied to this job")
		return
	}
	httpx.Success(c, http.StatusCreated, app, "Proposal submitted successfully")
}

func (h *Handler) GetCompanyJobs(c *gin.Context) {
	owner, _ := userID(c)
	var jobs []map[string]interface{}
	if err := h.DB.Raw(`SELECT j.*, (SELECT COUNT(*) FROM job_applications a WHERE a.job_id=j.id) AS "applicantCount", (SELECT COUNT(*) FROM job_applications a WHERE a.job_id=j.id AND a.hiring_status='hired') AS "hiredCount" FROM jobs j WHERE j.client_id=? ORDER BY j.created_at DESC`, owner).Scan(&jobs).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to fetch company jobs")
		return
	}
	httpx.Success(c, http.StatusOK, jobs, "Success")
}

func (h *Handler) GetJobApplicants(c *gin.Context) {
	owner, _ := userID(c)
	var count int64
	h.DB.Model(&models.Job{}).Where("id = ? AND client_id = ?", c.Param("id"), owner).Count(&count)
	if count == 0 {
		fail(c, http.StatusNotFound, "Job not found or unauthorized")
		return
	}
	var rows []map[string]interface{}
	err := h.DB.Raw(`SELECT a.id, a.message, a.hiring_status AS "hiringStatus", a.private_notes AS "privateNotes", a.applied_at AS "appliedAt", json_build_object('id',u.id,'name',u.name,'email',u.email,'profileId',p.id,'username',p.username,'reputation',p.reputation_score,'avatarUrl',u.avatar_url) AS developer FROM job_applications a JOIN users u ON u.id=a.developer_id LEFT JOIN profiles p ON p.user_id=u.id WHERE a.job_id=? ORDER BY a.applied_at DESC`, c.Param("id")).Scan(&rows).Error
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to fetch applicants")
		return
	}
	httpx.Success(c, http.StatusOK, rows, "Success")
}

func (h *Handler) ToggleJobPublish(c *gin.Context) {
	owner, _ := userID(c)
	var input struct {
		IsPublished *bool `json:"isPublished"`
	}
	if !bindJSON(c, &input) {
		return
	}
	if input.IsPublished == nil {
		fail(c, http.StatusBadRequest, "isPublished must be a boolean value")
		return
	}
	result := h.DB.Model(&models.Job{}).Where("id = ? AND client_id = ?", c.Param("id"), owner).Update("is_published", *input.IsPublished)
	if result.Error != nil || result.RowsAffected == 0 {
		fail(c, http.StatusNotFound, "Job not found or unauthorized")
		return
	}
	var job models.Job
	_ = h.DB.First(&job, "id = ?", c.Param("id")).Error
	state := "unpublished"
	if *input.IsPublished {
		state = "published"
	}
	httpx.Success(c, http.StatusOK, job, "Job "+state+" successfully")
}

func (h *Handler) UpdateApplicationFeedback(c *gin.Context) {
	owner, _ := userID(c)
	var input struct {
		Status *string `json:"status"`
		Notes  *string `json:"notes"`
	}
	if !bindJSON(c, &input) {
		return
	}
	if input.Status != nil && !contains([]string{"shortlisted", "rejected", "interviewing", "hired", "pending"}, *input.Status) {
		fail(c, http.StatusBadRequest, "Invalid application status")
		return
	}
	result := h.DB.Exec(`UPDATE job_applications SET hiring_status=COALESCE(?,hiring_status), private_notes=COALESCE(?,private_notes), updated_at=NOW() WHERE id=? AND job_id IN (SELECT id FROM jobs WHERE client_id=?)`, input.Status, input.Notes, c.Param("applicationId"), owner)
	if result.Error != nil || result.RowsAffected == 0 {
		fail(c, http.StatusNotFound, "Application not found or unauthorized")
		return
	}
	var app models.JobApplication
	_ = h.DB.First(&app, "id = ?", c.Param("applicationId")).Error
	httpx.Success(c, http.StatusOK, app, "Application updated successfully")
}

func intQuery(value string, fallback int) int {
	var n int
	if _, err := fmt.Sscanf(value, "%d", &n); err != nil {
		return fallback
	}
	return n
}

func contains(values []string, value string) bool {
	for _, item := range values {
		if item == value {
			return true
		}
	}
	return false
}
