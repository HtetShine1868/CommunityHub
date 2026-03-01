package main

import (
    "communityHub/internal/handlers"
    "communityHub/internal/middleware"
    "communityHub/internal/models" // <-- ADD THIS IMPORT
    "communityHub/internal/repository"
    "fmt"
    "log"
    "os"
    "strings"

    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "github.com/rs/cors"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

func main() {
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found, using environment variables")
    }

    frontendURL := os.Getenv("FRONTEND_URL")
    if frontendURL == "" {
        frontendURL = "https://communityhub-1-8f9q.onrender.com"
    }
    allowedOrigins := []string{
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        frontendURL,
    }

    if envOrigins := os.Getenv("ALLOWED_ORIGINS"); envOrigins != "" {
        allowedOrigins = append(allowedOrigins, strings.Split(envOrigins, ",")...)
    }

    fmt.Println("🔌 Connecting to database...")

    dsn := os.Getenv("DATABASE_URL")
    if dsn == "" {
        log.Fatal("DATABASE_URL environment variable is required")
    }

    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    fmt.Println("✅ Connected to PostgreSQL successfully!")

    // ===== ADDED: RUN MIGRATIONS =====
    fmt.Println("🔄 Running database migrations...")
    err = db.AutoMigrate(
        &models.User{},
        &models.Topic{},
        &models.Post{},
        &models.Comment{},
        &models.Like{},
        &models.Tag{},
        &models.Follow{},
        &models.TopicFollow{},
        &models.SavedPost{},
        &models.Notification{},
        &models.Report{},
        &models.ActivityLog{},
    )
    if err != nil {
        log.Fatal("Failed to migrate database:", err)
    }
    fmt.Println("✅ Database migrations complete")
    // ===== END OF ADDED SECTION =====

    // Initialize repositories
    userRepo := repository.NewUserRepository(db)
    topicRepo := repository.NewTopicRepository(db)
    postRepo := repository.NewPostRepository(db)
    commentRepo := repository.NewCommentRepository(db)
    likeRepo := repository.NewLikeRepository(db)
    tagRepo := repository.NewTagRepository(db)

    // Initialize handlers
    authHandler := handlers.NewAuthHandler(userRepo)
    topicHandler := handlers.NewTopicHandler(topicRepo)
    postHandler := handlers.NewPostHandler(postRepo, topicRepo, tagRepo, db)
    commentHandler := handlers.NewCommentHandler(commentRepo, postRepo)
    likeHandler := handlers.NewLikeHandler(likeRepo, postRepo, commentRepo)

    // Setup router
    router := gin.Default()

    // CORS configuration
    corsConfig := cors.New(cors.Options{
        AllowedOrigins:   allowedOrigins,
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
        AllowedHeaders:   []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
        AllowCredentials: true,
        ExposedHeaders:   []string{"Content-Length"},
        MaxAge:           86400,
    })
    router.Use(func(c *gin.Context) {
        corsConfig.HandlerFunc(c.Writer, c.Request)
        c.Next()
    })

    // Public routes
    auth := router.Group("/api/auth")
    {
        auth.POST("/register", authHandler.Register)
        auth.POST("/login", authHandler.Login)
        auth.POST("/logout", authHandler.Logout)
        auth.GET("/me", middleware.OptionalAuthMiddleware(), authHandler.GetCurrentUser)
    }

    // Public routes
    router.GET("/api/topics", middleware.OptionalAuthMiddleware(), topicHandler.GetAllTopics)
    router.GET("/api/topics/:id", middleware.OptionalAuthMiddleware(), topicHandler.GetTopic)
    router.GET("/api/topics/:id/posts", middleware.OptionalAuthMiddleware(), postHandler.GetPostsByTopic)
    router.GET("/api/posts/:id", middleware.OptionalAuthMiddleware(), postHandler.GetPost)
    router.GET("/api/posts/:id/comments", middleware.OptionalAuthMiddleware(), commentHandler.GetCommentsByPost)
    router.GET("/api/popular-posts", postHandler.GetPopularPosts)
    router.GET("/api/recent-posts", postHandler.GetRecentPosts)

    // Protected routes
    api := router.Group("/api")
    api.Use(middleware.AuthMiddleware())
    {
        // Topics
        api.POST("/topics", topicHandler.CreateTopic)
        api.PUT("/topics/:id", topicHandler.UpdateTopic)
        api.DELETE("/topics/:id", topicHandler.DeleteTopic)

        // Posts
        api.POST("/topics/:id/posts", postHandler.CreatePost)
        api.PUT("/posts/:id", postHandler.UpdatePost)
        api.DELETE("/posts/:id", postHandler.DeletePost)
        api.POST("/posts/:id/pin", postHandler.TogglePin)
        api.POST("/posts/:id/lock", postHandler.ToggleLock)

        // Comments
        api.POST("/posts/:id/comments", commentHandler.CreateComment)
        api.PUT("/comments/:id", commentHandler.UpdateComment)
        api.DELETE("/comments/:id", commentHandler.DeleteComment)
        api.GET("/comments/:id/replies", commentHandler.GetReplies)

        // Likes
        api.POST("/posts/:id/like", likeHandler.TogglePostLike)
        api.POST("/comments/:id/like", likeHandler.ToggleCommentLike)
    }

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    fmt.Printf("🚀 Server starting on port %s\n", port)
    if err := router.Run(":" + port); err != nil {
        log.Fatal("Failed to start server:", err)
    }
}