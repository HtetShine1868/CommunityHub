package repository

import (
    "communityHub/internal/models"
    "errors"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type CategoryRepository struct {
    db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
    return &CategoryRepository{db: db}
}

func (r *CategoryRepository) Create(category *models.Category) error {
    return r.db.Create(category).Error
}

func (r *CategoryRepository) FindAll() ([]models.Category, error) {
    var categories []models.Category
    err := r.db.Find(&categories).Error
    return categories, err
}

func (r *CategoryRepository) FindByID(id uuid.UUID) (*models.Category, error) {
    var category models.Category
    err := r.db.First(&category, "id = ?", id).Error
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, nil
    }
    return &category, err
}

func (r *CategoryRepository) Update(category *models.Category) error {
    return r.db.Save(category).Error
}

func (r *CategoryRepository) Delete(id uuid.UUID) error {
    return r.db.Delete(&models.Category{}, "id = ?", id).Error
}

// GetDB returns database instance
func (r *CategoryRepository) GetDB() *gorm.DB {
    return r.db
}