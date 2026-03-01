package main

import (
    "fmt"
    "log"
    "os"
    "time"

    "github.com/google/uuid"
    "github.com/joho/godotenv"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

// Minimal User model for testing
type MinimalUser struct {
    ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
    Username  string    `gorm:"uniqueIndex;not null"`
    Email     string    `gorm:"uniqueIndex;not null"`
    Password  string    `gorm:"not null"`
    CreatedAt time.Time
    UpdatedAt time.Time
}

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

    // Try with minimal model
    fmt.Println("Testing minimal user model...")
    if err := db.AutoMigrate(&MinimalUser{}); err != nil {
        log.Fatal("Minimal user migration failed:", err)
    }
    fmt.Println("✅ Minimal user migration successful!")

    // Try to create a record
    testUser := MinimalUser{
        Username: "testuser",
        Email:    "test@example.com",
        Password: "password",
    }
    
    if err := db.Create(&testUser).Error; err != nil {
        log.Fatal("Failed to create user:", err)
    }
    fmt.Println("✅ Test user created successfully!")
}