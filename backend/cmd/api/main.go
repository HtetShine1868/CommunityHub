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
 
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found, using environment variables")
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
    fmt.Println("Connected to PostgreSQL successfully!")

    userRepo := repository.NewUserRepository(db)
    topicRepo := repository.NewTopicRepository(db)
    postRepo := repository.NewPostRepository(db)
    commentRepo := repository.NewCommentRepository(db)
    likeRepo := repository.NewLikeRepository(db)
    tagRepo := repository.NewTagRepository(db)

    authHandler := handlers.NewAuthHandler(userRepo)
    topicHandler := handlers.NewTopicHandler(topicRepo)
    postHandler := handlers.NewPostHandler(postRepo, topicRepo, tagRepo, db)
    commentHandler := handlers.NewCommentHandler(commentRepo, postRepo)
    likeHandler := handlers.NewLikeHandler(likeRepo, postRepo, commentRepo)
    userHandler := handlers.NewUserHandler(userRepo, postRepo, commentRepo, topicRepo)

    router := gin.Default()
    frontendURL := os.Getenv("FRONTEND_URL")

    if frontendURL == "" {
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

    if envOrigins := os.Getenv("ALLOWED_ORIGINS"); envOrigins != "" {
        allowedOrigins = append(allowedOrigins, strings.Split(envOrigins, ",")...)
    }


    corsHandler := cors.New(cors.Options{
        AllowedOrigins:   allowedOrigins,
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
        AllowedHeaders:   []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
        ExposedHeaders:   []string{"Set-Cookie", "Content-Length"},
        AllowCredentials: true, 
        MaxAge:           86400, 
    })

    // CORS middleware
    router.Use(func(c *gin.Context) {
        corsHandler.HandlerFunc(c.Writer, c.Request)
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    })

    //Api routes

    auth := router.Group("/api/auth")
    {
        auth.POST("/register", authHandler.Register)
        auth.POST("/login", authHandler.Login)
        auth.POST("/logout", authHandler.Logout)
        auth.GET("/me", middleware.OptionalAuthMiddleware(), authHandler.GetCurrentUser)
    }
    router.GET("/api/health", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "status":  "ok",
            "message": "Backend is running",
            "time":    time.Now().Unix(),
        })
    })

    router.GET("/api/topics", middleware.OptionalAuthMiddleware(), topicHandler.GetAllTopics)
    router.GET("/api/topics/:id", middleware.OptionalAuthMiddleware(), topicHandler.GetTopic)
    router.GET("/api/topics/:id/posts", middleware.OptionalAuthMiddleware(), postHandler.GetPostsByTopic)
    router.GET("/api/posts/:id", middleware.OptionalAuthMiddleware(), postHandler.GetPost)
    router.GET("/api/posts/:id/comments", middleware.OptionalAuthMiddleware(), commentHandler.GetCommentsByPost)
    router.GET("/api/popular-posts", postHandler.GetPopularPosts)
    router.GET("/api/recent-posts", postHandler.GetRecentPosts)

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

        //Profile
        api.GET("/user/profile", userHandler.GetMyProfile)
        api.PUT("/user/profile", userHandler.UpdateProfile)
    }


    users := router.Group("/api/users")
    {
        users.GET("/:userId/profile", userHandler.GetUserProfile)
        users.GET("/:userId/stats", userHandler.GetUserStats)
        users.GET("/:userId/posts", userHandler.GetUserPosts)
        users.GET("/:userId/comments", userHandler.GetUserComments)

    }

    router.GET("/api/topics/:id/pinned-posts", userHandler.GetPinnedPostsByTopic)
    router.GET("/api/posts/:postId/pinned-comments", userHandler.GetPinnedCommentsByPost)


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