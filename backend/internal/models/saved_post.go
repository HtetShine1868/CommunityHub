package models

import (
    "time"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type SavedPost struct {
    ID        uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
    UserID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"userId"`
    PostID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"postId"`
    CreatedAt time.Time      `json:"createdAt"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

    // Relationships
    User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
    Post *Post `gorm:"foreignKey:PostID" json:"post,omitempty"`
}

func (SavedPost) TableName() string {
    return "saved_posts"
}

func (s *SavedPost) BeforeCreate(tx *gorm.DB) error {
    if s.ID == uuid.Nil {
        s.ID = uuid.New()
    }
    return nil
}