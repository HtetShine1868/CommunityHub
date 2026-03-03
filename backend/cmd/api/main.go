package main

import (
    "communityHub/internal/handlers"
    "communityHub/internal/middleware"
    "communityHub/internal/repository"
    "fmt"
    "log"
    "os"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "github.com/rs/cors"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found, using environment variables")
    }

    // --- Database Connection ---
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

    // --- Repository Initialization ---
    userRepo := repository.NewUserRepository(db)
    topicRepo := repository.NewTopicRepository(db)
    postRepo := repository.NewPostRepository(db)
    commentRepo := repository.NewCommentRepository(db)
    likeRepo := repository.NewLikeRepository(db)
    tagRepo := repository.NewTagRepository(db)

    // --- Handler Initialization ---
    authHandler := handlers.NewAuthHandler(userRepo)
    topicHandler := handlers.NewTopicHandler(topicRepo)
    postHandler := handlers.NewPostHandler(postRepo, topicRepo, tagRepo, db)
    commentHandler := handlers.NewCommentHandler(commentRepo, postRepo)
    likeHandler := handlers.NewLikeHandler(likeRepo, postRepo, commentRepo)
    // ✅ NEW: Initialize the UserHandler for profile features
    userHandler := handlers.NewUserHandler(userRepo, postRepo, commentRepo)

    // --- Router Setup ---
    router := gin.Default()

    // --- CORS Configuration (Using rs/cors best practices) ---
    frontendURL := os.Getenv("FRONTEND_URL")
    // Provide a default if not set, but in production this should be your actual frontend URL
    if frontendURL == "" {
        // This is a fallback for local development. In production, always set FRONTEND_URL.
        frontendURL = "https://communityhub-1-ucxs.onrender.com"
    }

    // Build allowed origins list
    allowedOrigins := []string{
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        frontendURL,
    }
    // Allow adding more origins from environment variable
    if envOrigins := os.Getenv("ALLOWED_ORIGINS"); envOrigins != "" {
        allowedOrigins = append(allowedOrigins, strings.Split(envOrigins, ",")...)
    }

    // Create CORS handler with explicit options
    corsHandler := cors.New(cors.Options{
        AllowedOrigins:   allowedOrigins,
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
        AllowedHeaders:   []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
        ExposedHeaders:   []string{"Set-Cookie", "Content-Length"},
        AllowCredentials: true, // Required for cookies
        MaxAge:           86400, // 24 hours
    })

    // Apply CORS middleware
    router.Use(func(c *gin.Context) {
        corsHandler.HandlerFunc(c.Writer, c.Request)
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    })

    // --- API Routes ---

    // 1. Public routes (no authentication required)
    auth := router.Group("/api/auth")
    {
        auth.POST("/register", authHandler.Register)
        auth.POST("/login", authHandler.Login)
        auth.POST("/logout", authHandler.Logout)
        auth.GET("/me", middleware.OptionalAuthMiddleware(), authHandler.GetCurrentUser)
    }

    // Health check
    router.GET("/api/health", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "status":  "ok",
            "message": "Backend is running",
            "time":    time.Now().Unix(),
        })
    })

    // Public read-only routes (with optional auth for features like likes)
    router.GET("/api/topics", middleware.OptionalAuthMiddleware(), topicHandler.GetAllTopics)
    router.GET("/api/topics/:id", middleware.OptionalAuthMiddleware(), topicHandler.GetTopic)
    router.GET("/api/topics/:id/posts", middleware.OptionalAuthMiddleware(), postHandler.GetPostsByTopic)
    router.GET("/api/posts/:id", middleware.OptionalAuthMiddleware(), postHandler.GetPost)
    router.GET("/api/posts/:id/comments", middleware.OptionalAuthMiddleware(), commentHandler.GetCommentsByPost)
    router.GET("/api/popular-posts", postHandler.GetPopularPosts)
    router.GET("/api/recent-posts", postHandler.GetRecentPosts)

    // 2. Protected routes (require authentication)
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

    // 3. ✅ NEW: Profile & User-specific routes (protected)
    profile := router.Group("/api/user")
    profile.Use(middleware.AuthMiddleware())
    {
        profile.GET("/profile", userHandler.GetMyProfile)
        profile.PUT("/profile", userHandler.UpdateProfile)
        profile.POST("/avatar", userHandler.UploadAvatar)
        profile.POST("/change-password", userHandler.ChangePassword)
        profile.GET("/saved-posts", userHandler.GetSavedPosts)
        profile.GET("/liked-posts", userHandler.GetLikedPosts)
    }

    // 4. ✅ NEW: Public user routes (for viewing other users' profiles)
    users := router.Group("/api/users")
    {
        users.GET("/:userId/profile", userHandler.GetUserProfile)
        users.GET("/:userId/stats", userHandler.GetUserStats)
        users.GET("/:userId/posts", userHandler.GetUserPosts)
        users.GET("/:userId/comments", userHandler.GetUserComments)
        // Follow actions require authentication
        users.POST("/:userId/follow", middleware.AuthMiddleware(), userHandler.ToggleFollow)
        users.GET("/:userId/is-following", middleware.AuthMiddleware(), userHandler.IsFollowing)
    }

    // --- Start Server ---
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    fmt.Printf("🚀 Server starting on port %s\n", port)
    fmt.Printf("📝 API available at http://localhost:%s/api\n", port)
    fmt.Printf("🌐 Allowed origins: %v\n", allowedOrigins)

    if err := router.Run(":" + port); err != nil {
        log.Fatal("Failed to start server:", err)
    }
}