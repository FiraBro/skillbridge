package db

import (
	"fmt"
	"log"
	"strings"
	"time"

	"skillbridge/backend/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	dsn := withSSLMode(cfg.DatabaseURL, cfg.IsProduction())

	logLevel := logger.Warn
	if !cfg.IsProduction() {
		logLevel = logger.Info
	}

	gdb, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})
	if err != nil {
		return nil, fmt.Errorf("open postgres: %w", err)
	}

	sqlDB, err := gdb.DB()
	if err != nil {
		return nil, fmt.Errorf("sql db: %w", err)
	}

	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)

	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	log.Println("✅ PostgreSQL connected")
	return gdb, nil
}

func withSSLMode(dsn string, production bool) string {
	if strings.Contains(strings.ToLower(dsn), "sslmode=") {
		return dsn
	}
	sep := "?"
	if strings.Contains(dsn, "?") {
		sep = "&"
	}
	if production {
		return dsn + sep + "sslmode=require"
	}
	return dsn + sep + "sslmode=disable"
}
