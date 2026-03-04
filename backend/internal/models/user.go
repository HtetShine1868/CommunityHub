package models

import (
    "time"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type User struct {
    ID        uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"` // No default here, we'll generate in BeforeCreate
    Username  string         `gorm:"column:username;uniqueIndex;not null;size:255" json:"username"`
    Email     string         `gorm:"column:email;uniqueIndex;not null;size:255" json:"email"`
    Password  string         `gorm:"column:password;not null" json:"-"`
    Bio       string         `gorm:"column:bio;type:text" json:"bio"`
    Avatar    string         `gorm:"column:avatar;size:500" json:"avatar"`
    Role      string         `gorm:"column:role;default:'user';size:50" json:"role"`
    LastSeen  *time.Time     `gorm:"column:last_seen" json:"lastSeen"`
    CreatedAt time.Time      `gorm:"column:created_at" json:"createdAt"`
    UpdatedAt time.Time      `gorm:"column:updated_at" json:"updatedAt"`
    DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index" json:"-"`
}


func (u *User) BeforeCreate(tx *gorm.DB) error {
    if u.ID == uuid.Nil {
        u.ID = uuid.New()
    }
    return nil
}

func (User) TableName() string {
    return "users"
}

func (r *UserRepository) GetDB() *gorm.DB {
    return r.db
}