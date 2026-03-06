package models

import (
    "time"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type Topic struct {
    ID          uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
    Title       string         `gorm:"column:title;not null;size:255" json:"title"`
    Description string         `gorm:"column:description" json:"description"`
    Icon        string         `gorm:"column:icon" json:"icon"`
    Banner      string         `gorm:"column:banner" json:"banner"`
    Color       string         `gorm:"column:color" json:"color"`
    IsPrivate   bool           `gorm:"column:is_private;default:false" json:"isPrivate"`
    CategoryID  *uuid.UUID     `gorm:"column:category_id;index" json:"categoryId"`
    UserID      uuid.UUID      `gorm:"column:user_id;not null;index" json:"userId"`
    CreatedAt   time.Time      `gorm:"column:created_at" json:"createdAt"`
    UpdatedAt   time.Time      `gorm:"column:updated_at" json:"updatedAt"`
    DeletedAt   gorm.DeletedAt `gorm:"column:deleted_at;index" json:"-"`
    
    User        User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
    Category    *Category      `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

func (Topic) TableName() string {
    return "topics"
}

func (t *Topic) BeforeCreate(tx *gorm.DB) error {
    if t.ID == uuid.Nil {
        t.ID = uuid.New()
        println("🔑 Generated new UUID for topic:", t.ID.String())
    }
    return nil
}

func (t *Topic) BeforeUpdate(tx *gorm.DB) error {
    t.UpdatedAt = time.Now()
    return nil
}