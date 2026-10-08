package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strings"
	"time"

	"skillbridge/backend/internal/auth"
	"skillbridge/backend/internal/httpx"
	"skillbridge/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func (h *Handler) Register(c *gin.Context) {
	var input struct {
		Email           string  `json:"email"`
		Password        string  `json:"password"`
		ConfirmPassword string  `json:"confirmPassword"`
		Name            *string `json:"name"`
		Role            string  `json:"role"`
	}
	if !bindJSON(c, &input) {
		return
	}
	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	if !strings.Contains(input.Email, "@") {
		fail(c, http.StatusBadRequest, "Valid email is required")
		return
	}
	if len(input.Password) < 8 {
		fail(c, http.StatusBadRequest, "Password must be at least 8 characters")
		return
	}
	if input.Password != input.ConfirmPassword {
		fail(c, http.StatusBadRequest, "Passwords do not match")
		return
	}
	if input.Role == "" {
		input.Role = "developer"
	}
	if input.Role != "developer" && input.Role != "company" {
		fail(c, http.StatusBadRequest, "Role must be developer or company")
		return
	}

	var count int64
	if err := h.DB.Model(&models.User{}).Where("email = ?", input.Email).Count(&count).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to register user")
		return
	}
	if count > 0 {
		fail(c, http.StatusConflict, "Email already registered")
		return
	}
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(input.Password), h.Cfg.BcryptSaltRounds)
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to register user")
		return
	}
	username := uniqueUsername(input.Name, input.Email)
	user := models.User{Email: input.Email, PasswordHash: string(passwordHash), Name: input.Name, Username: &username, Role: input.Role}
	err = h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&user).Error; err != nil {
			return err
		}
		profile := models.Profile{UserID: user.ID, Username: username, FullName: input.Name}
		return tx.Create(&profile).Error
	})
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to register user")
		return
	}
	token, err := h.tokenFor(user)
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to create access token")
		return
	}
	httpx.Success(c, http.StatusCreated, gin.H{"user": publicUser(user), "token": token}, "User registered")
}

func (h *Handler) Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if !bindJSON(c, &input) {
		return
	}
	if input.Email == "" || input.Password == "" {
		fail(c, http.StatusBadRequest, "Email and password are required")
		return
	}
	var user models.User
	err := h.DB.Where("LOWER(email) = ?", strings.ToLower(strings.TrimSpace(input.Email))).First(&user).Error
	if err != nil || bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)) != nil {
		fail(c, http.StatusUnauthorized, "Invalid credentials")
		return
	}
	token, err := h.tokenFor(user)
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to create access token")
		return
	}
	httpx.Success(c, http.StatusOK, gin.H{"user": publicUser(user), "token": token}, "Login successful")
}

func (h *Handler) FetchUser(c *gin.Context) {
	var users []models.User
	if err := h.DB.Select("id", "email", "name", "role", "username").Find(&users).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to fetch users")
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "User data fetched successfully", "data": users})
}

func (h *Handler) DeleteUser(c *gin.Context) {
	target, err := uuid.Parse(c.Param("id"))
	if err != nil {
		fail(c, http.StatusBadRequest, "Invalid user ID")
		return
	}
	owner, _ := userID(c)
	role, _ := c.Get("role")
	if target != owner && role != "admin" {
		fail(c, http.StatusForbidden, "Unauthorized")
		return
	}
	if err := h.DB.Delete(&models.User{}, "id = ?", target).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to delete user")
		return
	}
	httpx.Success(c, http.StatusOK, nil, "User account deleted successfully")
}

func (h *Handler) ForgotPassword(c *gin.Context) {
	var input struct {
		Email string `json:"email"`
	}
	if !bindJSON(c, &input) {
		return
	}
	var user models.User
	if err := h.DB.Where("LOWER(email) = ?", strings.ToLower(strings.TrimSpace(input.Email))).First(&user).Error; err == nil {
		raw := make([]byte, 32)
		if _, err := rand.Read(raw); err == nil {
			token := hex.EncodeToString(raw)
			expires := time.Now().Add(15 * time.Minute)
			_ = h.DB.Model(&user).Updates(map[string]interface{}{"password_reset_token": token, "password_reset_expires": expires}).Error
		}
	}
	httpx.Success(c, http.StatusOK, nil, "If email exists, reset link sent")
}

func (h *Handler) ResetPassword(c *gin.Context) {
	var input struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}
	if !bindJSON(c, &input) {
		return
	}
	if input.Token == "" || len(input.Password) < 8 {
		fail(c, http.StatusBadRequest, "Invalid or expired token")
		return
	}
	var user models.User
	if err := h.DB.Where("password_reset_token = ? AND password_reset_expires > ?", input.Token, time.Now()).First(&user).Error; err != nil {
		fail(c, http.StatusBadRequest, "Invalid or expired token")
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), h.Cfg.BcryptSaltRounds)
	if err != nil {
		fail(c, http.StatusInternalServerError, "Unable to reset password")
		return
	}
	if err := h.DB.Model(&user).Updates(map[string]interface{}{"password_hash": string(hash), "password_reset_token": nil, "password_reset_expires": nil}).Error; err != nil {
		fail(c, http.StatusInternalServerError, "Unable to reset password")
		return
	}
	httpx.Success(c, http.StatusOK, nil, "Password reset successful")
}

func (h *Handler) tokenFor(user models.User) (string, error) {
	username := ""
	if user.Username != nil {
		username = *user.Username
	}
	return auth.SignAccessToken(h.Cfg.JWTAccessSecret, user.ID.String(), user.Role, username, user.Email, h.Cfg.JWTAccessExpiresIn)
}

func publicUser(user models.User) gin.H {
	return gin.H{"id": user.ID, "email": user.Email, "name": user.Name, "role": user.Role, "username": user.Username, "isActive": user.IsActive, "onboardingCompleted": user.OnboardingCompleted, "createdAt": user.CreatedAt}
}

func uniqueUsername(name *string, email string) string {
	base := strings.TrimSpace(strings.ToLower(strings.Split(email, "@")[0]))
	if name != nil && strings.TrimSpace(*name) != "" {
		base = strings.TrimSpace(strings.ToLower(strings.ReplaceAll(*name, " ", "-")))
	}
	var result strings.Builder
	for _, r := range base {
		if r >= 'a' && r <= 'z' || r >= '0' && r <= '9' || r == '-' {
			result.WriteRune(r)
		}
	}
	base = strings.Trim(result.String(), "-")
	if base == "" {
		base = "user"
	}
	return base + "-" + uuid.NewString()[:8]
}
