package handlers

import (
	"encoding/json"
	"math"
	"net/http"
	"time"

	"skillbridge/backend/internal/httpx"
	"skillbridge/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *Handler) CreateEndorsement(c *gin.Context) {
	endorser, _ := userID(c)
	var input struct {
		EndorsedID string  `json:"endorsedId"`
		SkillID    *int    `json:"skillId"`
		Message    *string `json:"message"`
	}
	if !bindJSON(c, &input) {
		return
	}
	endorsedID, err := uuid.Parse(input.EndorsedID)
	if err != nil {
		fail(c, http.StatusBadRequest, "Invalid endorsed user ID")
		return
	}
	if endorser == endorsedID {
		fail(c, http.StatusBadRequest, "Cannot endorse yourself")
		return
	}
	endorsement := models.Endorsement{EndorserID: endorser, EndorsedID: endorsedID, SkillID: input.SkillID, Message: input.Message}
	if err := h.DB.Create(&endorsement).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to create endorsement")
		return
	}
	_, _ = h.recalculateReputation(endorsedID)
	httpx.Success(c, http.StatusCreated, endorsement, "Success")
}

func (h *Handler) GetEndorsements(c *gin.Context) {
	if c.Query("groupBySkill") == "true" {
		var rows []map[string]interface{}
		err := h.DB.Raw(`SELECT s.id AS "skillId", s.name AS "skillName", COUNT(e.id) AS "endorsementCount", json_agg(json_build_object('id',e.id,'endorserId',e.endorser_id,'endorserName',u.name,'endorserAvatar',u.avatar_url,'message',e.message,'createdAt',e.created_at) ORDER BY e.created_at DESC) AS endorsements FROM endorsements e JOIN users u ON u.id=e.endorser_id JOIN skills s ON s.id=e.skill_id WHERE e.endorsed_id=? GROUP BY s.id,s.name ORDER BY COUNT(e.id) DESC,s.name`, c.Param("userId")).Scan(&rows).Error
		if err != nil {
			fail(c, http.StatusInternalServerError, "Unable to fetch endorsements")
			return
		}
		httpx.Success(c, http.StatusOK, rows, "Success")
		return
	}
	var rows []map[string]interface{}
	err := h.DB.Raw(`SELECT e.id, e.endorser_id AS "endorserId", e.endorsed_id AS "endorsedId", e.skill_id AS "skillId", e.message, e.created_at AS "createdAt", u.name AS "endorserName", u.avatar_url AS "endorserAvatar", s.name AS "skillName" FROM endorsements e JOIN users u ON u.id=e.endorser_id LEFT JOIN skills s ON s.id=e.skill_id WHERE e.endorsed_id=? ORDER BY e.created_at DESC`, c.Param("userId")).Scan(&rows).Error
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to fetch endorsements")
		return
	}
	httpx.Success(c, http.StatusOK, rows, "Success")
}

func (h *Handler) DeleteEndorsement(c *gin.Context) {
	owner, _ := userID(c)
	var endorsement models.Endorsement
	if err := h.DB.First(&endorsement, "id = ?", c.Param("id")).Error; err != nil {
		fail(c, http.StatusNotFound, "Endorsement not found")
		return
	}
	if endorsement.EndorserID != owner {
		fail(c, http.StatusNotFound, "Unauthorized to delete this endorsement")
		return
	}
	if err := h.DB.Delete(&endorsement).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to delete endorsement")
		return
	}
	_, _ = h.recalculateReputation(endorsement.EndorsedID)
	httpx.Success(c, http.StatusOK, gin.H{"message": "Endorsement deleted"}, "Success")
}

func (h *Handler) ReputationBreakdown(c *gin.Context) {
	breakdown, err := h.computeReputation(c.Param("userId"))
	if err != nil {
		fail(c, http.StatusNotFound, "User not found")
		return
	}
	httpx.Success(c, http.StatusOK, breakdown, "Success")
}

func (h *Handler) ReputationHistory(c *gin.Context) {
	limit := min(positiveInt(c.Query("limit"), 50), 200)
	var rows []map[string]interface{}
	err := h.DB.Raw(`SELECT rh.*, u.name AS "userName", u.avatar_url AS "avatarUrl" FROM reputation_history rh JOIN users u ON u.id=rh.user_id WHERE rh.user_id=? ORDER BY rh.created_at DESC LIMIT ?`, c.Param("userId"), limit).Scan(&rows).Error
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to fetch reputation history")
		return
	}
	httpx.Success(c, http.StatusOK, rows, "Success")
}

func (h *Handler) RecalculateReputation(c *gin.Context) {
	user, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		fail(c, http.StatusBadRequest, "Invalid user ID")
		return
	}
	result, err := h.recalculateReputation(user)
	if err != nil {
		fail(c, http.StatusNotFound, "User not found")
		return
	}
	httpx.Success(c, http.StatusOK, result, "Success")
}

func (h *Handler) computeReputation(userID string) (gin.H, error) {
	var profile models.Profile
	if err := h.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		return nil, err
	}
	var skills, posts, projects, endorsements, likes int64
	_ = h.DB.Raw(`SELECT COUNT(*) FROM profile_skills ps JOIN profiles p ON p.id=ps.profile_id WHERE p.user_id=?`, userID).Scan(&skills).Error
	_ = h.DB.Model(&models.Post{}).Where("author_id = ? AND deleted_at IS NULL", userID).Count(&posts).Error
	_ = h.DB.Model(&models.Project{}).Where("user_id = ?", userID).Count(&projects).Error
	_ = h.DB.Model(&models.Endorsement{}).Where("endorsed_id = ?", userID).Count(&endorsements).Error
	_ = h.DB.Raw(`SELECT COALESCE(SUM(p.like_count),0) FROM posts p WHERE p.author_id=? AND p.deleted_at IS NULL`, userID).Scan(&likes).Error
	var stats models.GitHubStats
	_ = h.DB.Joins("JOIN profiles ON profiles.id = github_stats.profile_id").Where("profiles.user_id = ?", userID).First(&stats).Error
	repos, followers, stars, commits, commits30d := deref(stats.PublicRepos), deref(stats.Followers), deref(stats.TotalStars), deref(stats.TotalCommits), stats.Commits30d
	githubScore := float64(repos*5+followers*3+stars*2) + float64(commits)*0.1
	activity := 0.0
	if stats.IsActive {
		activity = float64(commits30d * 2)
	}
	joinDays := time.Since(profile.JoinedAt).Hours() / 24
	long := math.Min(joinDays/30, 50)
	breakdown := gin.H{"skills": int(skills) * 10, "github": int(math.Round(githubScore)), "activity": int(activity), "posts": int(posts) * 15, "engagement": int(likes) * 3, "projects": int(projects) * 20, "endorsements": int(endorsements) * 25, "longevity": int(math.Round(long))}
	total := breakdown["skills"].(int) + breakdown["github"].(int) + breakdown["activity"].(int) + breakdown["posts"].(int) + breakdown["engagement"].(int) + breakdown["projects"].(int) + breakdown["endorsements"].(int) + breakdown["longevity"].(int)
	return gin.H{"total": total, "breakdown": breakdown, "counts": gin.H{"skills": skills, "repos": repos, "followers": followers, "stars": stars, "commits30d": commits30d, "posts": posts, "likes": likes, "projects": projects, "endorsements": endorsements}}, nil
}

func (h *Handler) recalculateReputation(id uuid.UUID) (gin.H, error) {
	var profile models.Profile
	if err := h.DB.Where("user_id = ?", id).First(&profile).Error; err != nil {
		return nil, err
	}
	previous := profile.ReputationScore
	breakdown, err := h.computeReputation(id.String())
	if err != nil {
		return nil, err
	}
	current := breakdown["total"].(int)
	if err := h.DB.Model(&profile).Update("reputation_score", current).Error; err != nil {
		return nil, err
	}
	if current != previous {
		metadata, _ := json.Marshal(gin.H{"breakdown": breakdown["breakdown"]})
		history := models.ReputationHistory{UserID: id, PreviousScore: previous, NewScore: current, ChangeAmount: current - previous, Reason: "recalculation", Metadata: metadata}
		_ = h.DB.Create(&history).Error
	}
	return gin.H{"previousScore": previous, "newScore": current, "change": current - previous, "breakdown": breakdown}, nil
}

func deref(value *int) int {
	if value == nil {
		return 0
	}
	return *value
}

func (h *Handler) Notifications(c *gin.Context) {
	id, _ := userID(c)
	var rows []map[string]interface{}
	err := h.DB.Raw(`SELECT 'profile_view' AS type, v.id, v.created_at AS "createdAt", u.name AS "actorName", NULL::text AS message FROM profile_views v JOIN profiles p ON p.id=v.profile_id LEFT JOIN users u ON u.id=v.viewer_id WHERE p.user_id=? AND v.viewer_role='company' UNION ALL SELECT 'new_message' AS type, m.id, m.created_at AS "createdAt", u.name AS "actorName", m.message_text AS message FROM messages m JOIN users u ON u.id=m.sender_id WHERE m.conversation_id IN (SELECT id FROM conversations WHERE user_one=? OR user_two=?) AND m.sender_id<>? UNION ALL SELECT 'contact_request' AS type, cr.id, cr.created_at AS "createdAt", u.name AS "actorName", cr.message FROM contact_requests cr JOIN users u ON u.id=cr.sender_id WHERE cr.receiver_id=? AND cr.status='pending' ORDER BY "createdAt" DESC`, id, id, id, id, id).Scan(&rows).Error
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to fetch notifications")
		return
	}
	httpx.Success(c, http.StatusOK, rows, "Success")
}

func (h *Handler) Inbox(c *gin.Context) {
	id, _ := userID(c)
	var rows []map[string]interface{}
	err := h.DB.Raw(`SELECT c.id AS "conversationId", u.name AS "partnerName", (SELECT message_text FROM messages WHERE conversation_id=c.id ORDER BY created_at DESC LIMIT 1) AS "lastMessage" FROM conversations c JOIN users u ON (u.id=c.user_one OR u.id=c.user_two) WHERE (c.user_one=? OR c.user_two=?) AND u.id<>?`, id, id, id).Scan(&rows).Error
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to fetch inbox")
		return
	}
	httpx.Success(c, http.StatusOK, rows, "Success")
}
func (h *Handler) ChatHistory(c *gin.Context) {
	id, _ := userID(c)
	partner, err := uuid.Parse(c.Param("partnerId"))
	if err != nil {
		fail(c, http.StatusBadRequest, "Invalid partner ID")
		return
	}
	var rows []map[string]interface{}
	err = h.DB.Raw(`SELECT m.id, m.conversation_id AS "conversationId", m.sender_id AS "senderId", m.message_text AS message, m.created_at AS "createdAt", u.name AS "senderName" FROM messages m JOIN conversations c ON c.id=m.conversation_id JOIN users u ON u.id=m.sender_id WHERE c.user_one=LEAST(?,?) AND c.user_two=GREATEST(?,?) ORDER BY m.created_at ASC`, id, partner, id, partner).Scan(&rows).Error
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to fetch chat history")
		return
	}
	httpx.Success(c, http.StatusOK, rows, "Success")
}
func (h *Handler) SendMessage(c *gin.Context) {
	sender, _ := userID(c)
	var input struct {
		ReceiverID string `json:"receiverId"`
		Message    string `json:"message"`
	}
	if !bindJSON(c, &input) {
		return
	}
	receiver, err := uuid.Parse(input.ReceiverID)
	if err != nil || input.Message == "" {
		fail(c, http.StatusBadRequest, "receiverId and message are required")
		return
	}
	var sent map[string]interface{}
	err = h.DB.Transaction(func(tx *gorm.DB) error {
		var conversationID uuid.UUID
		if err := tx.Raw(`INSERT INTO conversations(user_one,user_two) VALUES(LEAST(?,?),GREATEST(?,?)) ON CONFLICT(user_one,user_two) DO UPDATE SET last_message_at=NOW() RETURNING id`, sender, receiver, sender, receiver).Scan(&conversationID).Error; err != nil {
			return err
		}
		return tx.Raw(`INSERT INTO messages(conversation_id,sender_id,message_text) VALUES(?,?,?) RETURNING id, conversation_id AS "conversationId", sender_id AS "senderId", message_text AS message, created_at AS "createdAt"`, conversationID, sender, input.Message).Scan(&sent).Error
	})
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to send message")
		return
	}
	httpx.Success(c, http.StatusCreated, sent, "Message sent")
}

func (h *Handler) RespondToContact(c *gin.Context) {
	owner, _ := userID(c)
	var input struct {
		Status string `json:"status"`
	}
	if !bindJSON(c, &input) {
		return
	}
	if input.Status != "accepted" && input.Status != "ignored" {
		fail(c, http.StatusBadRequest, "Status must be accepted or ignored")
		return
	}
	var request models.ContactRequest
	result := h.DB.Model(&request).Where("id = ? AND receiver_id = ?", c.Param("id"), owner).Update("status", input.Status)
	if result.Error != nil || result.RowsAffected == 0 {
		fail(c, http.StatusNotFound, "Request not found")
		return
	}
	_ = h.DB.First(&request, "id = ?", c.Param("id")).Error
	httpx.Success(c, http.StatusOK, request, "Request "+input.Status)
}
