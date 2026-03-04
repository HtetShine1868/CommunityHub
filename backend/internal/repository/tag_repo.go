package repository

import (
    "communityHub/internal/models"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type TagRepository struct {
    db *gorm.DB
}

func NewTagRepository(db *gorm.DB) *TagRepository {
    return &TagRepository{db: db}
}

func (r *TagRepository) FindOrCreate(name string) (*models.Tag, error) {
    var tag models.Tag
    err := r.db.Where("name = ?", name).First(&tag).Error

    if err == nil {
        return &tag, nil
    }

    if err == gorm.ErrRecordNotFound {
        tag = models.Tag{
            Name: name,
        }
        err = r.db.Create(&tag).Error
        return &tag, err
    }

    return nil, err
}

func (r *TagRepository) UpdatePostTags(postID string, tagNames []string) error {
  
    postUUID, err := uuid.Parse(postID)
    if err != nil {
        return err
    }

    tx := r.db.Begin()
    if tx.Error != nil {
        return tx.Error
    }

    if err := tx.Exec("DELETE FROM post_tags WHERE post_id = ?", postUUID).Error; err != nil {
        tx.Rollback()
        return err
    }

    for _, name := range tagNames {
        tag, err := r.FindOrCreate(name)
        if err != nil {
            tx.Rollback()
            return err
        }

        if err := tx.Exec("INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)", postUUID, tag.ID).Error; err != nil {
            tx.Rollback()
            return err
        }
    }

    return tx.Commit().Error
}