package main

import (
    "database/sql"
    "fmt"
    "log"
    "os"
    "strings"

    "github.com/joho/godotenv"
    _ "github.com/lib/pq"
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

    fmt.Println("Original DSN:", dsn)

    // Parse the connection string manually
    // Format: postgres://username:password@host:port/dbname?sslmode=disable
    dsn = strings.TrimPrefix(dsn, "postgres://")
    
    // Split user:password@host:port/dbname
    parts := strings.SplitN(dsn, "@", 2)
    if len(parts) != 2 {
        log.Fatal("Invalid DSN format")
    }
    
    userPass := parts[0]
    hostPortDB := parts[1]
    
    // Split user:password
    userPassParts := strings.SplitN(userPass, ":", 2)
    if len(userPassParts) != 2 {
        log.Fatal("Invalid user:password format")
    }
    user := userPassParts[0]
    password := userPassParts[1]
    
    // Split host:port/dbname
    hostPortDB = strings.SplitN(hostPortDB, "?", 2)[0] // Remove query params
    hostPortParts := strings.SplitN(hostPortDB, "/", 2)
    if len(hostPortParts) != 2 {
        log.Fatal("Invalid host:port/dbname format")
    }
    
    hostPort := hostPortParts[0]
    dbname := strings.Split(hostPortParts[1], "?")[0]
    
    // Split host:port
    host := hostPort
    port := "5432" // default PostgreSQL port
    
    if strings.Contains(hostPort, ":") {
        hostPortSplit := strings.SplitN(hostPort, ":", 2)
        host = hostPortSplit[0]
        port = hostPortSplit[1]
    }
    
    fmt.Printf("Parsed connection:\n")
    fmt.Printf("  Host: %s\n", host)
    fmt.Printf("  Port: %s\n", port)
    fmt.Printf("  User: %s\n", user)
    fmt.Printf("  Password: %s\n", password)
    fmt.Printf("  Database: %s\n", dbname)

    // Connect to default postgres database
    connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=postgres sslmode=disable",
        host, port, user, password)

    fmt.Println("Connecting to postgres database...")
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        log.Fatal("Failed to connect:", err)
    }
    defer db.Close()

    // Test connection
    err = db.Ping()
    if err != nil {
        log.Fatal("Failed to ping database:", err)
    }
    fmt.Println("✅ Connected to postgres database")

    // Force terminate all connections to the target database
    fmt.Printf("Terminating all connections to %s...\n", dbname)
    _, err = db.Exec(fmt.Sprintf(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = '%s' AND pid <> pg_backend_pid();
    `, dbname))
    if err != nil {
        fmt.Printf("Warning: %v\n", err)
    }

    // Drop the database with force
    fmt.Printf("Dropping database %s...\n", dbname)
    _, err = db.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %s WITH (FORCE);", dbname))
    if err != nil {
        // Try without FORCE if PostgreSQL version doesn't support it
        _, err = db.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %s;", dbname))
        if err != nil {
            log.Fatal("Failed to drop database:", err)
        }
    }

    // Create fresh database
    fmt.Printf("Creating database %s...\n", dbname)
    _, err = db.Exec(fmt.Sprintf("CREATE DATABASE %s;", dbname))
    if err != nil {
        log.Fatal("Failed to create database:", err)
    }

    fmt.Println("✅ Database reset successfully!")
}