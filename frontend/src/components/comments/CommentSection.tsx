import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import { commentService } from '../../services/comment.service';
import { likeService } from '../../services/like.service';
import { useAuthStore } from '../../store/authStore';
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
  isPostAuthor = false 
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      const response = await commentService.getCommentsByPost(postId);
      setComments(response.data);
    } catch (error) {
      setError('Failed to load comments');
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await commentService.createComment(postId, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (error) {
      setError('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!isAuthenticated) return;
    try {
      await likeService.toggleCommentLike(commentId);
      fetchComments(); // Refresh to show updated likes
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    try {
      await commentService.createComment(postId, { content, parentId: commentId });
      fetchComments();
    } catch (error) {
      setError('Failed to post reply');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentService.deleteComment(commentId);
      fetchComments();
    } catch (error) {
      setError('Failed to delete comment');
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    try {
      await commentService.updateComment(commentId, { content });
      fetchComments();
    } catch (error) {
      setError('Failed to update comment');
    }
  };

  const handlePin = async (commentId: string) => {
    if (onPinComment) {
      await onPinComment(commentId);
      fetchComments();
    }
  };

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
            disabled={loading || !newComment.trim()}
          >
            Post Comment
          </Button>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please login to comment
        </Alert>
      )}

      <Divider sx={{ mb: 2 }} />

      {comments.map((comment) => (
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
      ))}
    </Box>
  );
};

export default CommentSection;