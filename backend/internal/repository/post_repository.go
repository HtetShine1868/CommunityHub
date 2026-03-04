package repository

import (
    "communityHub/internal/models"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type PostRepository struct {
    db *gorm.DB
}

func NewPostRepository(db *gorm.DB) *PostRepository {
    return &PostRepository{db: db}
}

func (r *PostRepository) Create(post *models.Post) error {
    return r.db.Create(post).Error
}

func (r *PostRepository) FindByTopic(topicID uuid.UUID, page, pageSize int) ([]models.Post, int64, error) {
    var posts []models.Post
    var total int64

    query := r.db.Model(&models.Post{}).
        Where("topic_id = ?", topicID).
        Preload("User").
        Preload("Topic")

    err := query.Count(&total).Error
    if err != nil {
        return nil, 0, err
    }

    err = query.Offset((page - 1) * pageSize).
        Limit(pageSize).
        Order("is_pinned desc, created_at desc").
        Find(&posts).Error

    return posts, total, err
}

func (r *PostRepository) FindByID(id uuid.UUID) (*models.Post, error) {
    var post models.Post
    err := r.db.Preload("User").
        Preload("Topic").
        First(&post, "id = ?", id).Error
    return &post, err
}

func (r *PostRepository) FindByUser(userID uuid.UUID, page, pageSize int) ([]models.Post, int64, error) {
    var posts []models.Post
    var total int64

    query := r.db.Model(&models.Post{}).
        Where("user_id = ?", userID).
        Preload("User").
        Preload("Topic").
        Preload("Tags").
        Order("created_at desc")

    err := query.Count(&total).Error
    if err != nil {
        return nil, 0, err
    }

    err = query.Offset((page - 1) * pageSize).
        Limit(pageSize).
        Order("created_at desc").
        Find(&posts).Error

    return posts, total, err
}

func (r *PostRepository) Update(post *models.Post) error {
    return r.db.Save(post).Error
}

func (r *PostRepository) Delete(id uuid.UUID) error {
    // Delete related comments first
    r.db.Where("post_id = ?", id).Delete(&models.Comment{})
    return r.db.Delete(&models.Post{}, "id = ?", id).Error
}

func (r *PostRepository) IncrementViewCount(id uuid.UUID) error {
    return r.db.Model(&models.Post{}).Where("id = ?", id).
        Update("view_count", gorm.Expr("view_count + 1")).Error
}

func (r *PostRepository) GetPopularPosts(limit int) ([]models.Post, error) {
    var posts []models.Post
    err := r.db.Preload("User").
        Preload("Topic").
        Order("view_count desc, created_at desc").
        Limit(limit).
        Find(&posts).Error
    return posts, err
}

func (r *PostRepository) GetRecentPosts(limit int) ([]models.Post, error) {
    var posts []models.Post
    err := r.db.Preload("User").
        Preload("Topic").
        Order("created_at desc").
        Limit(limit).
        Find(&posts).Error
    return posts, err
}

func (r *PostRepository) TogglePin(id uuid.UUID) error {
    return r.db.Model(&models.Post{}).Where("id = ?", id).
        Update("is_pinned", gorm.Expr("NOT is_pinned")).Error
}

func (r *PostRepository) ToggleLock(id uuid.UUID) error {
    return r.db.Model(&models.Post{}).Where("id = ?", id).
        Update("is_locked", gorm.Expr("NOT is_locked")).Error
}