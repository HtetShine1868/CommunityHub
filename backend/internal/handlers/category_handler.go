package handlers

import (
    "communityHub/internal/models"
    "communityHub/internal/repository"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
)

type CategoryHandler struct {
    categoryRepo *repository.CategoryRepository
}

func NewCategoryHandler(categoryRepo *repository.CategoryRepository) *CategoryHandler {
    return &CategoryHandler{categoryRepo: categoryRepo}
}

// GetAllCategories - Get all categories
func (h *CategoryHandler) GetAllCategories(c *gin.Context) {
    categories, err := h.categoryRepo.FindAll()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch categories"})
        return
    }
    c.JSON(http.StatusOK, categories)
}

// GetCategory - Get a single category
func (h *CategoryHandler) GetCategory(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category id"})
        return
    }

    category, err := h.categoryRepo.FindByID(id)
    if err != nil || category == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "category not found"})
        return
    }

    c.JSON(http.StatusOK, category)
}

// CreateCategory - Create a new category (admin only)
func (h *CategoryHandler) CreateCategory(c *gin.Context) {
    // Check if user is admin
    role := c.GetString("role")
    if role != "admin" {
        c.JSON(http.StatusForbidden, gin.H{"error": "only admins can create categories"})
        return
    }

    var req struct {
        Name        string `json:"name" binding:"required"`
        Description string `json:"description"`
        Icon        string `json:"icon"`
        Color       string `json:"color"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    category := &models.Category{
        Name:        req.Name,
        Description: req.Description,
        Icon:        req.Icon,
        Color:       req.Color,
        CreatedAt:   time.Now(),
        UpdatedAt:   time.Now(),
    }

    if err := h.categoryRepo.Create(category); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create category"})
        return
    }

    c.JSON(http.StatusCreated, category)
}

// UpdateCategory - Update a category (admin only)
func (h *CategoryHandler) UpdateCategory(c *gin.Context) {
    role := c.GetString("role")
    if role != "admin" {
        c.JSON(http.StatusForbidden, gin.H{"error": "only admins can update categories"})
        return
    }

    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category id"})
        return
    }

    category, err := h.categoryRepo.FindByID(id)
    if err != nil || category == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "category not found"})
        return
    }

    var req struct {
        Name        string `json:"name"`
        Description string `json:"description"`
        Icon        string `json:"icon"`
        Color       string `json:"color"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if req.Name != "" {
        category.Name = req.Name
    }
    if req.Description != "" {
        category.Description = req.Description
    }
    if req.Icon != "" {
        category.Icon = req.Icon
    }
    if req.Color != "" {
        category.Color = req.Color
    }
    category.UpdatedAt = time.Now()

    if err := h.categoryRepo.Update(category); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update category"})
        return
    }

    c.JSON(http.StatusOK, category)
}

// DeleteCategory - Delete a category (admin only)
func (h *CategoryHandler) DeleteCategory(c *gin.Context) {
    role := c.GetString("role")
    if role != "admin" {
        c.JSON(http.StatusForbidden, gin.H{"error": "only admins can delete categories"})
        return
    }

    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category id"})
        return
    }

    if err := h.categoryRepo.Delete(id); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete category"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "category deleted successfully"})
}