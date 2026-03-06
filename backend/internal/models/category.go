package models

import (
    "time"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type Category struct {
    ID          uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
    Name        string         `gorm:"column:name;uniqueIndex;not null;size:100" json:"name"`
    Description string         `gorm:"column:description;type:text" json:"description"`
    Icon        string         `gorm:"column:icon;size:50" json:"icon"`
    Color       string         `gorm:"column:color;size:20" json:"color"`
    CreatedAt   time.Time      `gorm:"column:created_at" json:"createdAt"`
    UpdatedAt   time.Time      `gorm:"column:updated_at" json:"updatedAt"`
    DeletedAt   gorm.DeletedAt `gorm:"column:deleted_at;index" json:"-"`
}

func (Category) TableName() string {
    return "categories"
}

func (c *Category) BeforeCreate(tx *gorm.DB) error {
    if c.ID == uuid.Nil {
        c.ID = uuid.New()
    }
    return nil
}