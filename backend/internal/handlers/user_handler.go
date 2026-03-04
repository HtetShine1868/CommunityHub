package handlers

import (
    "communityHub/internal/models"
    "communityHub/internal/repository"
    "net/http"
    "strconv"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
)

type UserHandler struct {
    userRepo    *repository.UserRepository
    postRepo    *repository.PostRepository
    commentRepo *repository.CommentRepository
    topicRepo   *repository.TopicRepository
}

func NewUserHandler(
    userRepo *repository.UserRepository,
    postRepo *repository.PostRepository,
    commentRepo *repository.CommentRepository,
    topicRepo *repository.TopicRepository,
) *UserHandler {
    return &UserHandler{
        userRepo:    userRepo,
        postRepo:    postRepo,
        commentRepo: commentRepo,
        topicRepo:   topicRepo,
    }
}

func (h *UserHandler) GetMyProfile(c *gin.Context) {
    userID := c.GetString("userID")
    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }

    uid, err := uuid.Parse(userID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
        return
    }

    user, err := h.userRepo.FindByID(uid)
    if err != nil || user == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
        return
    }

    var postCount, commentCount int64
    h.userRepo.GetDB().Model(&models.Post{}).Where("user_id = ?", uid).Count(&postCount)
    h.userRepo.GetDB().Model(&models.Comment{}).Where("user_id = ?", uid).Count(&commentCount)

    c.JSON(http.StatusOK, gin.H{
        "id":           user.ID,
        "username":     user.Username,
        "email":        user.Email,
        "bio":          user.Bio,
        "avatar":       user.Avatar,
        "role":         user.Role,
        "createdAt":    user.CreatedAt,
        "updatedAt":    user.UpdatedAt,
        "lastSeen":     user.LastSeen,
        "postCount":    postCount,
        "commentCount": commentCount,
    })
}

func (h *UserHandler) GetUserProfile(c *gin.Context) {
    userID := c.Param("userId")
    uid, err := uuid.Parse(userID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
        return
    }

    user, err := h.userRepo.FindByID(uid)
    if err != nil || user == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
        return
    }

    var postCount, commentCount int64
    h.userRepo.GetDB().Model(&models.Post{}).Where("user_id = ?", uid).Count(&postCount)
    h.userRepo.GetDB().Model(&models.Comment{}).Where("user_id = ?", uid).Count(&commentCount)

    c.JSON(http.StatusOK, gin.H{
        "id":           user.ID,
        "username":     user.Username,
        "bio":          user.Bio,
        "avatar":       user.Avatar,
        "role":         user.Role,
        "createdAt":    user.CreatedAt,
        "lastSeen":     user.LastSeen,
        "postCount":    postCount,
        "commentCount": commentCount,
    })
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
    userID := c.GetString("userID")
    uid, err := uuid.Parse(userID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
        return
    }

    var req struct {
        Username string `json:"username"`
        Bio      string `json:"bio"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    user, err := h.userRepo.FindByID(uid)
    if err != nil || user == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
        return
    }

    if req.Username != "" && req.Username != user.Username {
   
        existing, _ := h.userRepo.FindByUsername(req.Username)
        if existing != nil {
            c.JSON(http.StatusConflict, gin.H{"error": "username already taken"})
            return
        }
        user.Username = req.Username
    }

    user.Bio = req.Bio
    user.UpdatedAt = time.Now()

    if err := h.userRepo.Update(user); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "id":       user.ID,
        "username": user.Username,
        "email":    user.Email,
        "bio":      user.Bio,
        "avatar":   user.Avatar,
        "role":     user.Role,
    })
}

func (h *UserHandler) GetUserPosts(c *gin.Context) {
    userID := c.Param("userId")
    uid, err := uuid.Parse(userID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
        return
    }

    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

    var posts []models.Post
    var total int64

    h.userRepo.GetDB().Model(&models.Post{}).Where("user_id = ?", uid).Count(&total)

    err = h.userRepo.GetDB().
        Where("user_id = ?", uid).
        Preload("Topic").
        Preload("Tags").
        Order("is_pinned desc, created_at desc").
        Offset((page - 1) * pageSize).
        Limit(pageSize).
        Find(&posts).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch posts"})
        return
    }

    for i := range posts {
        var likeCount, commentCount int64
        h.userRepo.GetDB().Model(&models.Like{}).Where("post_id = ?", posts[i].ID).Count(&likeCount)
        h.userRepo.GetDB().Model(&models.Comment{}).Where("post_id = ?", posts[i].ID).Count(&commentCount)
        posts[i].LikeCount = likeCount
        posts[i].CommentCount = commentCount
    }

    c.JSON(http.StatusOK, gin.H{
        "data":     posts,
        "total":    total,
        "page":     page,
        "pageSize": pageSize,
    })
}

func (h *UserHandler) GetUserComments(c *gin.Context) {
    userID := c.Param("userId")
    uid, err := uuid.Parse(userID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
        return
    }

    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

    var comments []models.Comment
    var total int64

    h.userRepo.GetDB().Model(&models.Comment{}).Where("user_id = ?", uid).Count(&total)

    err = h.userRepo.GetDB().
        Where("user_id = ?", uid).
        Preload("Post").
        Preload("Post.Topic").
        Order("is_pinned desc, created_at desc").
        Offset((page - 1) * pageSize).
        Limit(pageSize).
        Find(&comments).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch comments"})
        return
    }

    for i := range comments {
        var likeCount int64
        h.userRepo.GetDB().Model(&models.Like{}).Where("comment_id = ?", comments[i].ID).Count(&likeCount)
        comments[i].LikeCount = likeCount
    }

    c.JSON(http.StatusOK, gin.H{
        "data":     comments,
        "total":    total,
        "page":     page,
        "pageSize": pageSize,
    })
}

func (h *UserHandler) GetUserStats(c *gin.Context) {
    userID := c.Param("userId")
    uid, err := uuid.Parse(userID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
        return
    }

    var postCount, commentCount, pinnedPostCount, pinnedCommentCount int64

    h.userRepo.GetDB().Model(&models.Post{}).Where("user_id = ?", uid).Count(&postCount)
    h.userRepo.GetDB().Model(&models.Comment{}).Where("user_id = ?", uid).Count(&commentCount)
    h.userRepo.GetDB().Model(&models.Post{}).Where("user_id = ? AND is_pinned = ?", uid, true).Count(&pinnedPostCount)
    h.userRepo.GetDB().Model(&models.Comment{}).Where("user_id = ? AND is_pinned = ?", uid, true).Count(&pinnedCommentCount)

    c.JSON(http.StatusOK, gin.H{
        "posts":           postCount,
        "comments":        commentCount,
        "pinnedPosts":     pinnedPostCount,
        "pinnedComments":  pinnedCommentCount,
        "joinedDate":      time.Now(), 
    })
}

func (h *UserHandler) GetPinnedPostsByTopic(c *gin.Context) {
    topicID := c.Param("topicId")
    tid, err := uuid.Parse(topicID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid topic ID"})
        return
    }

    var posts []models.Post
    err = h.userRepo.GetDB().
        Where("topic_id = ? AND is_pinned = ?", tid, true).
        Preload("User").
        Preload("Tags").
        Order("created_at desc").
        Find(&posts).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch pinned posts"})
        return
    }

    c.JSON(http.StatusOK, posts)
}

func (h *UserHandler) GetPinnedCommentsByPost(c *gin.Context) {
    postID := c.Param("postId")
    pid, err := uuid.Parse(postID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post ID"})
        return
    }

    var comments []models.Comment
    err = h.userRepo.GetDB().
        Where("post_id = ? AND is_pinned = ?", pid, true).
        Preload("User").
        Order("created_at asc").
        Find(&comments).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch pinned comments"})
        return
    }

    c.JSON(http.StatusOK, comments)
}