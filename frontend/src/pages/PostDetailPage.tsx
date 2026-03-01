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
} from '@mui/material';
import {
  ArrowBack,
  Favorite,
  FavoriteBorder,
  Lock,
  PushPin,
  Edit,
  Delete,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { postService } from '../services/post.service';
import { likeService } from '../services/like.service';
import { useAuthStore } from '../store/authStore';
import { Post } from '../types/post.types';
import CommentSection from '../components/comments/CommentSection';
import EditPostModal from '../components/posts/EditPostModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!id || !isAuthenticated) return;
    try {
      const { liked: newLiked, count } = await likeService.togglePostLike(id);
      setLiked(newLiked);
      setLikeCount(count);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postService.deletePost(id);
      navigate(`/topics/${post?.topicId}`);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handlePin = async () => {
    if (!id) return;
    try {
      await postService.togglePin(id);
      setPost(prev => prev ? { ...prev, isPinned: !prev.isPinned } : null);
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const handleLock = async () => {
    if (!id) return;
    try {
      await postService.toggleLock(id);
      setPost(prev => prev ? { ...prev, isLocked: !prev.isLocked } : null);
    } catch (error) {
      console.error('Failed to toggle lock:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!post) {
    return (
      <Container>
        <Typography>Post not found</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Container>
    );
  }

  const isAuthor = user?.id === post.userId;
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(`/topics/${post.topicId}`)} sx={{ mb: 2 }}>
        Back to Topic
      </Button>

      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">{post.title}</Typography>
          <Box>
            {post.isPinned && <Chip icon={<PushPin />} label="Pinned" size="small" sx={{ mr: 1 }} />}
            {post.isLocked && <Chip icon={<Lock />} label="Locked" size="small" color="error" />}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Typography variant="subtitle2">
            Posted by {post.user?.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </Typography>
          {post.isEdited && (
            <Typography variant="caption" color="text.secondary">
              (edited)
            </Typography>
          )}
        </Box>

        <Typography sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
          {post.content}
        </Typography>

        {post.tags && post.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            {post.tags.map((tag) => (
              <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handleLike} disabled={!isAuthenticated}>
              {liked ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
            <Typography>{likeCount} likes</Typography>
          </Box>

          <Box>
            {(isAuthor || isAdmin) && (
              <>
                <IconButton color="primary" onClick={() => setEditModalOpen(true)}>
                  <Edit />
                </IconButton>
                {isAuthor && (
                  <IconButton color="error" onClick={handleDelete}>
                    <Delete />
                  </IconButton>
                )}
                {isAdmin && (
                  <>
                    <IconButton color={post.isPinned ? 'secondary' : 'default'} onClick={handlePin}>
                      <PushPin />
                    </IconButton>
                    <IconButton color={post.isLocked ? 'error' : 'default'} onClick={handleLock}>
                      <Lock />
                    </IconButton>
                  </>
                )}
              </>
            )}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <CommentSection postId={id!} />
      </Box>

      <EditPostModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        post={post}
        onPostUpdated={fetchPost}
      />
    </Container>
  );
};

export default PostDetailPage;