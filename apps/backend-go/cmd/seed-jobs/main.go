package main

import (
	"context"
	"encoding/json"
	"log"

	"skillbridge/backend/internal/config"
	"skillbridge/backend/internal/db"
	"skillbridge/backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm/clause"
)

type sampleJob struct {
	title          string
	description    string
	budgetRange    string
	requiredSkills []string
}

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	database, err := db.Connect(cfg)
	if err != nil {
		log.Fatalf("database: %v", err)
	}

	var company models.User
	if err := database.WithContext(context.Background()).Where("role = ?", "company").First(&company).Error; err != nil {
		log.Fatal("no company account found; register a company before seeding jobs")
	}

	jobs := []sampleJob{
		{
			title:          "Senior React Developer - Fintech",
			description:    "Build high-performance dashboards for a fintech platform. Experience with Framer Motion and state management is a plus.",
			budgetRange:    "$5,000 - $8,000",
			requiredSkills: []string{"React", "JavaScript", "Tailwind CSS", "Framer Motion"},
		},
		{
			title:          "Fullstack Engineer (Go/PostgreSQL)",
			description:    "Help build a skill-sharing marketplace by designing database schemas and implementing backend services.",
			budgetRange:    "$4,000 - $6,000",
			requiredSkills: []string{"Go", "PostgreSQL", "JavaScript", "React"},
		},
		{
			title:          "UI/UX Designer & Frontend Developer",
			description:    "Design polished interfaces and implement them in React with a strong eye for accessibility and interaction details.",
			budgetRange:    "$3,000 - $5,000",
			requiredSkills: []string{"UI Design", "React", "CSS", "Accessibility"},
		},
	}

	for _, seed := range jobs {
		skills, err := json.Marshal(seed.requiredSkills)
		if err != nil {
			log.Fatalf("encode job skills: %v", err)
		}
		job := models.Job{
			ID:             uuid.New(),
			ClientID:       company.ID,
			Title:          seed.title,
			Description:    seed.description,
			BudgetRange:    &seed.budgetRange,
			Status:         "open",
			RequiredSkills: skills,
			IsPublished:    true,
		}
		if err := database.Clauses(clause.OnConflict{DoNothing: true}).Create(&job).Error; err != nil {
			log.Fatalf("seed job %q: %v", seed.title, err)
		}
	}
	log.Println("Sample jobs seeded.")
}
