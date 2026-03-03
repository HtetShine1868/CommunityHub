import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Fab,
  Pagination,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  Lock,
  Public,
  Forum,
  People,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { topicService } from '../services/topic.service';
import { postService } from '../services/post.service';
import { likeService } from '../services/like.service';
import { Topic } from '../types/topic.types';
import { Post } from '../types/post.types';
import PostCard from '../components/posts/PostCard';
import CreatePostModal from '../components/posts/CreatePostModal';
import EditPostModal from '../components/posts/EditPostModal';
import EditTopicModal from '../components/topics/EditTopicModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TopicDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // State
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postsError, setPostsError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // Modals
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [editPostModalOpen, setEditPostModalOpen] = useState(false);
  const [editTopicModalOpen, setEditTopicModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Permissions
  const isAuthor = user?.id === topic?.userId;
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
  const canCreatePost = isAuthenticated && !topic?.isPrivate;

  // Fetch topic details
  const fetchTopic = useCallback(async () => {
    if (!id) return;
    
    try {
      const data = await topicService.getTopicById(id);
      setTopic(data);
    } catch (err: any) {
      console.error('Failed to fetch topic:', err);
      setError(err.response?.data?.error || 'Topic not found');
    }
  }, [id]);

  // Fetch posts for this topic
  const fetchPosts = useCallback(async () => {
    if (!id) return;
    
    setPostsLoading(true);
    setPostsError(null);
    
    try {
      const response = await postService.getPostsByTopic(id, page, pageSize);
      
      // Ensure posts is always an array
      setPosts(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 0);
      
    } catch (err: any) {
      console.error('Failed to fetch posts:', err);
      setPostsError(err.response?.data?.error || 'Failed to load posts');
      setPosts([]); // Reset to empty array on error
    } finally {
      setPostsLoading(false);
    }
  }, [id, page, pageSize]);

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTopic(), fetchPosts()]);
      setLoading(false);
    };
    
    loadData();
  }, [fetchTopic, fetchPosts]);

  // Handle post like
  const handleLike = async (postId: string) => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      const { liked, count } = await likeService.togglePostLike(postId);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, liked, likeCount: count } 
            : post
        )
      );
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  // Handle post edit
  const handleEditPost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setEditPostModalOpen(true);
    }
  };

  // Handle post delete
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      await postService.deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      setTotal(prev => prev - 1);
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  // Handle topic edit
  const handleEditTopic = () => {
    setEditTopicModalOpen(true);
  };

  // Handle topic delete
  const handleDeleteTopic = async () => {
    if (!window.confirm('Are you sure you want to delete this topic? All posts will be lost!')) {
      return;
    }
    
    try {
      await topicService.deleteTopic(id!);
      navigate('/topics');
    } catch (err) {
      console.error('Failed to delete topic:', err);
    }
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Refresh after post creation/update
  const handlePostCreated = () => {
    fetchPosts();
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Loading topic..." />;
  }

  // Error state
  if (error || !topic) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Topic not found'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/topics')}
        >
          Back to Topics
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink
          component="button"
          variant="body1"
          onClick={() => navigate('/')}
          sx={{ cursor: 'pointer' }}
        >
          Home
        </MuiLink>
        <MuiLink
          component="button"
          variant="body1"
          onClick={() => navigate('/topics')}
          sx={{ cursor: 'pointer' }}
        >
          Topics
        </MuiLink>
        <Typography color="text.primary">{topic.title}</Typography>
      </Breadcrumbs>

      {/* Topic Header */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4,
          position: 'relative',
          borderTop: `4px solid ${topic.color || '#6366f1'}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {topic.title}
          </Typography>
          
          <Chip
            icon={topic.isPrivate ? <Lock /> : <Public />}
            label={topic.isPrivate ? 'Private Topic' : 'Public Topic'}
            color={topic.isPrivate ? 'default' : 'primary'}
            variant="outlined"
          />
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
          {topic.description || 'No description provided.'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Forum fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {total} posts
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <People fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {topic.followerCount || 0} followers
              </Typography>
            </Box>
          </Box>

          <Typography variant="caption" color="text.secondary">
            Created by {topic.user?.username || 'Unknown'} • {new Date(topic.createdAt).toLocaleDateString()}
          </Typography>
        </Box>

        {/* Topic actions (for author/admin) */}
        {(isAuthor || isAdmin) && (
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <Button
              size="small"
              startIcon={<Edit />}
              onClick={handleEditTopic}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<Delete />}
              onClick={handleDeleteTopic}
            >
              Delete
            </Button>
          </Box>
        )}
      </Paper>

      {/* Posts Section Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Posts {total > 0 && `(${total})`}
        </Typography>
        
        {canCreatePost && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreatePostModalOpen(true)}
          >
            New Post
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Posts List */}
      {postsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : postsError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {postsError}
        </Alert>
      ) : posts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" paragraph>
            No posts yet in this topic.
          </Typography>
          {canCreatePost ? (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreatePostModalOpen(true)}
            >
              Create the First Post
            </Button>
          ) : topic.isPrivate ? (
            <Typography variant="body2" color="text.secondary">
              This is a private topic. Only members can create posts.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Please login to create posts.
            </Typography>
          )}
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
              onEdit={isAdmin || user?.id === post.userId ? () => handleEditPost(post.id) : undefined}
              onDelete={isAdmin || user?.id === post.userId ? () => handleDeletePost(post.id) : undefined}
            />
          ))}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Floating Action Button for mobile */}
      {canCreatePost && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' },
          }}
          onClick={() => setCreatePostModalOpen(true)}
        >
          <Add />
        </Fab>
      )}

      {/* Modals */}
      <CreatePostModal
        open={createPostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
        topicId={id!}
        onPostCreated={handlePostCreated}
      />

      <EditPostModal
        open={editPostModalOpen}
        onClose={() => {
          setEditPostModalOpen(false);
          setSelectedPost(null);
        }}
        post={selectedPost}
        onPostUpdated={handlePostCreated}
      />

      <EditTopicModal
        open={editTopicModalOpen}
        onClose={() => setEditTopicModalOpen(false)}
        topic={topic}
        onTopicUpdated={() => {
          fetchTopic();
          setEditTopicModalOpen(false);
        }}
      />
    </Container>
  );
};

export default TopicDetailPage;