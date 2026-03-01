package repository

import (
    "communityHub/internal/models"
    "errors"
    "fmt"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type UserRepository struct {
    db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
    return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *models.User) error {
    result := r.db.Create(user)
    if result.Error != nil {
        return fmt.Errorf("failed to create user: %w", result.Error)
    }
    return nil
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
    var user models.User
    err := r.db.Where("email = ?", email).First(&user).Error
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, nil
    }
    if err != nil {
        return nil, fmt.Errorf("failed to find user by email: %w", err)
    }
    return &user, nil
}

func (r *UserRepository) FindByUsername(username string) (*models.User, error) {
    var user models.User
    err := r.db.Where("username = ?", username).First(&user).Error
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, nil
    }
    if err != nil {
        return nil, fmt.Errorf("failed to find user by username: %w", err)
    }
    return &user, nil
}

func (r *UserRepository) FindByID(id uuid.UUID) (*models.User, error) {
    var user models.User
    err := r.db.First(&user, "id = ?", id).Error
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, nil
    }
    if err != nil {
        return nil, fmt.Errorf("failed to find user by ID: %w", err)
    }
    return &user, nil
}

func (r *UserRepository) Update(user *models.User) error {
    result := r.db.Save(user)
    if result.Error != nil {
        return fmt.Errorf("failed to update user: %w", result.Error)
    }
    return nil
}

func (r *UserRepository) Delete(id uuid.UUID) error {
    result := r.db.Delete(&models.User{}, "id = ?", id)
    if result.Error != nil {
        return fmt.Errorf("failed to delete user: %w", result.Error)
    }
    return nil
}