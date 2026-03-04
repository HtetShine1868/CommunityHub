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
      await commentService.createComment(postId, { content: newComment });
      setNewComment('');
      fetchComments();
      addNotification({
        type: 'success',
        message: 'Comment posted!',
      });
    } catch (error) {
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
      fetchComments();
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to like comment',
      });
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    try {
      await commentService.createComment(postId, { content, parentId: commentId });
      fetchComments();
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
      fetchComments();
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
    try {
      await commentService.updateComment(commentId, { content });
      fetchComments();
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
      fetchComments();
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