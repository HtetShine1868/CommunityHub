package handlers

import (
    "communityHub/internal/auth"
    "communityHub/internal/models"
    "communityHub/internal/repository"
    "net/http"
    "os"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    "golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
    userRepo *repository.UserRepository
}

func NewAuthHandler(userRepo *repository.UserRepository) *AuthHandler {
    return &AuthHandler{userRepo: userRepo}
}

func (h *AuthHandler) Register(c *gin.Context) {
    var req models.RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Check if user exists
    existingUser, _ := h.userRepo.FindByEmail(req.Email)
    if existingUser != nil {
        c.JSON(http.StatusConflict, gin.H{"error": "email already exists"})
        return
    }

    existingUser, _ = h.userRepo.FindByUsername(req.Username)
    if existingUser != nil {
        c.JSON(http.StatusConflict, gin.H{"error": "username already exists"})
        return
    }

    // Hash password
    hashedPassword, err := auth.HashPassword(req.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
        return
    }

    // Create user
    user := &models.User{
        Username: req.Username,
        Email:    req.Email,
        Password: hashedPassword,
    }

    if err := h.userRepo.Create(user); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
        return
    }

    // Generate token
    token, err := auth.GenerateToken(user.ID.String(), user.Username, user.Email)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
        return
    }

    // ✅ FIXED: Set cookie with proper domain for Render
    isProduction := os.Getenv("ENVIRONMENT") == "production"
    
    if isProduction {
        // For Render - allow all subdomains
        c.SetCookie(
            "auth_token",
            token,
            3600*24*7, // 7 days
            "/",
            ".onrender.com", // ⭐ Notice the dot - allows all render subdomains
            true,            // Secure (HTTPS only)
            true,            // HttpOnly
        )
        // Also set SameSite=None for cross-site requests
        c.Header("Set-Cookie", "auth_token="+token+"; Path=/; Domain=.onrender.com; HttpOnly; Secure; SameSite=None; Max-Age=604800")
    } else {
        // Local development
        c.SetCookie(
            "auth_token",
            token,
            3600*24*7,
            "/",
            "localhost",
            false,
            true,
        )
    }

    c.JSON(http.StatusCreated, gin.H{
        "message": "user created successfully",
        "user": gin.H{
            "id":       user.ID,
            "username": user.Username,
            "email":    user.Email,
        },
    })
}

func (h *AuthHandler) Login(c *gin.Context) {
    var req models.LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Find user by email
    user, err := h.userRepo.FindByEmail(req.Email)
    if err != nil || user == nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
        return
    }

    // Check password
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
        return
    }

    // Generate token
    token, err := auth.GenerateToken(user.ID.String(), user.Username, user.Email)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
        return
    }

    // ✅ FIXED: Set cookie with proper domain for Render
    isProduction := os.Getenv("ENVIRONMENT") == "production"
    
    if isProduction {
        // For Render - allow all subdomains
        c.SetCookie(
            "auth_token",
            token,
            3600*24*7, // 7 days
            "/",
            ".onrender.com", // ⭐ Notice the dot - allows all render subdomains
            true,            // Secure (HTTPS only)
            true,            // HttpOnly
        )
        // Also set SameSite=None for cross-site requests
        c.Header("Set-Cookie", "auth_token="+token+"; Path=/; Domain=.onrender.com; HttpOnly; Secure; SameSite=None; Max-Age=604800")
    } else {
        // Local development
        c.SetCookie(
            "auth_token",
            token,
            3600*24*7,
            "/",
            "localhost",
            false,
            true,
        )
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "login successful",
        "user": gin.H{
            "id":       user.ID,
            "username": user.Username,
            "email":    user.Email,
        },
    })
}

func (h *AuthHandler) Logout(c *gin.Context) {
    isProduction := os.Getenv("ENVIRONMENT") == "production"
    
    if isProduction {
        // Clear cookie for production
        c.SetCookie(
            "auth_token",
            "",
            -1,
            "/",
            ".onrender.com",
            true,
            true,
        )
    } else {
        // Clear cookie for local
        c.SetCookie(
            "auth_token",
            "",
            -1,
            "/",
            "localhost",
            false,
            true,
        )
    }
    
    c.JSON(http.StatusOK, gin.H{"message": "logout successful"})
}

func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
    userID := c.GetString("userID")
    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
        return
    }

    uid, err := uuid.Parse(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID"})
        return
    }

    user, err := h.userRepo.FindByID(uid)
    if err != nil || user == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "user": gin.H{
            "id":       user.ID,
            "username": user.Username,
            "email":    user.Email,
            "bio":      user.Bio,
            "avatar":   user.Avatar,
            "role":     user.Role,
        },
    })
}