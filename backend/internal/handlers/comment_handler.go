package handlers

import (
    "communityHub/internal/models"
    "communityHub/internal/repository"
    "net/http"
    "strconv"
    "time"
    "fmt"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
)

type CommentHandler struct {
    commentRepo *repository.CommentRepository
    postRepo    *repository.PostRepository
}

func NewCommentHandler(commentRepo *repository.CommentRepository, postRepo *repository.PostRepository) *CommentHandler {
    return &CommentHandler{
        commentRepo: commentRepo,
        postRepo:    postRepo,
    }
}

// GetCommentsByPost - Get comments for a post
func (h *CommentHandler) GetCommentsByPost(c *gin.Context) {
    postID, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
        return
    }

    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

    comments, total, err := h.commentRepo.FindByPost(postID, page, pageSize)
    if err != nil {
        fmt.Printf("Error fetching comments: %v\n", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch comments"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "data":       comments,
        "total":      total,
        "page":       page,
        "pageSize":   pageSize,
        "totalPages": (total + int64(pageSize) - 1) / int64(pageSize),
    })
}

// CreateComment - Create a new comment
func (h *CommentHandler) CreateComment(c *gin.Context) {
    postID, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
        return
    }

    // Verify post exists
    post, err := h.postRepo.FindByID(postID)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
        return
    }

    var req struct {
        Content  string     `json:"content" binding:"required"`
        ParentID *uuid.UUID `json:"parentId"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    userIDStr := c.GetString("userID")
    if userIDStr == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
        return
    }

    userID, err := uuid.Parse(userIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
        return
    }

    comment := &models.Comment{
        ID:        uuid.New(),
        Content:   req.Content,
        UserID:    userID,
        PostID:    postID,
        ParentID:  req.ParentID,
        IsPinned:  false,
        IsEdited:  false,
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
    }

    if err := h.commentRepo.Create(comment); err != nil {
        fmt.Printf("Error creating comment: %v\n", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create comment"})
        return
    }

    // Fetch the created comment with user data
    created, err := h.commentRepo.FindByID(comment.ID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "comment created but failed to fetch"})
        return
    }

    c.JSON(http.StatusCreated, created)
}

// UpdateComment - Update a comment
func (h *CommentHandler) UpdateComment(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid comment id"})
        return
    }

    var req struct {
        Content string `json:"content" binding:"required"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    comment, err := h.commentRepo.FindByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "comment not found"})
        return
    }

    // Check ownership
    userID := c.GetString("userID")
    role := c.GetString("role")
    
    if comment.UserID.String() != userID && role != "admin" && role != "moderator" {
        c.JSON(http.StatusForbidden, gin.H{"error": "you don't have permission to update this comment"})
        return
    }

    comment.Content = req.Content
    comment.IsEdited = true
    now := time.Now()
    comment.EditedAt = &now
    comment.UpdatedAt = time.Now()

    if err := h.commentRepo.Update(comment); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update comment"})
        return
    }

    // Return updated comment with user data
    updated, _ := h.commentRepo.FindByID(id)
    c.JSON(http.StatusOK, updated)
}

// DeleteComment - Delete a comment
func (h *CommentHandler) DeleteComment(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid comment id"})
        return
    }

    comment, err := h.commentRepo.FindByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "comment not found"})
        return
    }

    // Check ownership
    userID := c.GetString("userID")
    role := c.GetString("role")
    
    if comment.UserID.String() != userID && role != "admin" && role != "moderator" {
        c.JSON(http.StatusForbidden, gin.H{"error": "you don't have permission to delete this comment"})
        return
    }

    if err := h.commentRepo.Delete(id); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete comment"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "comment deleted successfully"})
}

// GetReplies - Get replies to a comment
func (h *CommentHandler) GetReplies(c *gin.Context) {
    commentID, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid comment id"})
        return
    }

    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

    replies, total, err := h.commentRepo.FindReplies(commentID, page, pageSize)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch replies"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "data":       replies,
        "total":      total,
        "page":       page,
        "pageSize":   pageSize,
        "totalPages": (total + int64(pageSize) - 1) / int64(pageSize),
    })
}

// PinComment - Pin/unpin a comment (post owner only)
func (h *CommentHandler) PinComment(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid comment id"})
        return
    }

    // Get the comment to check permissions
    comment, err := h.commentRepo.FindByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "comment not found"})
        return
    }

    // Get the post to check ownership
    post, err := h.postRepo.FindByID(comment.PostID)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
        return
    }

    // Check if current user is the post creator
    userID := c.GetString("userID")
    role := c.GetString("role")
    
    fmt.Printf("PinComment - UserID: %s, Role: %s, Post Owner: %s\n", userID, role, post.UserID.String())
    
    if post.UserID.String() != userID && role != "admin" && role != "moderator" {
        c.JSON(http.StatusForbidden, gin.H{"error": "only the post creator or admin can pin comments"})
        return
    }

    // Toggle pin status
    comment.IsPinned = !comment.IsPinned
    comment.UpdatedAt = time.Now()

    if err := h.commentRepo.Update(comment); err != nil {
        fmt.Printf("Error updating pin: %v\n", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update comment pin status"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message":  "comment pin status updated",
        "isPinned": comment.IsPinned,
    })
}

// GetPinnedComments - Get pinned comments for a post
func (h *CommentHandler) GetPinnedComments(c *gin.Context) {
    postID, err := uuid.Parse(c.Param("postId"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
        return
    }

    var comments []models.Comment
    err = h.commentRepo.GetDB().
        Where("post_id = ? AND is_pinned = ?", postID, true).
        Preload("User").
        Order("created_at asc").
        Find(&comments).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch pinned comments"})
        return
    }

    c.JSON(http.StatusOK, comments)
}