package models

import (
    "time"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type Tag struct {
    ID        uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
    Name      string    `gorm:"column:name;not null;unique" json:"name"`
    CreatedAt time.Time `gorm:"column:created_at" json:"createdAt"`
    UpdatedAt time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

func (Tag) TableName() string {
    return "tags"
}

// BeforeCreate - Generate UUID if not set
func (t *Tag) BeforeCreate(tx *gorm.DB) error {
    if t.ID == uuid.Nil {
        t.ID = uuid.New()
        println("🔑 Generated new UUID for tag:", t.ID.String())
    }
    return nil
}

func (t *Tag) BeforeUpdate(tx *gorm.DB) error {
    t.UpdatedAt = time.Now()
    return nil
}