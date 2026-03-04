import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  IconButton,
  Divider,
  Avatar,
  Breadcrumbs,
  Link as MuiLink,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Favorite,
  FavoriteBorder,
  Lock,
  PushPin,
  Edit,
  Delete,
  Comment,
  Visibility,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { postService } from '../services/post.service';
import { commentService } from '../services/comment.service';
import { likeService } from '../services/like.service';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { Post } from '../types/post.types';
import CommentSection from '../components/comments/CommentSection';
import EditPostModal from '../components/posts/EditPostModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useUIStore();
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchPost = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await postService.getPostById(id);
      setPost(data);
      setLikeCount(data.likeCount);
      setLiked(data.liked || false);
    } catch (error) {
      console.error('Failed to fetch post:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load post',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!id || !isAuthenticated) {
      addNotification({
        type: 'info',
        message: 'Please login to like posts',
      });
      return;
    }
    try {
      const { liked: newLiked, count } = await likeService.togglePostLike(id);
      setLiked(newLiked);
      setLikeCount(count);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to like post',
      });
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postService.deletePost(id);
      addNotification({
        type: 'success',
        message: 'Post deleted successfully',
      });
      navigate(`/topics/${post?.topicId}`);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to delete post',
      });
    }
  };

  const handlePin = async () => {
    if (!id) return;
    try {
      await postService.togglePin(id);
      setPost(prev => prev ? { ...prev, isPinned: !prev.isPinned } : null);
      addNotification({
        type: 'success',
        message: post?.isPinned ? 'Post unpinned!' : 'Post pinned!',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to toggle pin',
      });
    }
  };

  const handleLock = async () => {
    if (!id) return;
    try {
      await postService.toggleLock(id);
      setPost(prev => prev ? { ...prev, isLocked: !prev.isLocked } : null);
      addNotification({
        type: 'success',
        message: post?.isLocked ? 'Post unlocked!' : 'Post locked!',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to toggle lock',
      });
    }
  };

  const handleCommentPin = async (commentId: string) => {
    try {
      await commentService.togglePin(commentId);
      addNotification({
        type: 'success',
        message: 'Comment pin toggled!',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to toggle pin',
      });
    }
  };

  const handlePostUpdated = () => {
    fetchPost();
    setEditModalOpen(false);
  };

  if (loading) {
    return <LoadingSpinner message="Loading post..." />;
  }

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Post not found
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  const isAuthor = user?.id === post.userId;
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
  const canEdit = isAuthor || isAdmin;
  const canPin = isAdmin;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Breadcrumb navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink
          component="button"
          variant="body1"
          onClick={() => navigate('/')}
          sx={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          Home
        </MuiLink>
        <MuiLink
          component="button"
          variant="body1"
          onClick={() => navigate('/topics')}
          sx={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          Topics
        </MuiLink>
        <MuiLink
          component="button"
          variant="body1"
          onClick={() => navigate(`/topics/${post.topicId}`)}
          sx={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          Topic
        </MuiLink>
        <Typography color="text.primary">Post</Typography>
      </Breadcrumbs>

      {/* Post Content */}
      <Paper sx={{ p: 4, mb: 4 }}>
        {/* Header with status chips */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {post.title}
          </Typography>
          <Box>
            {post.isPinned && (
              <Chip
                icon={<PushPin />}
                label="Pinned"
                size="small"
                color="primary"
                sx={{ mr: 1 }}
              />
            )}
            {post.isLocked && (
              <Chip
                icon={<Lock />}
                label="Locked"
                size="small"
                color="error"
              />
            )}
          </Box>
        </Box>

        {/* Author info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar src={post.user?.avatar} sx={{ width: 40, height: 40 }}>
            {post.user?.username?.[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {post.user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              {post.isEdited && ' (edited)'}
            </Typography>
          </Box>
        </Box>

        {/* Post content */}
        <Typography sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
          {post.content}
        </Typography>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            {post.tags.map((tag) => (
              <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Action buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={handleLike} disabled={!isAuthenticated}>
                {liked ? <Favorite color="error" /> : <FavoriteBorder />}
              </IconButton>
              <Typography>{likeCount}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Comment color="action" />
              <Typography>{post.commentCount}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Visibility color="action" />
              <Typography>{post.viewCount}</Typography>
            </Box>
          </Box>

          <Box>
            {canEdit && (
              <IconButton color="primary" onClick={() => setEditModalOpen(true)}>
                <Edit />
              </IconButton>
            )}
            {canEdit && (
              <IconButton color="error" onClick={handleDelete}>
                <Delete />
              </IconButton>
            )}
            {canPin && (
              <IconButton color={post.isPinned ? 'primary' : 'default'} onClick={handlePin}>
                <PushPin />
              </IconButton>
            )}
            {isAdmin && (
              <IconButton color={post.isLocked ? 'error' : 'default'} onClick={handleLock}>
                <Lock />
              </IconButton>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Comments Section */}
      <CommentSection
        postId={id!}
        onPinComment={handleCommentPin}
        isPostAuthor={isAuthor}
      />

      {/* Edit Post Modal */}
      <EditPostModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        post={post}
        onPostUpdated={handlePostUpdated}
      />
    </Container>
  );
};

export default PostDetailPage;