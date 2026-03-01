package middleware

import (
    "communityHub/internal/auth"
    "net/http"
    "strings"

    "github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Try to get token from cookie first
        token, err := c.Cookie("auth_token")
        
        // If no cookie, try Authorization header
        if err != nil || token == "" {
            authHeader := c.GetHeader("Authorization")
            if authHeader != "" {
                parts := strings.Split(authHeader, " ")
                if len(parts) == 2 && parts[0] == "Bearer" {
                    token = parts[1]
                }
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

        // Log for debugging
        println("✅ AuthMiddleware: User authenticated - ID:", claims.UserID, "Username:", claims.Username)

        // Set user info in context
        c.Set("userID", claims.UserID)
        c.Set("username", claims.Username)
        c.Next()
    }
}

func OptionalAuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token, _ := c.Cookie("auth_token")
        if token == "" {
            authHeader := c.GetHeader("Authorization")
            if authHeader != "" {
                parts := strings.Split(authHeader, " ")
                if len(parts) == 2 && parts[0] == "Bearer" {
                    token = parts[1]
                }
            }
        }

        if token != "" {
            claims, err := auth.ValidateToken(token)
            if err == nil {
                c.Set("userID", claims.UserID)
                c.Set("username", claims.Username)
            }
        }

        c.Next()
    }
}