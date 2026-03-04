package repository

import (
    "communityHub/internal/models"
    "time"
    "fmt"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type CommentRepository struct {
    db *gorm.DB
}

func NewCommentRepository(db *gorm.DB) *CommentRepository {
    return &CommentRepository{db: db}
}

// GetDB returns the database instance for direct queries
func (r *CommentRepository) GetDB() *gorm.DB {
    return r.db
}

func (r *CommentRepository) Create(comment *models.Comment) error {
    return r.db.Create(comment).Error
}

func (r *CommentRepository) FindByPost(postID uuid.UUID, page, pageSize int) ([]models.Comment, int64, error) {
    var comments []models.Comment
    var total int64

    // Get top-level comments only (no parent)
    query := r.db.Model(&models.Comment{}).
        Where("post_id = ? AND parent_id IS NULL", postID).
        Preload("User")

    err := query.Count(&total).Error
    if err != nil {
        return nil, 0, err
    }

    err = query.Offset((page - 1) * pageSize).
        Limit(pageSize).
        Order("is_pinned desc, created_at asc").
        Find(&comments).Error
    if err != nil {
        return nil, 0, err
    }

    // Load replies and counts for each comment
    for i := range comments {
        var replies []models.Comment
        r.db.Where("parent_id = ?", comments[i].ID).
            Preload("User").
            Order("created_at asc").
            Find(&replies)
        comments[i].Replies = replies
        comments[i].ReplyCount = int64(len(replies))
        
        var likeCount int64
        r.db.Model(&models.Like{}).Where("comment_id = ?", comments[i].ID).Count(&likeCount)
        comments[i].LikeCount = likeCount
        
        // Get like count for each reply
        for j := range replies {
            var replyLikeCount int64
            r.db.Model(&models.Like{}).Where("comment_id = ?", replies[j].ID).Count(&replyLikeCount)
            replies[j].LikeCount = replyLikeCount
        }
    }

    return comments, total, err
}

func (r *CommentRepository) FindReplies(commentID uuid.UUID, page, pageSize int) ([]models.Comment, int64, error) {
    var replies []models.Comment
    var total int64

    query := r.db.Model(&models.Comment{}).
        Where("parent_id = ?", commentID).
        Preload("User")

    err := query.Count(&total).Error
    if err != nil {
        return nil, 0, err
    }

    err = query.Offset((page - 1) * pageSize).
        Limit(pageSize).
        Order("created_at asc").
        Find(&replies).Error
    if err != nil {
        return nil, 0, err
    }

    for i := range replies {
        var likeCount int64
        r.db.Model(&models.Like{}).Where("comment_id = ?", replies[i].ID).Count(&likeCount)
        replies[i].LikeCount = likeCount
    }

    return replies, total, err
}

func (r *CommentRepository) FindByID(id uuid.UUID) (*models.Comment, error) {
    var comment models.Comment
    err := r.db.Preload("User").
        First(&comment, "id = ?", id).Error
    if err != nil {
        return nil, err
    }
    
    // Get like count
    var likeCount int64
    r.db.Model(&models.Like{}).Where("comment_id = ?", comment.ID).Count(&likeCount)
    comment.LikeCount = likeCount
    
    // Get reply count
    var replyCount int64
    r.db.Model(&models.Comment{}).Where("parent_id = ?", comment.ID).Count(&replyCount)
    comment.ReplyCount = replyCount
    
    // Get replies
    var replies []models.Comment
    r.db.Where("parent_id = ?", comment.ID).
        Preload("User").
        Order("created_at asc").
        Find(&replies)
    comment.Replies = replies
    
    return &comment, err
}

// ✅ FIXED: Update method for editing comment content
func (r *CommentRepository) Update(comment *models.Comment) error {
    // For editing content (when isEdited is true)
    if comment.IsEdited {
        now := time.Now()
        comment.EditedAt = &now
    }
    
    comment.UpdatedAt = time.Now()
    
    // Use Updates to only change specific fields
    result := r.db.Model(&models.Comment{}).Where("id = ?", comment.ID).Updates(map[string]interface{}{
        "content":      comment.Content,
        "content_html": comment.ContentHTML,
        "is_edited":    comment.IsEdited,
        "edited_at":    comment.EditedAt,
        "updated_at":   comment.UpdatedAt,
    })
    
    if result.Error != nil {
        fmt.Printf("Error updating comment: %v\n", result.Error)
        return result.Error
    }
    
    return nil
}

// ✅ NEW: Method specifically for toggling pin status
func (r *CommentRepository) TogglePin(id uuid.UUID) error {
    result := r.db.Model(&models.Comment{}).Where("id = ?", id).Update("is_pinned", gorm.Expr("NOT is_pinned"))
    
    if result.Error != nil {
        fmt.Printf("Error toggling pin: %v\n", result.Error)
        return result.Error
    }
    
    return nil
}

// ✅ NEW: Method for updating pin status directly
func (r *CommentRepository) UpdatePin(id uuid.UUID, isPinned bool) error {
    result := r.db.Model(&models.Comment{}).Where("id = ?", id).Updates(map[string]interface{}{
        "is_pinned":  isPinned,
        "updated_at": time.Now(),
    })
    
    if result.Error != nil {
        fmt.Printf("Error updating pin: %v\n", result.Error)
        return result.Error
    }
    
    return nil
}

func (r *CommentRepository) Delete(id uuid.UUID) error {
    // Delete all likes on this comment first
    r.db.Where("comment_id = ?", id).Delete(&models.Like{})
    // Delete all replies
    r.db.Where("parent_id = ?", id).Delete(&models.Comment{})
    // Delete the comment
    return r.db.Delete(&models.Comment{}, "id = ?", id).Error
}

func (r *CommentRepository) GetCommentCountForPost(postID uuid.UUID) (int64, error) {
    var count int64
    err := r.db.Model(&models.Comment{}).Where("post_id = ?", postID).Count(&count).Error
    return count, err
}