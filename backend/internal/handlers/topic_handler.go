package handlers

import (
    "communityHub/internal/models"
    "communityHub/internal/repository"
    "fmt"
    "net/http"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
)

type TopicHandler struct {
    topicRepo *repository.TopicRepository
}

func NewTopicHandler(topicRepo *repository.TopicRepository) *TopicHandler {
    return &TopicHandler{topicRepo: topicRepo}
}

func (h *TopicHandler) GetAllTopics(c *gin.Context) {
    topics, err := h.topicRepo.FindAll()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch topics"})
        return
    }

    c.JSON(http.StatusOK, topics)
}

func (h *TopicHandler) GetTopic(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid topic id"})
        return
    }

    topic, err := h.topicRepo.FindByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "topic not found"})
        return
    }

    c.JSON(http.StatusOK, topic)
}

func (h *TopicHandler) CreateTopic(c *gin.Context) {
    // Get user ID from context
    userIDInterface, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized - user ID not found in context"})
        return
    }

    // Convert to string
    userIDStr, ok := userIDInterface.(string)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID format in context"})
        return
    }

    // Parse UUID
    userID, err := uuid.Parse(userIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID format"})
        return
    }

    // Bind request
    var req struct {
        Title       string `json:"title" binding:"required"`
        Description string `json:"description"`
        Icon        string `json:"icon"`
        Color       string `json:"color"`
        IsPrivate   bool   `json:"isPrivate"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Create topic
    topic := &models.Topic{
        Title:       req.Title,
        Description: req.Description,
        Icon:        req.Icon,
        Color:       req.Color,
        IsPrivate:   req.IsPrivate,
        UserID:      userID,
    }

    // Save to database
    if err := h.topicRepo.Create(topic); err != nil {
        // Log the actual error
        fmt.Printf("Error creating topic: %v\n", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error":   "failed to create topic",
            "details": err.Error(),
        })
        return
    }

    c.JSON(http.StatusCreated, topic)
}

func (h *TopicHandler) UpdateTopic(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid topic id"})
        return
    }

    var req struct {
        Title       string `json:"title"`
        Description string `json:"description"`
        Icon        string `json:"icon"`
        Color       string `json:"color"`
        IsPrivate   bool   `json:"isPrivate"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    topic, err := h.topicRepo.FindByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "topic not found"})
        return
    }

    // Check ownership
    userID := c.GetString("userID")
    if topic.UserID.String() != userID {
        c.JSON(http.StatusForbidden, gin.H{"error": "you don't have permission to update this topic"})
        return
    }

    if req.Title != "" {
        topic.Title = req.Title
    }
    if req.Description != "" {
        topic.Description = req.Description
    }
    if req.Icon != "" {
        topic.Icon = req.Icon
    }
    if req.Color != "" {
        topic.Color = req.Color
    }
    topic.IsPrivate = req.IsPrivate

    if err := h.topicRepo.Update(topic); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update topic"})
        return
    }

    c.JSON(http.StatusOK, topic)
}

func (h *TopicHandler) DeleteTopic(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid topic id"})
        return
    }

    topic, err := h.topicRepo.FindByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "topic not found"})
        return
    }

    // Check ownership
    userID := c.GetString("userID")
    if topic.UserID.String() != userID {
        c.JSON(http.StatusForbidden, gin.H{"error": "you don't have permission to delete this topic"})
        return
    }

    if err := h.topicRepo.Delete(id); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete topic"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "topic deleted successfully"})
}