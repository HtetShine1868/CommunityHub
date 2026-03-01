package models

import (
    "time"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type Post struct {
    ID        uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
    Title     string         `gorm:"column:title;not null" json:"title"`
    Content   string         `gorm:"column:content;not null" json:"content"`     
    UserID    uuid.UUID      `gorm:"column:user_id;not null;index" json:"userId"`
    TopicID   uuid.UUID      `gorm:"column:topic_id;not null;index" json:"topicId"`
    ViewCount int            `gorm:"column:view_count;default:0" json:"viewCount"`
    IsPinned  bool           `gorm:"column:is_pinned;default:false" json:"isPinned"`
    IsLocked  bool           `gorm:"column:is_locked;default:false" json:"isLocked"`
    CreatedAt time.Time      `gorm:"column:created_at" json:"createdAt"`
    UpdatedAt time.Time      `gorm:"column:updated_at" json:"updatedAt"`
    DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index" json:"-"`
    
    // Relationships
    User     User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
    Topic    Topic     `gorm:"foreignKey:TopicID" json:"topic,omitempty"`
    Comments []Comment `json:"comments,omitempty"`
    Likes    []Like    `json:"likes,omitempty"`
	  Tags     []Tag     `gorm:"many2many:post_tags;" json:"tags,omitempty"`
}

func (Post) TableName() string {
    return "posts"
}

// BeforeCreate - Generate UUID if not set
func (p *Post) BeforeCreate(tx *gorm.DB) error {
    if p.ID == uuid.Nil {
        p.ID = uuid.New()
    }
    return nil
}

// BeforeUpdate - Update timestamp
func (p *Post) BeforeUpdate(tx *gorm.DB) error {
    p.UpdatedAt = time.Now()
    return nil
}