import { useState, useEffect, useCallback } from 'react';
import { commentService } from '../services/comment.service';
import { likeService } from '../services/like.service';
import { Comment, CreateCommentData, UpdateCommentData } from '../types/comment.types';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pinnedComments, setPinnedComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useUIStore();
  const { user } = useAuthStore();

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await commentService.getCommentsByPost(postId);
      setComments(response.data);
      
      // Also fetch pinned comments separately
      const pinned = await commentService.getPinnedComments(postId);
      setPinnedComments(pinned);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch comments';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  }, [postId, addNotification]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const createComment = async (data: CreateCommentData) => {
    setLoading(true);
    setError(null);
    try {
      const newComment = await commentService.createComment(postId, data);
      
      if (data.parentId) {
        // Add reply to parent comment
        setComments((prev) =>
          prev.map((c) =>
            c.id === data.parentId
              ? { ...c, replies: [...(c.replies || []), newComment] }
              : c
          )
        );
      } else {
        setComments((prev) => [...prev, newComment]);
      }
      
      addNotification({ type: 'success', message: 'Comment added!' });
      return newComment;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to add comment';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateComment = async (id: string, data: UpdateCommentData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await commentService.updateComment(id, data);
      
      const updateInTree = (commentsList: Comment[]): Comment[] => {
        return commentsList.map((c) => {
          if (c.id === id) return { ...c, ...updated, isEdited: true };
          if (c.replies) {
            return { ...c, replies: updateInTree(c.replies) };
          }
          return c;
        });
      };
      
      setComments(updateInTree(comments));
      addNotification({ type: 'success', message: 'Comment updated!' });
      return updated;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to update comment';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await commentService.deleteComment(id);
      
      const removeFromTree = (commentsList: Comment[]): Comment[] => {
        return commentsList
          .filter((c) => c.id !== id)
          .map((c) => ({
            ...c,
            replies: c.replies ? removeFromTree(c.replies) : [],
          }));
      };
      
      setComments(removeFromTree(comments));
      addNotification({ type: 'success', message: 'Comment deleted' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to delete comment';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (commentId: string) => {
    if (!user) {
      addNotification({ type: 'info', message: 'Please login to like comments' });
      return;
    }
    try {
      const { liked, count } = await likeService.toggleCommentLike(commentId);
      
      const updateLikeInTree = (commentsList: Comment[]): Comment[] => {
        return commentsList.map((c) => {
          if (c.id === commentId) {
            return { ...c, liked, likeCount: count };
          }
          if (c.replies) {
            return { ...c, replies: updateLikeInTree(c.replies) };
          }
          return c;
        });
      };
      
      setComments(updateLikeInTree(comments));
    } catch (err: any) {
      addNotification({ type: 'error', message: 'Failed to toggle like' });
    }
  };

  const togglePin = async (commentId: string) => {
    try {
      const { isPinned } = await commentService.togglePin(commentId);
      
      // Update in comments list
      const updatePinInTree = (commentsList: Comment[]): Comment[] => {
        return commentsList.map((c) => {
          if (c.id === commentId) {
            return { ...c, isPinned };
          }
          if (c.replies) {
            return { ...c, replies: updatePinInTree(c.replies) };
          }
          return c;
        });
      };
      
      setComments(updatePinInTree(comments));
      addNotification({ 
        type: 'success', 
        message: isPinned ? 'Comment pinned!' : 'Comment unpinned!' 
      });
    } catch (err: any) {
      addNotification({ type: 'error', message: 'Failed to toggle pin' });
    }
  };

  return {
    comments,
    pinnedComments,
    loading,
    error,
    createComment,
    updateComment,
    deleteComment,
    toggleLike,
    togglePin,
    refresh: fetchComments,
  };
};