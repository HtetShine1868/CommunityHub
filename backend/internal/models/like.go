package models

import (
    "time"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type Like struct {
    ID        uuid.UUID  `gorm:"type:uuid;primary_key" json:"id"`
    UserID    uuid.UUID  `gorm:"column:user_id;not null;index" json:"userId"`
    PostID    *uuid.UUID `gorm:"column:post_id;index" json:"postId,omitempty"`
    CommentID *uuid.UUID `gorm:"column:comment_id;index" json:"commentId,omitempty"`
    CreatedAt time.Time  `gorm:"column:created_at" json:"createdAt"`
    DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index" json:"-"`
}

func (Like) TableName() string {
    return "likes"
}

// BeforeCreate - Generate UUID if not set
func (l *Like) BeforeCreate(tx *gorm.DB) error {
    if l.ID == uuid.Nil {
        l.ID = uuid.New()
        println("🔑 Generated new UUID for like:", l.ID.String())
    }
    return nil
}