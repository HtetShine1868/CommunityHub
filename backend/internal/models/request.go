package models

import "github.com/google/uuid"

type RegisterRequest struct {
    Username string `json:"username" binding:"required,min=3,max=30"`
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}

type CreateTopicRequest struct {
    Title       string `json:"title" binding:"required"`
    Description string `json:"description"`
    Icon        string `json:"icon"`
    Color       string `json:"color"`
    IsPrivate   bool   `json:"isPrivate"`
}

type CreatePostRequest struct {
    Title   string   `json:"title" binding:"required"`
    Content string   `json:"content" binding:"required"`
    Tags    []string `json:"tags"`
}

type CreateCommentRequest struct {
    Content  string     `json:"content" binding:"required"`
    ParentID *uuid.UUID `json:"parentId"`
}