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
      console.log('📝 Submitting comment - raw input:', newComment);
      
      const commentData = {
        content: newComment.trim()
      };
      
      console.log('📤 Sending data:', commentData);
      
      const createdComment = await commentService.createComment(postId, commentData);
      
      console.log('✅ Server response:', createdComment);
      
      setNewComment('');
      await fetchComments();
      
      addNotification({
        type: 'success',
        message: 'Comment posted!',
      });
    } catch (error) {
      console.error('❌ Failed to post comment:', error);
      setError('Failed to post comment');
      addNotification({
        type: 'error',
        message: 'Failed to post comment',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    console.log('📝 handleReply received:', { commentId, content });
    
    if (!content || !content.trim()) {
      console.log('❌ Empty content, returning');
      return;
    }
    
    try {
      console.log('📤 Sending reply data:', {
        content: content.trim(),
        parentId: commentId
      });
      
      const replyData = {
        content: content.trim(),
        parentId: commentId
      };
      
      const createdReply = await commentService.createComment(postId, replyData);
      
      console.log('✅ Reply created:', createdReply);
      
      await fetchComments();
      
      addNotification({
        type: 'success',
        message: 'Reply posted!',
      });
    } catch (error) {
      console.error('❌ Failed to post reply:', error);
      setError('Failed to post reply');
      addNotification({
        type: 'error',
        message: 'Failed to post reply',
      });
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    console.log('📝 handleEdit received:', { commentId, content });
    
    if (!content.trim()) return;
    
    try {
      console.log('📤 Sending edit data:', {
        content: content.trim()
      });
      
      const editData = {
        content: content.trim()
      };
      
      const updatedComment = await commentService.updateComment(commentId, editData);
      
      console.log('✅ Comment updated:', updatedComment);
      
      // Update local state optimistically
      const updateCommentInTree = (commentsList: Comment[]): Comment[] => {
        return commentsList.map(c => {
          if (c.id === commentId) {
            return { ...c, content: content.trim(), isEdited: true };
          }
          if (c.replies) {
            return { ...c, replies: updateCommentInTree(c.replies) };
          }
          return c;
        });
      };
      
      setComments(updateCommentInTree(comments));
      
      addNotification({
        type: 'success',
        message: 'Comment updated!',
      });
    } catch (error) {
      console.error('❌ Failed to update comment:', error);
      setError('Failed to update comment');
      addNotification({
        type: 'error',
        message: 'Failed to update comment',
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    
    try {
      console.log('🗑️ Deleting comment:', commentId);
      
      await commentService.deleteComment(commentId);
      
      console.log('✅ Comment deleted');
      
      // Update local state
      const removeCommentFromTree = (commentsList: Comment[]): Comment[] => {
        return commentsList
          .filter(c => c.id !== commentId)
          .map(c => ({
            ...c,
            replies: c.replies ? removeCommentFromTree(c.replies) : []
          }));
      };
      
      setComments(removeCommentFromTree(comments));
      
      addNotification({
        type: 'success',
        message: 'Comment deleted',
      });
    } catch (error) {
      console.error('❌ Failed to delete comment:', error);
      setError('Failed to delete comment');
      addNotification({
        type: 'error',
        message: 'Failed to delete comment',
      });
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
      
      // Update local state optimistically
      const updateLikeInTree = (commentsList: Comment[]): Comment[] => {
        return commentsList.map(c => {
          if (c.id === commentId) {
            const newLiked = !c.liked;
            return { 
              ...c, 
              liked: newLiked, 
              likeCount: newLiked ? (c.likeCount + 1) : (c.likeCount - 1) 
            };
          }
          if (c.replies) {
            return { ...c, replies: updateLikeInTree(c.replies) };
          }
          return c;
        });
      };
      
      setComments(updateLikeInTree(comments));
    } catch (error) {
      console.error('❌ Failed to like comment:', error);
      addNotification({
        type: 'error',
        message: 'Failed to like comment',
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
            onLike={handleLike}
            onReply={handleReply}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onPin={handlePin}
            currentUserId={user?.id}
            isPostAuthor={isPostAuthor}
          />
        ))
      )}
    </Box>
  );
};

export default CommentSection;