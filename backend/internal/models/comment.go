package models

import (
    "time"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type Comment struct {
    ID        uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
    Content   string         `gorm:"column:content;not null" json:"content"`
    UserID    uuid.UUID      `gorm:"column:user_id;not null;index" json:"userId"`
    PostID    uuid.UUID      `gorm:"column:post_id;not null;index" json:"postId"`
    ParentID  *uuid.UUID     `gorm:"column:parent_id;index" json:"parentId,omitempty"`
    IsEdited  bool           `gorm:"column:is_edited;default:false" json:"isEdited"`
    EditedAt  *time.Time     `gorm:"column:edited_at" json:"editedAt,omitempty"`
    CreatedAt time.Time      `gorm:"column:created_at" json:"createdAt"`
    UpdatedAt time.Time      `gorm:"column:updated_at" json:"updatedAt"`
    DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index" json:"-"`
    
    // Relationships
    User    User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
    Replies []Comment `gorm:"foreignKey:ParentID" json:"replies,omitempty"`
}

func (Comment) TableName() string {
    return "comments"
}

// BeforeCreate - Generate UUID if not set
func (c *Comment) BeforeCreate(tx *gorm.DB) error {
    if c.ID == uuid.Nil {
        c.ID = uuid.New()
        println("🔑 Generated new UUID for comment:", c.ID.String())
    }
    return nil
}

// BeforeUpdate - Update timestamp
func (c *Comment) BeforeUpdate(tx *gorm.DB) error {
    c.UpdatedAt = time.Now()
    return nil
}