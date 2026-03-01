package main

import (
    "communityHub/internal/models"
    "fmt"
    "log"
    "os"

    "github.com/joho/godotenv"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

func main() {
    // Load .env file
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found, using environment variables")
    }

    dsn := os.Getenv("DATABASE_URL")
    if dsn == "" {
        log.Fatal("DATABASE_URL environment variable is required")
    }

    fmt.Println("🔌 Connecting to database...")

    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect:", err)
    }

    fmt.Println("✅ Connected!")

    // Enable UUID extension
    db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")

    // Try to migrate each model individually
    models := []struct {
        model interface{}
        name  string
    }{
        {&models.User{}, "User"},
        {&models.Topic{}, "Topic"},
        {&models.Post{}, "Post"},
        {&models.Comment{}, "Comment"},
        {&models.Like{}, "Like"},
        {&models.Tag{}, "Tag"},
    }

    for _, m := range models {
        fmt.Printf("\nAttempting to migrate %s...\n", m.name)
        
        // Try to create the table
        if err := db.AutoMigrate(m.model); err != nil {
            fmt.Printf("❌ Failed to migrate %s: %v\n", m.name, err)
            
            // Try to get more details about the error
            if err := db.Debug().AutoMigrate(m.model); err != nil {
                fmt.Printf("Debug error: %v\n", err)
            }
        } else {
            fmt.Printf("✅ %s migrated successfully\n", m.name)
        }
    }
}