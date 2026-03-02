package handlers

import (
    "communityHub/internal/auth"
    "communityHub/internal/models"
    "communityHub/internal/repository"
    "net/http"
    "os"
    "time"

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

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
    var req models.RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Check if user exists by email
    existingUser, _ := h.userRepo.FindByEmail(req.Email)
    if existingUser != nil {
        c.JSON(http.StatusConflict, gin.H{"error": "email already exists"})
        return
    }

    // Check if username exists
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
        Role:     "user",
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

    // Set cookie based on environment
    h.setAuthCookie(c, token)

    c.JSON(http.StatusCreated, gin.H{
        "message": "user created successfully",
        "user": gin.H{
            "id":       user.ID,
            "username": user.Username,
            "email":    user.Email,
            "role":     user.Role,
        },
        "token": token, // Return token for header-based auth
    })
}

// Login handles user login
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

    // Set cookie based on environment
    h.setAuthCookie(c, token)

    // Update last seen
    now := time.Now()
    user.LastSeen = &now
    h.userRepo.Update(user)

    c.JSON(http.StatusOK, gin.H{
        "message": "login successful",
        "user": gin.H{
            "id":       user.ID,
            "username": user.Username,
            "email":    user.Email,
            "role":     user.Role,
            "bio":      user.Bio,
            "avatar":   user.Avatar,
            "lastSeen": user.LastSeen,
        },
        "token": token, // Return token for header-based auth
    })
}

// Logout handles user logout
func (h *AuthHandler) Logout(c *gin.Context) {
    // Clear the auth cookie
    isProduction := os.Getenv("ENVIRONMENT") == "production"
    
    if isProduction {
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

// GetCurrentUser returns the currently authenticated user
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
    userIDStr, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
        return
    }

    userID, err := uuid.Parse(userIDStr.(string))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID"})
        return
    }

    user, err := h.userRepo.FindByID(userID)
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
            "lastSeen": user.LastSeen,
            "createdAt": user.CreatedAt,
        },
    })
}

// UpdateProfile updates user profile
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
    userIDStr, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
        return
    }

    userID, err := uuid.Parse(userIDStr.(string))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID"})
        return
    }

    var req models.UpdateProfileRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    user, err := h.userRepo.FindByID(userID)
    if err != nil || user == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
        return
    }

    // Update fields
    if req.Username != "" && req.Username != user.Username {
        // Check if username is taken
        existingUser, _ := h.userRepo.FindByUsername(req.Username)
        if existingUser != nil && existingUser.ID != user.ID {
            c.JSON(http.StatusConflict, gin.H{"error": "username already taken"})
            return
        }
        user.Username = req.Username
    }

    if req.Bio != "" {
        user.Bio = req.Bio
    }

    if req.Avatar != "" {
        user.Avatar = req.Avatar
    }

    if err := h.userRepo.Update(user); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "profile updated successfully",
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

// ChangePassword changes user password
func (h *AuthHandler) ChangePassword(c *gin.Context) {
    userIDStr, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
        return
    }

    userID, err := uuid.Parse(userIDStr.(string))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID"})
        return
    }

    var req struct {
        CurrentPassword string `json:"currentPassword" binding:"required"`
        NewPassword     string `json:"newPassword" binding:"required,min=6"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    user, err := h.userRepo.FindByID(userID)
    if err != nil || user == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
        return
    }

    // Verify current password
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)); err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "current password is incorrect"})
        return
    }

    // Hash new password
    hashedPassword, err := auth.HashPassword(req.NewPassword)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
        return
    }

    user.Password = hashedPassword
    if err := h.userRepo.Update(user); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update password"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "password changed successfully"})
}

// setAuthCookie sets the authentication cookie based on environment
func (h *AuthHandler) setAuthCookie(c *gin.Context, token string) {
    isProduction := os.Getenv("ENVIRONMENT") == "production"
    
    if isProduction {
        // For Render deployment - allow cross-subdomain cookies
        c.SetCookie(
            "auth_token",
            token,
            3600*24*7, // 7 days
            "/",
            ".onrender.com", // Dot allows all render subdomains
            true,            // Secure (HTTPS only)
            true,            // HttpOnly
        )
        
        // Also set SameSite=None explicitly for cross-site requests
        c.Header("Set-Cookie", "auth_token="+token+"; Path=/; Domain=.onrender.com; HttpOnly; Secure; SameSite=None; Max-Age=604800")
    } else {
        // For local development
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
}

// RefreshToken generates a new token for the user
func (h *AuthHandler) RefreshToken(c *gin.Context) {
    userIDStr, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
        return
    }

    userID, err := uuid.Parse(userIDStr.(string))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID"})
        return
    }

    user, err := h.userRepo.FindByID(userID)
    if err != nil || user == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
        return
    }

    // Generate new token
    token, err := auth.GenerateToken(user.ID.String(), user.Username, user.Email)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
        return
    }

    // Set new cookie
    h.setAuthCookie(c, token)

    c.JSON(http.StatusOK, gin.H{
        "message": "token refreshed successfully",
        "token": token,
    })
}