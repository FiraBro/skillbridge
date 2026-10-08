package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func (h *Handler) Search(c *gin.Context) {
	term := "%" + strings.TrimSpace(c.Query("q")) + "%"
	typeFilter := c.DefaultQuery("type", "all")
	minRep := intQuery(c.Query("minRep"), 0)
	skills := splitCSV(c.Query("skills"))
	results := gin.H{"developers": []interface{}{}, "jobs": []interface{}{}}
	if typeFilter == "all" || typeFilter == "developers" {
		query := `SELECT u.id, u.name, u.avatar_url AS "avatarUrl", p.id AS "profileId", p.reputation_score AS "reputationScore", p.bio, COALESCE((SELECT json_agg(s.name) FROM profile_skills ps JOIN skills s ON s.id=ps.skill_id WHERE ps.profile_id=p.id),'[]'::json) AS skills FROM profiles p JOIN users u ON u.id=p.user_id WHERE (u.name ILIKE ? OR p.bio ILIKE ?)`
		args := []interface{}{term, term}
		if minRep > 0 {
			query += ` AND p.reputation_score >= ?`
			args = append(args, minRep)
		}
		if len(skills) > 0 {
			query += ` AND EXISTS (SELECT 1 FROM profile_skills ps JOIN skills s ON s.id=ps.skill_id WHERE ps.profile_id=p.id AND s.name IN ?)`
			args = append(args, skills)
		}
		query += ` ORDER BY p.reputation_score DESC LIMIT 20`
		var developers []map[string]interface{}
		if err := h.DB.Raw(query, args...).Scan(&developers).Error; err != nil {
			fail(c, http.StatusInternalServerError, "Search failed")
			return
		}
		results["developers"] = developers
	}
	if typeFilter == "all" || typeFilter == "jobs" {
		query := `SELECT j.*, u.name AS "clientName" FROM jobs j JOIN users u ON u.id=j.client_id WHERE (j.title ILIKE ? OR j.description ILIKE ?) AND j.status='open' AND j.is_published=true`
		args := []interface{}{term, term}
		if len(skills) > 0 {
			query += ` AND jsonb_exists_any(j.required_skills, string_to_array(?, ','))`
			args = append(args, strings.Join(skills, ","))
		}
		query += ` ORDER BY j.created_at DESC LIMIT 20`
		var jobs []map[string]interface{}
		if err := h.DB.Raw(query, args...).Scan(&jobs).Error; err != nil {
			fail(c, http.StatusInternalServerError, "Search failed")
			return
		}
		results["jobs"] = jobs
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Success", "data": results})
}

func (h *Handler) TrendingSkills(c *gin.Context) {
	var rows []map[string]interface{}
	err := h.DB.Raw(`SELECT s.name, COUNT(*) AS count FROM profile_skills ps JOIN skills s ON s.id=ps.skill_id GROUP BY s.name ORDER BY count DESC LIMIT 10`).Scan(&rows).Error
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to load trending skills")
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Success", "data": rows})
}

func splitCSV(value string) []string {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	parts := strings.Split(value, ",")
	for i := range parts {
		parts[i] = strings.TrimSpace(parts[i])
	}
	return parts
}
