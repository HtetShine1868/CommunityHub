package handlers

import (
    "communityHub/internal/models"
    "communityHub/internal/repository"
    "fmt"
    "net/http"
    "strconv"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    "gorm.io/gorm"
)

type PostHandler struct {
    postRepo  *repository.PostRepository
    topicRepo *repository.TopicRepository
    tagRepo   *repository.TagRepository
    db        *gorm.DB
}

func NewPostHandler(postRepo *repository.PostRepository, topicRepo *repository.TopicRepository, tagRepo *repository.TagRepository, db *gorm.DB) *PostHandler {
    return &PostHandler{
        postRepo:  postRepo,
        topicRepo: topicRepo,
        tagRepo:   tagRepo,
        db:        db,
    }
}

// PostResponse represents a post with like information
type PostResponse struct {
    ID           string         `json:"id"`
    Title        string         `json:"title"`
    Content      string         `json:"content"`
    ViewCount    int            `json:"viewCount"`
    IsPinned     bool           `json:"isPinned"`
    IsLocked     bool           `json:"isLocked"`
    UserID       string         `json:"userId"`
    TopicID      string         `json:"topicId"`
    User         *models.User   `json:"user,omitempty"`
    Topic        *models.Topic  `json:"topic,omitempty"`
    Tags         []models.Tag   `json:"tags,omitempty"`
    LikeCount    int64          `json:"likeCount"`
    Liked        bool           `json:"liked"`
    CommentCount int64          `json:"commentCount"`
    CreatedAt    string         `json:"createdAt"`
    UpdatedAt    string         `json:"updatedAt"`
}

// GetPostsByTopic returns all posts for a specific topic with pagination
func (h *PostHandler) GetPostsByTopic(c *gin.Context) {
    topicID, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid topic id"})
        return
    }

    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

    posts, total, err := h.postRepo.FindByTopic(topicID, page, pageSize)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch posts"})
        return
    }

    // Get current user ID from context if authenticated
    userIDStr, exists := c.Get("userID")
    var currentUserID uuid.UUID
    if exists && userIDStr != nil {
        currentUserID, _ = uuid.Parse(userIDStr.(string))
    }

    // Build response with like info
    var postResponses []PostResponse
    for _, post := range posts {
        postResponses = append(postResponses, h.buildPostResponse(post, currentUserID))
    }

    c.JSON(http.StatusOK, gin.H{
        "data":       postResponses,
        "total":      total,
        "page":       page,
        "pageSize":   pageSize,
        "totalPages": (total + int64(pageSize) - 1) / int64(pageSize),
    })
}

// GetPost returns a single post by ID
func (h *PostHandler) GetPost(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
        return
    }

    // Increment view count
    h.postRepo.IncrementViewCount(id)

    post, err := h.postRepo.FindByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
        return
    }

    // Get current user ID from context if authenticated
    userIDStr, exists := c.Get("userID")
    var currentUserID uuid.UUID
    if exists && userIDStr != nil {
        currentUserID, _ = uuid.Parse(userIDStr.(string))
    }

    response := h.buildPostResponse(*post, currentUserID)
    c.JSON(http.StatusOK, response)
}

// CreatePost creates a new post
func (h *PostHandler) CreatePost(c *gin.Context) {
    topicID, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid topic id"})
        return
    }

    // Verify topic exists
    _, err = h.topicRepo.FindByID(topicID)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "topic not found"})
        return
    }

    var req struct {
        Title   string   `json:"title" binding:"required"`
        Content string   `json:"content" binding:"required"`
        Tags    []string `json:"tags"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    userIDStr, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }

    userID, err := uuid.Parse(userIDStr.(string))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
        return
    }

    post := &models.Post{
        Title:   req.Title,
        Content: req.Content,
        UserID:  userID,
        TopicID: topicID,
    }

    if err := h.postRepo.Create(post); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create post"})
        return
    }

    // Add tags if provided
    if len(req.Tags) > 0 {
        if err := h.tagRepo.UpdatePostTags(post.ID.String(), req.Tags); err != nil {
            fmt.Printf("Failed to add tags: %v\n", err)
        }
    }

    // Fetch the created post with relations
    post, _ = h.postRepo.FindByID(post.ID)

    response := h.buildPostResponse(*post, userID)
    c.JSON(http.StatusCreated, response)
}

// UpdatePost updates an existing post
func (h *PostHandler) UpdatePost(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
        return
    }

    var req struct {
        Title   string   `json:"title"`
        Content string   `json:"content"`
        Tags    []string `json:"tags"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    post, err := h.postRepo.FindByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
        return
    }

    // Check ownership
    userID := c.GetString("userID")
    if post.UserID.String() != userID {
        c.JSON(http.StatusForbidden, gin.H{"error": "you don't have permission to update this post"})
        return
    }

    if req.Title != "" {
        post.Title = req.Title
    }
    if req.Content != "" {
        post.Content = req.Content
    }

    if err := h.postRepo.Update(post); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update post"})
        return
    }

    // Update tags if provided
    if req.Tags != nil {
        if err := h.tagRepo.UpdatePostTags(post.ID.String(), req.Tags); err != nil {
            fmt.Printf("Failed to update tags: %v\n", err)
        }
    }

    // Fetch updated post with relations
    post, _ = h.postRepo.FindByID(post.ID)

    currentUserID, _ := uuid.Parse(userID)
    response := h.buildPostResponse(*post, currentUserID)
    c.JSON(http.StatusOK, response)
}

// DeletePost deletes a post
func (h *PostHandler) DeletePost(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
        return
    }

    post, err := h.postRepo.FindByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
        return
    }

    // Check ownership
    userID := c.GetString("userID")
    if post.UserID.String() != userID {
        c.JSON(http.StatusForbidden, gin.H{"error": "you don't have permission to delete this post"})
        return
    }

    if err := h.postRepo.Delete(id); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete post"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "post deleted successfully"})
}

func (h *PostHandler) TogglePin(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
        return
    }


    userRole := c.GetString("role")
    if userRole != "admin" && userRole != "moderator" {
        c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
        return
    }

    if err := h.postRepo.TogglePin(id); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to toggle pin"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "post pin toggled successfully"})
}

// ToggleLock locks or unlocks a post (admin/moderator only)
func (h *PostHandler) ToggleLock(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
        return
    }

   
    userRole := c.GetString("role")
    if userRole != "admin" && userRole != "moderator" {
        c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
        return
    }

    if err := h.postRepo.ToggleLock(id); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to toggle lock"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "post lock toggled successfully"})
}

func (h *PostHandler) GetPopularPosts(c *gin.Context) {
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

    posts, err := h.postRepo.GetPopularPosts(limit)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch popular posts"})
        return
    }

 
    userIDStr, exists := c.Get("userID")
    var currentUserID uuid.UUID
    if exists && userIDStr != nil {
        currentUserID, _ = uuid.Parse(userIDStr.(string))
    }

    var postResponses []PostResponse
    for _, post := range posts {
        postResponses = append(postResponses, h.buildPostResponse(post, currentUserID))
    }

    c.JSON(http.StatusOK, postResponses)
}

// GetRecentPosts returns the most recent posts
func (h *PostHandler) GetRecentPosts(c *gin.Context) {
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

    posts, err := h.postRepo.GetRecentPosts(limit)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch recent posts"})
        return
    }

    // Get current user ID from context if authenticated
    userIDStr, exists := c.Get("userID")
    var currentUserID uuid.UUID
    if exists && userIDStr != nil {
        currentUserID, _ = uuid.Parse(userIDStr.(string))
    }

    var postResponses []PostResponse
    for _, post := range posts {
        postResponses = append(postResponses, h.buildPostResponse(post, currentUserID))
    }

    c.JSON(http.StatusOK, postResponses)
}

// buildPostResponse creates a response with like information
func (h *PostHandler) buildPostResponse(post models.Post, currentUserID uuid.UUID) PostResponse {

    var likeCount int64
    h.db.Model(&models.Like{}).Where("post_id = ?", post.ID).Count(&likeCount)

    liked := false
    if currentUserID != uuid.Nil {
        var like models.Like
        err := h.db.Where("post_id = ? AND user_id = ?", post.ID, currentUserID).First(&like).Error
        liked = err == nil
    }


    var commentCount int64
    h.db.Model(&models.Comment{}).Where("post_id = ?", post.ID).Count(&commentCount)

    return PostResponse{
        ID:           post.ID.String(),
        Title:        post.Title,
        Content:      post.Content,
        ViewCount:    post.ViewCount,
        IsPinned:     post.IsPinned,
        IsLocked:     post.IsLocked,
        UserID:       post.UserID.String(),
        TopicID:      post.TopicID.String(),
        User:         &post.User,
        Topic:        &post.Topic,
        Tags:         post.Tags,
        LikeCount:    likeCount,
        Liked:        liked,
        CommentCount: commentCount,
        CreatedAt:    post.CreatedAt.Format(time.RFC3339),
        UpdatedAt:    post.UpdatedAt.Format(time.RFC3339),
    }
}