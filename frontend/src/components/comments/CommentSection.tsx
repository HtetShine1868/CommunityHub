import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { commentService } from '../../services/comment.service';
import { likeService } from '../../services/like.service';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Comment } from '../../types/comment.types';
import CommentCard from './CommentCard';

interface CommentSectionProps {
  postId: string;
  onPinComment?: (commentId: string) => void;
  isPostAuthor?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  onPinComment,
  isPostAuthor = false,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const { addNotification } = useUIStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await commentService.getCommentsByPost(postId);
      setComments(response.data);
    } catch (error) {
      setError('Failed to load comments');
      addNotification({
        type: 'error',
        message: 'Failed to load comments',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      // ✅ Pass the actual text content, not an object
      await commentService.createComment(postId, { 
        content: newComment.trim() 
      });
      
      setNewComment('');
      await fetchComments(); // Refresh to show new comment
      addNotification({
        type: 'success',
        message: 'Comment posted!',
      });
    } catch (error) {
      console.error('Failed to post comment:', error);
      setError('Failed to post comment');
      addNotification({
        type: 'error',
        message: 'Failed to post comment',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!isAuthenticated) {
      addNotification({
        type: 'info',
        message: 'Please login to like comments',
      });
      return;
    }
    try {
      await likeService.toggleCommentLike(commentId);
      // Update local state instead of refetching all comments
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              liked: !comment.liked,
              likeCount: comment.liked ? (comment.likeCount - 1) : (comment.likeCount + 1)
            };
          }
          // Also check replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => {
                if (reply.id === commentId) {
                  return {
                    ...reply,
                    liked: !reply.liked,
                    likeCount: reply.liked ? (reply.likeCount - 1) : (reply.likeCount + 1)
                  };
                }
                return reply;
              })
            };
          }
          return comment;
        })
      );
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to like comment',
      });
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    if (!content.trim()) return;
    
    try {
      // ✅ Pass the actual text content
      await commentService.createComment(postId, { 
        content: content.trim(), 
        parentId: commentId 
      });
      
      await fetchComments(); // Refresh to show new reply
      addNotification({
        type: 'success',
        message: 'Reply posted!',
      });
    } catch (error) {
      setError('Failed to post reply');
      addNotification({
        type: 'error',
        message: 'Failed to post reply',
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentService.deleteComment(commentId);
      // Update local state
      setComments(prevComments => 
        prevComments.filter(comment => {
          if (comment.id === commentId) return false;
          if (comment.replies) {
            comment.replies = comment.replies.filter(reply => reply.id !== commentId);
          }
          return true;
        })
      );
      addNotification({
        type: 'success',
        message: 'Comment deleted',
      });
    } catch (error) {
      setError('Failed to delete comment');
      addNotification({
        type: 'error',
        message: 'Failed to delete comment',
      });
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    if (!content.trim()) return;
    
    try {
      await commentService.updateComment(commentId, { 
        content: content.trim() 
      });
      
      // Update local state
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, content, isEdited: true };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply.id === commentId ? { ...reply, content, isEdited: true } : reply
              )
            };
          }
          return comment;
        })
      );
      addNotification({
        type: 'success',
        message: 'Comment updated!',
      });
    } catch (error) {
      setError('Failed to update comment');
      addNotification({
        type: 'error',
        message: 'Failed to update comment',
      });
    }
  };

  const handlePin = async (commentId: string) => {
    if (onPinComment) {
      await onPinComment(commentId);
      await fetchComments();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Comments ({comments.length})
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {isAuthenticated ? (
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please login to comment
        </Alert>
      )}

      <Divider sx={{ mb: 2 }} />

      {comments.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No comments yet. Be the first to comment!
        </Typography>
      ) : (
        comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onLike={() => handleLike(comment.id)}
            onReply={(content) => handleReply(comment.id, content)}
            onDelete={() => handleDelete(comment.id)}
            onEdit={(content) => handleEdit(comment.id, content)}
            onPin={() => handlePin(comment.id)}
            currentUserId={user?.id}
            isPostAuthor={isPostAuthor}
          />
        ))
      )}
    </Box>
  );
};

export default CommentSection;