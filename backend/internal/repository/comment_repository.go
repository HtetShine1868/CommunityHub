package repository

import (
    "communityHub/internal/models"
    "time"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type CommentRepository struct {
    db *gorm.DB
}

func NewCommentRepository(db *gorm.DB) *CommentRepository {
    return &CommentRepository{db: db}
}

func (r *CommentRepository) Create(comment *models.Comment) error {
    return r.db.Create(comment).Error
}

func (r *CommentRepository) FindByPost(postID uuid.UUID, page, pageSize int) ([]models.Comment, int64, error) {
    var comments []models.Comment
    var total int64

    query := r.db.Model(&models.Comment{}).
        Where("post_id = ? AND parent_id IS NULL", postID).
        Preload("User")

    err := query.Count(&total).Error
    if err != nil {
        return nil, 0, err
    }

    err = query.Offset((page - 1) * pageSize).
        Limit(pageSize).
        Order("created_at asc").
        Find(&comments).Error
    if err != nil {
        return nil, 0, err
    }

    for i := range comments {
        var replies []models.Comment
        r.db.Where("parent_id = ?", comments[i].ID).
            Preload("User").
            Order("created_at asc").
            Find(&replies)
        comments[i].Replies = replies
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

    return replies, total, err
}

func (r *CommentRepository) FindByID(id uuid.UUID) (*models.Comment, error) {
    var comment models.Comment
    err := r.db.Preload("User").
        First(&comment, "id = ?", id).Error
    if err != nil {
        return nil, err
    }
 
    var replies []models.Comment
    r.db.Where("parent_id = ?", comment.ID).
        Preload("User").
        Order("created_at asc").
        Find(&replies)
    comment.Replies = replies
    
    return &comment, err
}

func (r *CommentRepository) Update(comment *models.Comment) error {
    comment.IsEdited = true
    now := time.Now()
    comment.EditedAt = &now
    return r.db.Save(comment).Error
}

func (r *CommentRepository) Delete(id uuid.UUID) error {

    r.db.Where("parent_id = ?", id).Delete(&models.Comment{})
    return r.db.Delete(&models.Comment{}, "id = ?", id).Error
}