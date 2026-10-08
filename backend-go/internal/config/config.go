package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Env                string
	Port               string
	DatabaseURL        string
	JWTAccessSecret    string
	JWTResetSecret     string
	JWTAccessExpiresIn string
	JWTResetExpiresIn  string
	BcryptSaltRounds   int
	FrontendURL        string
	APIBaseURL         string
	GitHubClientID     string
	GitHubClientSecret string
	GitHubCallbackURL  string
	GitHubToken        string
	GitHubEncryptKey   string
	SessionSecret      string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	frontendURL := getenv("FRONTEND_URL", "http://localhost:5173")
	frontendURL = strings.TrimRight(frontendURL, "/")

	callback := os.Getenv("GITHUB_CALLBACK_URL")
	if callback == "" {
		callback = frontendURL + "/api/github/auth/github/callback"
	}
	callback = strings.TrimRight(callback, "/")

	salt, err := strconv.Atoi(getenv("BCRYPT_SALT_ROUNDS", "12"))
	if err != nil {
		return nil, fmt.Errorf("invalid BCRYPT_SALT_ROUNDS: %w", err)
	}

	cfg := &Config{
		Env:                getenv("NODE_ENV", "development"),
		Port:               getenv("PORT", "6000"),
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		JWTAccessSecret:    os.Getenv("JWT_ACCESS_SECRET"),
		JWTResetSecret:     os.Getenv("JWT_RESET_SECRET"),
		JWTAccessExpiresIn: getenv("JWT_ACCESS_EXPIRES_IN", "7d"),
		JWTResetExpiresIn:  getenv("JWT_RESET_EXPIRES_IN", "15m"),
		BcryptSaltRounds:   salt,
		FrontendURL:        frontendURL,
		APIBaseURL:         getenv("API_BASE_URL", "http://localhost:6000"),
		GitHubClientID:     os.Getenv("GITHUB_CLIENT_ID"),
		GitHubClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
		GitHubCallbackURL:  callback,
		GitHubToken:        os.Getenv("GITHUB_TOKEN"),
		GitHubEncryptKey:   os.Getenv("GITHUB_ENCRYPTION_KEY"),
		SessionSecret:      os.Getenv("SESSION_SECRET"),
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	return cfg, nil
}

func (c *Config) IsProduction() bool {
	return c.Env == "production"
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
