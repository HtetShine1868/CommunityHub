package repository

import (
    "communityHub/internal/models"
    "errors"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type LikeRepository struct {
    db *gorm.DB
}

func NewLikeRepository(db *gorm.DB) *LikeRepository {
    return &LikeRepository{db: db}
}

func (r *LikeRepository) TogglePostLike(userID, postID uuid.UUID) (bool, error) {
    var like models.Like
    err := r.db.Where("user_id = ? AND post_id = ?", userID, postID).First(&like).Error

    if errors.Is(err, gorm.ErrRecordNotFound) {
        // Create like
        like = models.Like{
            UserID: userID,
            PostID: &postID,
        }
        return true, r.db.Create(&like).Error
    }

    // Delete like
    return false, r.db.Delete(&like).Error
}

func (r *LikeRepository) ToggleCommentLike(userID, commentID uuid.UUID) (bool, error) {
    var like models.Like
    err := r.db.Where("user_id = ? AND comment_id = ?", userID, commentID).First(&like).Error

    if errors.Is(err, gorm.ErrRecordNotFound) {
        // Create like
        like = models.Like{
            UserID:    userID,
            CommentID: &commentID,
        }
        return true, r.db.Create(&like).Error
    }

    // Delete like
    return false, r.db.Delete(&like).Error
}

func (r *LikeRepository) GetPostLikeCount(postID uuid.UUID) (int64, error) {
    var count int64
    err := r.db.Model(&models.Like{}).Where("post_id = ?", postID).Count(&count).Error
    return count, err
}

func (r *LikeRepository) GetCommentLikeCount(commentID uuid.UUID) (int64, error) {
    var count int64
    err := r.db.Model(&models.Like{}).Where("comment_id = ?", commentID).Count(&count).Error
    return count, err
}