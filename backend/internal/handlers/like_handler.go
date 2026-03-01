package handlers

import (
    "communityHub/internal/repository"
    "net/http"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
)

type LikeHandler struct {
    likeRepo    *repository.LikeRepository
    postRepo    *repository.PostRepository
    commentRepo *repository.CommentRepository
}

func NewLikeHandler(likeRepo *repository.LikeRepository, postRepo *repository.PostRepository, commentRepo *repository.CommentRepository) *LikeHandler {
    return &LikeHandler{
        likeRepo:    likeRepo,
        postRepo:    postRepo,
        commentRepo: commentRepo,
    }
}

func (h *LikeHandler) TogglePostLike(c *gin.Context) {
    postID, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
        return
    }

    // Check if post exists
    _, err = h.postRepo.FindByID(postID)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
        return
    }

    userID, _ := uuid.Parse(c.GetString("userID"))
    liked, err := h.likeRepo.TogglePostLike(userID, postID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to toggle like"})
        return
    }

    // Get updated like count
    likeCount, _ := h.likeRepo.GetPostLikeCount(postID)

    c.JSON(http.StatusOK, gin.H{
        "liked": liked,
        "count": likeCount,
    })
}

func (h *LikeHandler) ToggleCommentLike(c *gin.Context) {
    commentID, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid comment id"})
        return
    }

    // Check if comment exists
    _, err = h.commentRepo.FindByID(commentID)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "comment not found"})
        return
    }

    userID, _ := uuid.Parse(c.GetString("userID"))
    liked, err := h.likeRepo.ToggleCommentLike(userID, commentID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to toggle like"})
        return
    }

    // Get updated like count
    likeCount, _ := h.likeRepo.GetCommentLikeCount(commentID)

    c.JSON(http.StatusOK, gin.H{
        "liked": liked,
        "count": likeCount,
    })
}