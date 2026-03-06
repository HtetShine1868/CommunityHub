package handlers

import (
    "communityHub/internal/models"
    "communityHub/internal/repository"
    "net/http"
    "strconv"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
)

type SearchHandler struct {
    postRepo    *repository.PostRepository
    topicRepo   *repository.TopicRepository
    userRepo    *repository.UserRepository
    categoryRepo *repository.CategoryRepository
}

func NewSearchHandler(
    postRepo *repository.PostRepository,
    topicRepo *repository.TopicRepository,
    userRepo *repository.UserRepository,
    categoryRepo *repository.CategoryRepository,
) *SearchHandler {
    return &SearchHandler{
        postRepo:    postRepo,
        topicRepo:   topicRepo,
        userRepo:    userRepo,
        categoryRepo: categoryRepo,
    }
}

type SearchFilters struct {
    Query      string   `form:"q"`
    Type       string   `form:"type"` // "posts", "topics", "users", "all"
    CategoryID string   `form:"categoryId"`
    Tags       []string `form:"tags"`
    SortBy     string   `form:"sortBy"` // "relevance", "latest", "popular", "mostLiked"
    TimeFilter string   `form:"time"`   // "today", "week", "month", "year", "all"
    Page       int      `form:"page,default=1"`
    PageSize   int      `form:"pageSize,default=20"`
}

type SearchResult struct {
    Posts      []models.Post         `json:"posts,omitempty"`
    Topics     []models.Topic        `json:"topics,omitempty"`
    Users      []models.User         `json:"users,omitempty"`
    TotalPosts int64                  `json:"totalPosts"`
    TotalTopics int64                 `json:"totalTopics"`
    TotalUsers int64                  `json:"totalUsers"`
    Page       int                    `json:"page"`
    PageSize   int                    `json:"pageSize"`
}

// Global Search
func (h *SearchHandler) Search(c *gin.Context) {
    var filters SearchFilters
    if err := c.ShouldBindQuery(&filters); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Set defaults
    if filters.Page < 1 {
        filters.Page = 1
    }
    if filters.PageSize < 1 || filters.PageSize > 100 {
        filters.PageSize = 20
    }

    result := SearchResult{
        Page:     filters.Page,
        PageSize: filters.PageSize,
    }

    // Apply time filter
    timeFilter := getTimeFilter(filters.TimeFilter)

    // Search based on type
    switch filters.Type {
    case "posts":
        posts, total, err := h.searchPosts(filters.Query, filters.CategoryID, filters.Tags, filters.SortBy, timeFilter, filters.Page, filters.PageSize)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to search posts"})
            return
        }
        result.Posts = posts
        result.TotalPosts = total

    case "topics":
        topics, total, err := h.searchTopics(filters.Query, filters.CategoryID, filters.SortBy, timeFilter, filters.Page, filters.PageSize)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to search topics"})
            return
        }
        result.Topics = topics
        result.TotalTopics = total

    case "users":
        users, total, err := h.searchUsers(filters.Query, filters.Page, filters.PageSize)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to search users"})
            return
        }
        result.Users = users
        result.TotalUsers = total

    default: // "all"
        posts, postsTotal, _ := h.searchPosts(filters.Query, filters.CategoryID, filters.Tags, filters.SortBy, timeFilter, filters.Page, filters.PageSize)
        topics, topicsTotal, _ := h.searchTopics(filters.Query, filters.CategoryID, filters.SortBy, timeFilter, filters.Page, filters.PageSize)
        users, usersTotal, _ := h.searchUsers(filters.Query, filters.Page, filters.PageSize)

        result.Posts = posts
        result.Topics = topics
        result.Users = users
        result.TotalPosts = postsTotal
        result.TotalTopics = topicsTotal
        result.TotalUsers = usersTotal
    }

    c.JSON(http.StatusOK, result)
}

// Search Posts
func (h *SearchHandler) searchPosts(query, categoryID string, tags []string, sortBy, timeFilter string, page, pageSize int) ([]models.Post, int64, error) {
    db := h.postRepo.GetDB().Model(&models.Post{}).Preload("User").Preload("Topic").Preload("Tags").Preload("Topic.Category")

    // Apply search query
    if query != "" {
        db = db.Where("title ILIKE ? OR content ILIKE ?", "%"+query+"%", "%"+query+"%")
    }

    // Apply category filter
    if categoryID != "" {
        if catID, err := uuid.Parse(categoryID); err == nil {
            db = db.Joins("JOIN topics ON posts.topic_id = topics.id").
                Where("topics.category_id = ?", catID)
        }
    }

    // Apply tags filter
    if len(tags) > 0 {
        db = db.Joins("JOIN post_tags ON post_tags.post_id = posts.id").
            Joins("JOIN tags ON tags.id = post_tags.tag_id").
            Where("tags.name IN ?", tags)
    }

    // Apply time filter
    if timeFilter != "" {
        db = db.Where("posts.created_at >= ?", timeFilter)
    }

    // Get total count
    var total int64
    if err := db.Count(&total).Error; err != nil {
        return nil, 0, err
    }

    // Apply sorting
    switch sortBy {
    case "popular":
        db = db.Order("posts.view_count DESC, posts.created_at DESC")
    case "mostLiked":
        db = db.Order("(SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) DESC, posts.created_at DESC")
    case "latest":
        db = db.Order("posts.created_at DESC")
    case "oldest":
        db = db.Order("posts.created_at ASC")
    default:
        if query != "" {
            // For relevance, we keep default ordering
            db = db.Order("posts.created_at DESC")
        } else {
            db = db.Order("posts.created_at DESC")
        }
    }

    // Apply pagination
    var posts []models.Post
    err := db.Offset((page - 1) * pageSize).Limit(pageSize).Find(&posts).Error

    // Get like counts
    for i := range posts {
        var likeCount int64
        h.postRepo.GetDB().Model(&models.Like{}).Where("post_id = ?", posts[i].ID).Count(&likeCount)
        posts[i].LikeCount = likeCount
    }

    return posts, total, err
}

// Search Topics
func (h *SearchHandler) searchTopics(query, categoryID string, sortBy, timeFilter string, page, pageSize int) ([]models.Topic, int64, error) {
    db := h.topicRepo.GetDB().Model(&models.Topic{}).Preload("User").Preload("Category")

    // Apply search query
    if query != "" {
        db = db.Where("title ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%")
    }

    // Apply category filter
    if categoryID != "" {
        if catID, err := uuid.Parse(categoryID); err == nil {
            db = db.Where("category_id = ?", catID)
        }
    }

    // Apply time filter
    if timeFilter != "" {
        db = db.Where("created_at >= ?", timeFilter)
    }

    // Get total count
    var total int64
    if err := db.Count(&total).Error; err != nil {
        return nil, 0, err
    }

    // Apply sorting
    switch sortBy {
    case "popular":
        db = db.Order("(SELECT COUNT(*) FROM posts WHERE posts.topic_id = topics.id) DESC, created_at DESC")
    case "latest":
        db = db.Order("created_at DESC")
    case "oldest":
        db = db.Order("created_at ASC")
    default:
        if query != "" {
            db = db.Order("created_at DESC")
        } else {
            db = db.Order("created_at DESC")
        }
    }

    // Apply pagination
    var topics []models.Topic
    err := db.Offset((page - 1) * pageSize).Limit(pageSize).Find(&topics).Error

    // Get post counts
    for i := range topics {
        var postCount int64
        h.topicRepo.GetDB().Model(&models.Post{}).Where("topic_id = ?", topics[i].ID).Count(&postCount)
        topics[i].PostCount = postCount
    }

    return topics, total, err
}

// Search Users
func (h *SearchHandler) searchUsers(query string, page, pageSize int) ([]models.User, int64, error) {
    db := h.userRepo.GetDB().Model(&models.User{})

    if query != "" {
        db = db.Where("username ILIKE ? OR email ILIKE ? OR bio ILIKE ?", 
            "%"+query+"%", "%"+query+"%", "%"+query+"%")
    }

    var total int64
    if err := db.Count(&total).Error; err != nil {
        return nil, 0, err
    }

    var users []models.User
    err := db.Offset((page - 1) * pageSize).Limit(pageSize).
        Order("username").
        Find(&users).Error

    return users, total, err
}

// Get Trending Posts
func (h *SearchHandler) GetTrending(c *gin.Context) {
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
    timeFrame := c.DefaultQuery("time", "week") // day, week, month

    var timeFilter string
    switch timeFrame {
    case "day":
        timeFilter = time.Now().AddDate(0, 0, -1).Format("2006-01-02")
    case "week":
        timeFilter = time.Now().AddDate(0, 0, -7).Format("2006-01-02")
    case "month":
        timeFilter = time.Now().AddDate(0, -1, 0).Format("2006-01-02")
    default:
        timeFilter = time.Now().AddDate(0, 0, -7).Format("2006-01-02")
    }

    var posts []models.Post
    err := h.postRepo.GetDB().
        Preload("User").
        Preload("Topic").
        Preload("Tags").
        Where("posts.created_at >= ?", timeFilter).
        Order("(SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) DESC").
        Order("posts.view_count DESC").
        Limit(limit).
        Find(&posts).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch trending posts"})
        return
    }

    c.JSON(http.StatusOK, posts)
}

// Get Popular Categories
func (h *SearchHandler) GetPopularCategories(c *gin.Context) {
    var categories []struct {
        models.Category
        TopicCount int64 `json:"topicCount"`
        PostCount  int64 `json:"postCount"`
    }

    err := h.categoryRepo.GetDB().
        Table("categories").
        Select("categories.*, COUNT(DISTINCT topics.id) as topic_count, COUNT(DISTINCT posts.id) as post_count").
        Joins("LEFT JOIN topics ON topics.category_id = categories.id").
        Joins("LEFT JOIN posts ON posts.topic_id = topics.id").
        Group("categories.id").
        Order("post_count DESC").
        Limit(10).
        Scan(&categories).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch popular categories"})
        return
    }

    c.JSON(http.StatusOK, categories)
}

// Helper function for time filter
func getTimeFilter(timeFilter string) string {
    switch timeFilter {
    case "today":
        return time.Now().AddDate(0, 0, -1).Format("2006-01-02")
    case "week":
        return time.Now().AddDate(0, 0, -7).Format("2006-01-02")
    case "month":
        return time.Now().AddDate(0, -1, 0).Format("2006-01-02")
    case "year":
        return time.Now().AddDate(-1, 0, 0).Format("2006-01-02")
    default:
        return ""
    }
}