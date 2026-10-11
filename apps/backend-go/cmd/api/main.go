package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"skillbridge/backend/internal/config"
	"skillbridge/backend/internal/db"
	"skillbridge/backend/internal/server"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	gdb, err := db.Connect(cfg)
	if err != nil {
		log.Fatalf("database: %v", err)
	}

	sqlDB, err := gdb.DB()
	if err != nil {
		log.Fatalf("sql db: %v", err)
	}
	defer sqlDB.Close()

	engine := server.New(cfg, gdb)

	go func() {
		addr := "0.0.0.0:" + cfg.Port
		log.Printf("🚀 API running on http://%s", addr)
		if cfg.GitHubCallbackURL != "" {
			log.Printf("   GitHub callback URL (must match OAuth App): %s", cfg.GitHubCallbackURL)
		}
		if err := engine.Run(addr); err != nil {
			log.Fatalf("listen: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit
	log.Printf("🛑 %s received. Closing server...", sig)
	log.Println("✅ Server closed cleanly")
}
