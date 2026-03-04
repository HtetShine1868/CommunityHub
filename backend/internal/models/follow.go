package models

import (
    "time"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type Follow struct {
    ID          uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
    FollowerID  uuid.UUID      `gorm:"type:uuid;not null;index;uniqueIndex:idx_follow" json:"followerId"`
    FollowingID uuid.UUID      `gorm:"type:uuid;not null;index;uniqueIndex:idx_follow" json:"followingId"`
    CreatedAt   time.Time      `json:"createdAt"`
    DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

    // Relationships
    Follower  User `gorm:"foreignKey:FollowerID" json:"follower,omitempty"`
    Following User `gorm:"foreignKey:FollowingID" json:"following,omitempty"`
}

func (Follow) TableName() string {
    return "follows"
}

func (f *Follow) BeforeCreate(tx *gorm.DB) error {
    if f.ID == uuid.Nil {
        f.ID = uuid.New()
    }
    return nil
}