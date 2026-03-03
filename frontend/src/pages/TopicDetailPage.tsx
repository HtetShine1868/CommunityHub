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
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
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
  MoreVert,
  Share,
  Bookmark,
  BookmarkBorder,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  
  // Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [following, setFollowing] = useState(false);

  // Permissions
  const isAuthor = user?.id === topic?.userId;
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
  const canCreatePost = isAuthenticated && !topic?.isPrivate;
  const canEdit = isAuthor || isAdmin;

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
    handleMenuClose();
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
    handleMenuClose();
  };

  // Handle topic edit
  const handleEditTopic = () => {
    setEditTopicModalOpen(true);
    handleMenuClose();
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
    handleMenuClose();
  };

  // Handle follow/unfollow
  const handleFollow = () => {
    setFollowing(!following);
    handleMenuClose();
    // Implement actual follow API call here
  };

  // Handle share
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // Show toast notification
    handleMenuClose();
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
        <Typography color="text.primary">{topic.title}</Typography>
      </Breadcrumbs>

      {/* Topic Header */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          mb: 4,
          position: 'relative',
          borderTop: `4px solid ${topic.color || '#6366f1'}`,
          borderRadius: 2,
        }}
      >
        {/* Topic actions menu - FIXED POSITIONING */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16,
            zIndex: 10,
          }}
        >
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ 
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {isAuthenticated && (
              <MenuItem onClick={handleFollow}>
                {following ? <Bookmark /> : <BookmarkBorder />}
                <Box component="span" sx={{ ml: 1 }}>
                  {following ? 'Unfollow' : 'Follow'}
                </Box>
              </MenuItem>
            )}
            <MenuItem onClick={handleShare}>
              <Share />
              <Box component="span" sx={{ ml: 1 }}>Share</Box>
            </MenuItem>
            {canEdit && (
              [
                <Divider key="divider" />,
                <MenuItem key="edit" onClick={handleEditTopic}>
                  <Edit />
                  <Box component="span" sx={{ ml: 1 }}>Edit Topic</Box>
                </MenuItem>,
                <MenuItem key="delete" onClick={handleDeleteTopic} sx={{ color: 'error.main' }}>
                  <Delete />
                  <Box component="span" sx={{ ml: 1 }}>Delete Topic</Box>
                </MenuItem>
              ]
            )}
          </Menu>
        </Box>

        {/* Topic title and privacy chip */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: 2,
          mb: 2,
          pr: { xs: 0, sm: 5 }, // Add padding right to make room for menu
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.75rem', md: '2.125rem' },
              wordBreak: 'break-word',
            }}
          >
            {topic.title}
          </Typography>
          
          <Chip
            icon={topic.isPrivate ? <Lock /> : <Public />}
            label={topic.isPrivate ? 'Private Topic' : 'Public Topic'}
            color={topic.isPrivate ? 'default' : 'primary'}
            variant="outlined"
            size={isMobile ? 'small' : 'medium'}
          />
        </Box>

        {/* Topic description */}
        {topic.description && (
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              mb: 3, 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {topic.description}
          </Typography>
        )}

        {/* Topic metadata */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Forum fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {total} {total === 1 ? 'post' : 'posts'}
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
      </Paper>

      {/* Posts Section Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: 2,
        mb: 3 
      }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Posts {total > 0 && `(${total})`}
        </Typography>
        
        {canCreatePost && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreatePostModalOpen(true)}
            fullWidth={isMobile}
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
              onEdit={canEdit || user?.id === post.userId ? () => handleEditPost(post.id) : undefined}
              onDelete={canEdit || user?.id === post.userId ? () => handleDeletePost(post.id) : undefined}
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
            size={isMobile ? 'medium' : 'large'}
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
            zIndex: 1000,
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