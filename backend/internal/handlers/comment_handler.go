package handlers

import (
    "communityHub/internal/models"
    "communityHub/internal/repository"
    "net/http"
    "strconv"
    "time"
    "fmt"
    "strings"
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
    // Log the incoming request
    fmt.Println("\n=== CreateComment called ===")
    
    // 1. Parse post ID
    postID, err := uuid.Parse(c.Param("id"))
    if err != nil {
        fmt.Printf("❌ Invalid post ID format: %v\n", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
        return
    }
    fmt.Printf("✅ Post ID: %s\n", postID)

    // 2. Verify post exists
    post, err := h.postRepo.FindByID(postID)
    if err != nil {
        fmt.Printf("❌ Post not found: %v\n", err)
        c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
        return
    }
    fmt.Printf("✅ Post found: %s (locked: %v)\n", post.ID, post.IsLocked)

    // 3. Check if post is locked
    if post.IsLocked {
        fmt.Println("❌ Post is locked")
        c.JSON(http.StatusForbidden, gin.H{"error": "this post is locked - no new comments allowed"})
        return
    }

    // 4. Parse request body
    var req struct {
        Content  string     `json:"content" binding:"required"`
        ParentID *uuid.UUID `json:"parentId"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        fmt.Printf("❌ Invalid request body: %v\n", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    fmt.Printf("✅ Request content length: %d, ParentID: %v\n", len(req.Content), req.ParentID)

    // 5. Get user ID from context
    userIDStr := c.GetString("userID")
    if userIDStr == "" {
        fmt.Println("❌ User ID not found in context")
        // Check all context keys for debugging
        fmt.Println("Context keys:")
        for _, key := range []string{"userID", "username", "email", "role"} {
            val, exists := c.Get(key)
            fmt.Printf("  %s: exists=%v, value=%v\n", key, exists, val)
        }
        c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
        return
    }
    fmt.Printf("✅ User ID string: %s\n", userIDStr)

    // 6. Parse user ID
    userID, err := uuid.Parse(userIDStr)
    if err != nil {
        fmt.Printf("❌ Invalid user ID format: %v\n", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
        return
    }
    fmt.Printf("✅ Parsed User ID: %s\n", userID)

    // 7. Create comment object
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
    fmt.Printf("✅ Comment object created: ID=%s, UserID=%s, PostID=%s\n", 
        comment.ID, comment.UserID, comment.PostID)

// 8. Save to database
fmt.Println("Attempting to save to database...")
if err := h.commentRepo.Create(comment); err != nil {
    fmt.Printf("❌ Database error: %v\n", err)
    // Check for specific database errors using strings.Contains
    if strings.Contains(err.Error(), "foreign key constraint") {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user or post reference"})
    } else if strings.Contains(err.Error(), "duplicate key") {
        c.JSON(http.StatusConflict, gin.H{"error": "comment already exists"})
    } else {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create comment"})
    }
    return
}

    // 9. Fetch the created comment with user data
    fmt.Println("Fetching created comment...")
    created, err := h.commentRepo.FindByID(comment.ID)
    if err != nil {
        fmt.Printf("❌ Failed to fetch created comment: %v\n", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "comment created but failed to fetch",
            "comment_id": comment.ID,
        })
        return
    }
    fmt.Printf("✅ Comment fetched successfully: ID=%s, User=%s\n", 
        created.ID, created.User.Username)

    c.JSON(http.StatusCreated, created)
}

// UpdateComment - Update a comment
func (h *CommentHandler) UpdateComment(c *gin.Context) {
    fmt.Println("\n========== UPDATE COMMENT DEBUG ==========")
    
    // 1. Parse comment ID
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        fmt.Printf("❌ Invalid comment ID: %v\n", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid comment id"})
        return
    }
    fmt.Printf("📌 Comment ID: %s\n", id)

    // 2. Parse request body
    var req struct {
        Content string `json:"content" binding:"required"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        fmt.Printf("❌ Invalid request body: %v\n", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    fmt.Printf("📝 Request content: %q (length: %d)\n", req.Content, len(req.Content))

    // 3. Get user info from context
    userID := c.GetString("userID")
    role := c.GetString("role")
    fmt.Printf("👤 UserID: %s, Role: %s\n", userID, role)

    // 4. Fetch the comment BEFORE update
    comment, err := h.commentRepo.FindByID(id)
    if err != nil {
        fmt.Printf("❌ Comment not found: %v\n", err)
        c.JSON(http.StatusNotFound, gin.H{"error": "comment not found"})
        return
    }
    fmt.Printf("✅ Found comment - BEFORE update:\n")
    fmt.Printf("   - ID: %s\n", comment.ID)
    fmt.Printf("   - Content: %q\n", comment.Content)
    fmt.Printf("   - Author ID: %s\n", comment.UserID.String())
    fmt.Printf("   - IsEdited: %v\n", comment.IsEdited)

    // 5. Check ownership
    if comment.UserID.String() != userID && role != "admin" && role != "moderator" {
        fmt.Printf("❌ Permission denied - User %s cannot edit comment by %s\n", userID, comment.UserID.String())
        c.JSON(http.StatusForbidden, gin.H{"error": "you don't have permission to update this comment"})
        return
    }
    fmt.Println("✅ Permission granted")

    // 6. Update the comment
    oldContent := comment.Content
    comment.Content = req.Content
    comment.IsEdited = true
    now := time.Now()
    comment.EditedAt = &now
    comment.UpdatedAt = now

    fmt.Printf("🔄 Updating content: %q -> %q\n", oldContent, comment.Content)
    fmt.Printf("   IsEdited set to: %v\n", comment.IsEdited)
    fmt.Printf("   EditedAt set to: %v\n", comment.EditedAt)
    fmt.Printf("   UpdatedAt set to: %v\n", comment.UpdatedAt)

    // 7. Log the update map that will be sent to database
    updateMap := map[string]interface{}{
        "content":    comment.Content,
        "is_edited":  comment.IsEdited,
        "edited_at":  comment.EditedAt,
        "updated_at": comment.UpdatedAt,
    }
    fmt.Printf("📦 Update map: %+v\n", updateMap)

    fmt.Println("💾 Saving to database...")

    // 8. Save to database
    if err := h.commentRepo.Update(comment); err != nil {
        fmt.Printf("❌ Database error: %v\n", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update comment"})
        return
    }
    fmt.Println("✅ Database update successful")

    // 9. Fetch the updated comment to verify
    updated, err := h.commentRepo.FindByID(id)
    if err != nil {
        fmt.Printf("⚠️ Warning: Could not fetch updated comment: %v\n", err)
        // Return the comment we have even if fetch fails
        c.JSON(http.StatusOK, comment)
        return
    }
    
    fmt.Printf("📤 AFTER update - Comment from database:\n")
    fmt.Printf("   - ID: %s\n", updated.ID)
    fmt.Printf("   - Content: %q\n", updated.Content)
    fmt.Printf("   - IsEdited: %v\n", updated.IsEdited)
    
    if updated.Content == oldContent {
        fmt.Println("⚠️ WARNING: Content did not change in database!")
    } else if updated.Content == id.String() {
        fmt.Println("⚠️ WARNING: Content was set to the comment ID!")
    } else {
        fmt.Println("✅ Content updated successfully!")
    }
    
    fmt.Println("==========================================\n")
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