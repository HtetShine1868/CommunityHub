package middleware

import (
    "communityHub/internal/auth"
    "net/http"
    "strings"

    "github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        var token string

        // Try to get token from Authorization header first (most reliable)
        authHeader := c.GetHeader("Authorization")
        if authHeader != "" {
            parts := strings.Split(authHeader, " ")
            if len(parts) == 2 && parts[0] == "Bearer" {
                token = parts[1]
            }
        }

        // If no header, try cookie
        if token == "" {
            cookieToken, err := c.Cookie("auth_token")
            if err == nil && cookieToken != "" {
                token = cookieToken
            }
        }

        if token == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized - no token"})
            return
        }

        // Validate token
        claims, err := auth.ValidateToken(token)
        if err != nil {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
            return
        }

        // Set user info in context
        c.Set("userID", claims.UserID)
        c.Set("username", claims.Username)
        c.Set("email", claims.Email)
        c.Next()
    }
}

func OptionalAuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        var token string

        // Try Authorization header
        authHeader := c.GetHeader("Authorization")
        if authHeader != "" {
            parts := strings.Split(authHeader, " ")
            if len(parts) == 2 && parts[0] == "Bearer" {
                token = parts[1]
            }
        }

        // Try cookie
        if token == "" {
            cookieToken, _ := c.Cookie("auth_token")
            token = cookieToken
        }

        if token != "" {
            claims, err := auth.ValidateToken(token)
            if err == nil {
                c.Set("userID", claims.UserID)
                c.Set("username", claims.Username)
                c.Set("email", claims.Email)
            }
        }

        c.Next()
    }
}