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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  Lock,
  Public,
  Forum,
  Edit,
  Delete,
  MoreVert,
  Share,
  Search as SearchIcon,
  FilterList,
  Clear,
  AccessTime,
  Whatshot,
  TrendingUp,
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
import { useUIStore } from '../store/uiStore';
import { useDebounce } from '../hooks/useDebounce';

interface SearchFilters {
  query: string;
  sortBy: 'latest' | 'popular' | 'mostLiked' | 'oldest';
  timeFilter: 'all' | 'today' | 'week' | 'month' | 'year';
}

const TopicDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useUIStore();

  // State
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postsError, setPostsError] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'latest',
    timeFilter: 'all',
  });
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
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

  // Permissions
  const isAuthor = user?.id === topic?.userId;
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
  const canCreatePost = isAuthenticated && !topic?.isPrivate;
  const canEdit = isAuthor || isAdmin;

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.sortBy !== 'latest') count++;
    if (filters.timeFilter !== 'all') count++;
    setActiveFilterCount(count);
  }, [filters]);

  // Fetch topic details
  const fetchTopic = useCallback(async () => {
    if (!id) return;
    
    try {
      console.log('📥 Fetching topic:', id);
      const data = await topicService.getTopicById(id);
      console.log('✅ Topic fetched:', data);
      setTopic(data);
    } catch (err: any) {
      console.error('❌ Failed to fetch topic:', err);
      setError(err.response?.data?.error || 'Topic not found');
    }
  }, [id]);

  // Fetch all posts for this topic
  const fetchPosts = useCallback(async () => {
    if (!id) return;
    
    setPostsLoading(true);
    setPostsError(null);
    
    try {
      console.log('📥 Fetching posts for topic:', id);
      const response = await postService.getPostsByTopic(id, 1, 100);
      
      setPosts(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / pageSize));
      
    } catch (err: any) {
      console.error('❌ Failed to fetch posts:', err);
      setPostsError(err.response?.data?.error || 'Failed to load posts');
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [id]);

  // Apply filters and search to posts
  useEffect(() => {
    if (!posts.length) {
      setFilteredPosts([]);
      return;
    }

    let filtered = [...posts];

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.content.toLowerCase().includes(query)
      );
    }

    if (filters.timeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.timeFilter) {
        case 'today':
          filterDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(post => new Date(post.createdAt) >= filterDate);
    }

    switch (filters.sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'mostLiked':
        filtered.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
        break;
    }

    setFilteredPosts(filtered);
    setTotal(filtered.length);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setPage(1);
  }, [posts, debouncedSearchQuery, filters]);

  const getCurrentPagePosts = () => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredPosts.slice(start, end);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTopic(), fetchPosts()]);
      setLoading(false);
    };
    
    loadData();
  }, [fetchTopic, fetchPosts]);

  const handleLike = async (postId: string) => {
    if (!isAuthenticated) {
      addNotification({
        type: 'info',
        message: 'Please login to like posts',
      });
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
      addNotification({
        type: 'error',
        message: 'Failed to like post',
      });
    }
  };

  const handleEditPost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setEditPostModalOpen(true);
    }
    handleMenuClose();
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      await postService.deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      addNotification({
        type: 'success',
        message: 'Post deleted successfully',
      });
    } catch (err) {
      console.error('Failed to delete post:', err);
      addNotification({
        type: 'error',
        message: 'Failed to delete post',
      });
    }
    handleMenuClose();
  };

  const handleEditTopic = () => {
    console.log('📝 Opening edit modal for topic:', topic);
    setEditTopicModalOpen(true);
    handleMenuClose();
  };

  const handleDeleteTopic = async () => {
    if (!window.confirm('Are you sure you want to delete this topic? All posts will be lost!')) {
      return;
    }
    
    try {
      console.log('🗑️ Deleting topic:', id);
      await topicService.deleteTopic(id!);
      addNotification({
        type: 'success',
        message: 'Topic deleted successfully',
      });
      navigate('/topics');
    } catch (err) {
      console.error('❌ Failed to delete topic:', err);
      addNotification({
        type: 'error',
        message: 'Failed to delete topic',
      });
    }
    handleMenuClose();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addNotification({
      type: 'success',
      message: 'Link copied to clipboard!',
    });
    handleMenuClose();
  };

  const handleTopicUpdated = async () => {
    console.log('🔄 Topic updated callback triggered');
    try {
      await fetchTopic();
      console.log('✅ Topic refreshed successfully');
      setEditTopicModalOpen(false);
      addNotification({
        type: 'success',
        message: 'Topic updated successfully!',
      });
    } catch (error) {
      console.error('❌ Error refreshing topic:', error);
      addNotification({
        type: 'error',
        message: 'Topic updated but failed to refresh',
      });
    }
  };

  const handlePostCreated = (newPost: Post) => {
    console.log('📝 Post created, refreshing posts...');
    setPosts(prev => [newPost, ...prev]);
    setCreatePostModalOpen(false);
    addNotification({
      type: 'success',
      message: 'Post created successfully!',
    });
  };

  const handlePostUpdated = () => {
    console.log('📝 Post updated, refreshing posts...');
    fetchPosts();
    setEditPostModalOpen(false);
    setSelectedPost(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      query: '',
      sortBy: 'latest',
      timeFilter: 'all',
    });
    setSearchQuery('');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <LoadingSpinner message="Loading topic..." />;
  }

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
          onClick={() => navigate('/home')}
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
        {/* Topic actions menu */}
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

        {/* Topic title and chips */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: 2,
          mb: 2,
          pr: { xs: 0, sm: 5 },
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
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {topic.category && (
              <Chip
                icon={<span>{topic.category.icon || '📁'}</span>}
                label={topic.category.name}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  backgroundColor: topic.category.color ? `${topic.category.color}20` : 'transparent',
                  borderColor: topic.category.color || theme.palette.primary.main,
                  color: topic.category.color || theme.palette.primary.main,
                  fontWeight: 500,
                }}
              />
            )}
            
            <Chip
              icon={topic.isPrivate ? <Lock /> : <Public />}
              label={topic.isPrivate ? 'Private Topic' : 'Public Topic'}
              color={topic.isPrivate ? 'default' : 'primary'}
              variant="outlined"
              size={isMobile ? 'small' : 'medium'}
            />
          </Box>
        </Box>

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
          </Box>

          <Typography variant="caption" color="text.secondary">
            Created by {topic.user?.username || 'Unknown'} • {new Date(topic.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>

      {/* Search & Filter Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            placeholder="Search posts in this topic..."
            value={searchQuery}
            onChange={handleSearchChange}
            variant="outlined"
            size="medium"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} edge="end" size="small">
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Tooltip title="Filter posts">
            <Badge badgeContent={activeFilterCount} color="primary">
              <Button
                variant={showFilters ? 'contained' : 'outlined'}
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ minWidth: 100 }}
              >
                Filters
              </Button>
            </Badge>
          </Tooltip>

          {activeFilterCount > 0 && (
            <Button
              variant="text"
              color="error"
              startIcon={<Clear />}
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          )}
        </Box>

        {showFilters && (
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            bgcolor: 'action.hover', 
            borderRadius: 1,
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            <Typography variant="subtitle2" sx={{ minWidth: 60 }}>
              Sort by:
            </Typography>
            
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={filters.sortBy}
                onChange={(e: SelectChangeEvent) => handleFilterChange('sortBy', e.target.value)}
                displayEmpty
              >
                <MenuItem value="latest">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime fontSize="small" /> Latest
                  </Box>
                </MenuItem>
                <MenuItem value="oldest">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime fontSize="small" /> Oldest
                  </Box>
                </MenuItem>
                <MenuItem value="popular">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Whatshot fontSize="small" color="error" /> Most Viewed
                  </Box>
                </MenuItem>
                <MenuItem value="mostLiked">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp fontSize="small" color="primary" /> Most Liked
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Typography variant="subtitle2" sx={{ ml: 2, minWidth: 80 }}>
              Time filter:
            </Typography>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={filters.timeFilter}
                onChange={(e: SelectChangeEvent) => handleFilterChange('timeFilter', e.target.value)}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Last 24 Hours</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Paper>

      {/* Posts Section Header - FIXED: Added New Post Button */}
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
        
        {/* New Post Button - Always visible when user can create posts */}
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

      {/* Results Info */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        px: 1,
      }}>
        <Typography variant="body2" color="text.secondary">
          {filteredPosts.length === 0 
            ? 'No posts found' 
            : `Found ${filteredPosts.length} ${filteredPosts.length === 1 ? 'post' : 'posts'}`
          }
          {searchQuery && ` matching "${searchQuery}"`}
          {filters.timeFilter !== 'all' && ` from ${filters.timeFilter}`}
        </Typography>

        {filteredPosts.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            Page {page} of {totalPages}
          </Typography>
        )}
      </Box>

      {/* Posts List */}
      {postsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : postsError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {postsError}
        </Alert>
      ) : filteredPosts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" paragraph>
            {searchQuery || activeFilterCount > 0 
              ? 'No posts match your search criteria.' 
              : 'No posts yet in this topic.'}
          </Typography>
          {canCreatePost && !searchQuery && activeFilterCount === 0 ? (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreatePostModalOpen(true)}
            >
              Create the First Post
            </Button>
          ) : (searchQuery || activeFilterCount > 0) && (
            <Button
              variant="outlined"
              onClick={handleResetFilters}
            >
              Clear Filters
            </Button>
          )}
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {getCurrentPagePosts().map((post) => (
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
        onPostUpdated={handlePostUpdated}
      />

      <EditTopicModal
        open={editTopicModalOpen}
        onClose={() => setEditTopicModalOpen(false)}
        topic={topic}
        onTopicUpdated={handleTopicUpdated}
      />
    </Container>
  );
};

export default TopicDetailPage;