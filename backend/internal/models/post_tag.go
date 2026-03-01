package models

import (
    "time"
)

type PostTag struct {
    PostID    string    `gorm:"column:post_id;primaryKey"`
    TagID     string    `gorm:"column:tag_id;primaryKey"`
    CreatedAt time.Time `gorm:"column:created_at"`
}

func (PostTag) TableName() string {
    return "post_tags"
}