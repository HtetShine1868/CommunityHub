package repository

import (
    "communityHub/internal/models"
    "errors"
    "fmt"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type TopicRepository struct {
    db *gorm.DB
}

func NewTopicRepository(db *gorm.DB) *TopicRepository {
    return &TopicRepository{db: db}
}

func (r *TopicRepository) Create(topic *models.Topic) error {

    if topic.ID == uuid.Nil {
        topic.ID = uuid.New()
    }

    result := r.db.Create(topic)
    if result.Error != nil {
        fmt.Printf("Database error in Create: %v\n", result.Error)
        return result.Error
    }

    r.db.Preload("User").First(topic, topic.ID)
    return nil
}

func (r *TopicRepository) FindAll() ([]models.Topic, error) {
    var topics []models.Topic
    err := r.db.Preload("User").Find(&topics).Error
    if err != nil {
        fmt.Printf("Database error in FindAll: %v\n", err)
        return nil, err
    }
    return topics, nil
}

func (r *TopicRepository) FindByID(id uuid.UUID) (*models.Topic, error) {
    var topic models.Topic
    err := r.db.Preload("User").Preload("Category").First(&topic, "id = ?", id).Error
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, errors.New("topic not found")
    }
    if err != nil {
        fmt.Printf("Database error in FindByID: %v\n", err)
        return nil, err
    }
    return &topic, nil
}

func (r *TopicRepository) Update(topic *models.Topic) error {
    result := r.db.Save(topic)
    if result.Error != nil {
        fmt.Printf("Database error in Update: %v\n", result.Error)
        return result.Error
    }
    return nil
}

func (r *TopicRepository) Delete(id uuid.UUID) error {
    result := r.db.Delete(&models.Topic{}, "id = ?", id)
    if result.Error != nil {
        fmt.Printf("Database error in Delete: %v\n", result.Error)
        return result.Error
    }
    if result.RowsAffected == 0 {
        return errors.New("topic not found")
    }
    return nil
}