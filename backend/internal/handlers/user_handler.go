package handlers

import (
    "communityHub/internal/models"
    "communityHub/internal/repository"
    "net/http"
    "os"
    "path/filepath"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    "golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
    userRepo    *repository.UserRepository
    postRepo    *repository.PostRepository
    commentRepo *repository.CommentRepository
}

func NewUserHandler(
    userRepo *repository.UserRepository,
    postRepo *repository.PostRepository,
    commentRepo *repository.CommentRepository,
) *UserHandler {
    return &UserHandler{
        userRepo:    userRepo,
        postRepo:    postRepo,
        commentRepo: commentRepo,
    }
}

// GetMyProfile - Get current user's profile
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

    // Get counts
    var postCount, commentCount, followerCount, followingCount int64
    h.userRepo.db.Model(&models.Post{}).Where("user_id = ?", uid).Count(&postCount)
    h.userRepo.db.Model(&models.Comment{}).Where("user_id = ?", uid).Count(&commentCount)
    h.userRepo.db.Model(&models.Follow{}).Where("following_id = ?", uid).Count(&followerCount)
    h.userRepo.db.Model(&models.Follow{}).Where("follower_id = ?", uid).Count(&followingCount)

    c.JSON(http.StatusOK, gin.H{
        "id":             user.ID,
        "username":       user.Username,
        "email":          user.Email,
        "bio":            user.Bio,
        "avatar":         user.Avatar,
        "role":           user.Role,
        "createdAt":      user.CreatedAt,
        "updatedAt":      user.UpdatedAt,
        "lastSeen":       user.LastSeen,
        "postCount":      postCount,
        "commentCount":   commentCount,
        "followerCount":  followerCount,
        "followingCount": followingCount,
    })
}

// GetUserProfile - Get another user's profile by ID
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

    // Get counts
    var postCount, commentCount, followerCount, followingCount int64
    h.userRepo.db.Model(&models.Post{}).Where("user_id = ?", uid).Count(&postCount)
    h.userRepo.db.Model(&models.Comment{}).Where("user_id = ?", uid).Count(&commentCount)
    h.userRepo.db.Model(&models.Follow{}).Where("following_id = ?", uid).Count(&followerCount)
    h.userRepo.db.Model(&models.Follow{}).Where("follower_id = ?", uid).Count(&followingCount)

    // Check if current user is following this user
    isFollowing := false
    currentUserID := c.GetString("userID")
    if currentUserID != "" {
        currUID, _ := uuid.Parse(currentUserID)
        var count int64
        h.userRepo.db.Model(&models.Follow{}).
            Where("follower_id = ? AND following_id = ?", currUID, uid).
            Count(&count)
        isFollowing = count > 0
    }

    c.JSON(http.StatusOK, gin.H{
        "id":             user.ID,
        "username":       user.Username,
        "bio":            user.Bio,
        "avatar":         user.Avatar,
        "role":           user.Role,
        "createdAt":      user.CreatedAt,
        "lastSeen":       user.LastSeen,
        "postCount":      postCount,
        "commentCount":   commentCount,
        "followerCount":  followerCount,
        "followingCount": followingCount,
        "isFollowing":    isFollowing,
    })
}

// UpdateProfile - Update user profile
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
        // Check if username is taken
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

// UploadAvatar - Upload user avatar
func (h *UserHandler) UploadAvatar(c *gin.Context) {
    userID := c.GetString("userID")
    uid, err := uuid.Parse(userID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
        return
    }

    file, err := c.FormFile("avatar")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "no file uploaded"})
        return
    }

    // Validate file type
    ext := filepath.Ext(file.Filename)
    if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".gif" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid file type"})
        return
    }

    // Generate filename
    filename := userID + ext
    uploadDir := "uploads/avatars"
    if err := os.MkdirAll(uploadDir, 0755); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create upload directory"})
        return
    }

    filepath := filepath.Join(uploadDir, filename)
    if err := c.SaveUploadedFile(file, filepath); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
        return
    }

    // Update user avatar in database
    user, err := h.userRepo.FindByID(uid)
    if err != nil || user == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
        return
    }

    avatarURL := "/uploads/avatars/" + filename
    user.Avatar = avatarURL
    user.UpdatedAt = time.Now()

    if err := h.userRepo.Update(user); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update avatar"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "avatarUrl": avatarURL,
    })
}

// ChangePassword - Change user password
func (h *UserHandler) ChangePassword(c *gin.Context) {
    userID := c.GetString("userID")
    uid, err := uuid.Parse(userID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
        return
    }

    var req struct {
        CurrentPassword string `json:"currentPassword" binding:"required"`
        NewPassword     string `json:"newPassword" binding:"required,min=6"`
        ConfirmPassword string `json:"confirmPassword" binding:"required"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if req.NewPassword != req.ConfirmPassword {
        c.JSON(http.StatusBadRequest, gin.H{"error": "passwords do not match"})
        return
    }

    user, err := h.userRepo.FindByID(uid)
    if err != nil || user == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
        return
    }

    // Verify current password
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)); err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "current password is incorrect"})
        return
    }

    // Hash new password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
        return
    }

    user.Password = string(hashedPassword)
    user.UpdatedAt = time.Now()

    if err := h.userRepo.Update(user); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update password"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "password changed successfully"})
}

// GetUserPosts - Get posts by user
func (h *UserHandler) GetUserPosts(c *gin.Context) {
    userID := c.Param("userId")
    uid, err := uuid.Parse(userID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
        return
    }

    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

    posts, total, err := h.postRepo.FindByUser(uid, page, pageSize)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch posts"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "data":  posts,
        "total": total,
        "page":  page,
        "pageSize": pageSize,
    })
}

// GetUserComments - Get comments by user
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

    query := h.userRepo.db.Model(&models.Comment{}).
        Where("user_id = ?", uid).
        Preload("Post").
        Preload("Post.Topic").
        Order("created_at desc")

    query.Count(&total)
    err = query.Offset((page-1)*pageSize).Limit(pageSize).Find(&comments).Error
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch comments"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "data":  comments,
        "total": total,
        "page":  page,
        "pageSize": pageSize,
    })
}

// GetUserStats - Get user statistics
func (h *UserHandler) GetUserStats(c *gin.Context) {
    userID := c.Param("userId")
    uid, err := uuid.Parse(userID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
        return
    }

    var postCount, commentCount, followerCount, followingCount, likeCount int64

    h.userRepo.db.Model(&models.Post{}).Where("user_id = ?", uid).Count(&postCount)
    h.userRepo.db.Model(&models.Comment{}).Where("user_id = ?", uid).Count(&commentCount)
    h.userRepo.db.Model(&models.Follow{}).Where("following_id = ?", uid).Count(&followerCount)
    h.userRepo.db.Model(&models.Follow{}).Where("follower_id = ?", uid).Count(&followingCount)
    
    // Count likes received on user's posts
    h.userRepo.db.Model(&models.Like{}).
        Joins("JOIN posts ON posts.id = likes.post_id").
        Where("posts.user_id = ?", uid).
        Count(&likeCount)

    c.JSON(http.StatusOK, gin.H{
        "posts":    postCount,
        "comments": commentCount,
        "followers": followerCount,
        "following": followingCount,
        "likes":    likeCount,
        "joinedDate": time.Now(), // You might want to get this from user record
        "lastActive": time.Now(),
    })
}

// ToggleFollow - Follow/unfollow a user
func (h *UserHandler) ToggleFollow(c *gin.Context) {
    followerID := c.GetString("userID")
    followingID := c.Param("userId")

    if followerID == followingID {
        c.JSON(http.StatusBadRequest, gin.H{"error": "cannot follow yourself"})
        return
    }

    followerUID, _ := uuid.Parse(followerID)
    followingUID, err := uuid.Parse(followingID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
        return
    }

    // Check if already following
    var count int64
    h.userRepo.db.Model(&models.Follow{}).
        Where("follower_id = ? AND following_id = ?", followerUID, followingUID).
        Count(&count)

    if count > 0 {
        // Unfollow
        h.userRepo.db.Where("follower_id = ? AND following_id = ?", followerUID, followingUID).
            Delete(&models.Follow{})
        
        var newCount int64
        h.userRepo.db.Model(&models.Follow{}).Where("following_id = ?", followingUID).Count(&newCount)
        
        c.JSON(http.StatusOK, gin.H{
            "following": false,
            "followerCount": newCount,
        })
    } else {
        // Follow
        follow := &models.Follow{
            FollowerID:  followerUID,
            FollowingID: followingUID,
        }
        if err := h.userRepo.db.Create(follow).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to follow user"})
            return
        }

        var newCount int64
        h.userRepo.db.Model(&models.Follow{}).Where("following_id = ?", followingUID).Count(&newCount)
        
        c.JSON(http.StatusOK, gin.H{
            "following": true,
            "followerCount": newCount,
        })
    }
}

// IsFollowing - Check if current user is following another user
func (h *UserHandler) IsFollowing(c *gin.Context) {
    followerID := c.GetString("userID")
    followingID := c.Param("userId")

    if followerID == "" {
        c.JSON(http.StatusOK, gin.H{"following": false})
        return
    }

    followerUID, _ := uuid.Parse(followerID)
    followingUID, err := uuid.Parse(followingID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
        return
    }

    var count int64
    h.userRepo.db.Model(&models.Follow{}).
        Where("follower_id = ? AND following_id = ?", followerUID, followingUID).
        Count(&count)

    c.JSON(http.StatusOK, gin.H{"following": count > 0})
}

// GetSavedPosts - Get user's saved posts
func (h *UserHandler) GetSavedPosts(c *gin.Context) {
    userID := c.GetString("userID")
    uid, err := uuid.Parse(userID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
        return
    }

    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

    var savedPosts []models.SavedPost
    var total int64

    query := h.userRepo.db.Model(&models.SavedPost{}).
        Where("user_id = ?", uid).
        Preload("Post").
        Preload("Post.User").
        Preload("Post.Topic").
        Order("created_at desc")

    query.Count(&total)
    err = query.Offset((page-1)*pageSize).Limit(pageSize).Find(&savedPosts).Error
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch saved posts"})
        return
    }

    // Extract posts from saved posts
    posts := make([]models.Post, len(savedPosts))
    for i, saved := range savedPosts {
        posts[i] = saved.Post
    }

    c.JSON(http.StatusOK, gin.H{
        "data":  posts,
        "total": total,
        "page":  page,
        "pageSize": pageSize,
    })
}

// GetLikedPosts - Get user's liked posts
func (h *UserHandler) GetLikedPosts(c *gin.Context) {
    userID := c.GetString("userID")
    uid, err := uuid.Parse(userID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
        return
    }

    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

    var likes []models.Like
    var total int64

    query := h.userRepo.db.Model(&models.Like{}).
        Where("user_id = ? AND post_id IS NOT NULL", uid).
        Preload("Post").
        Preload("Post.User").
        Preload("Post.Topic").
        Order("created_at desc")

    query.Count(&total)
    err = query.Offset((page-1)*pageSize).Limit(pageSize).Find(&likes).Error
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch liked posts"})
        return
    }

    // Extract posts from likes
    posts := make([]models.Post, len(likes))
    for i, like := range likes {
        posts[i] = *like.Post
    }

    c.JSON(http.StatusOK, gin.H{
        "data":  posts,
        "total": total,
        "page":  page,
        "pageSize": pageSize,
    })
}