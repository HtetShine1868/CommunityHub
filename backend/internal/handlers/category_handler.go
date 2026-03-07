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
