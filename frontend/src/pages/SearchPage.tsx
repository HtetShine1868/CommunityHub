import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Pagination,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Button,
  SelectChangeEvent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList,
  Clear,
  TrendingUp,
  Category,
  AccessTime,
  Whatshot,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchService } from '../services/search.service';
import { categoryService } from '../services/category.service';
import { SearchFilters, SearchResult, PopularCategory } from '../types/search.types';
import PostCard from '../components/posts/PostCard';
import TopicCard from '../components/topics/TopicCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';
import { useAuthStore } from '../store/authStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  
  // Get query from URL
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(searchQuery, 500);
  
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>({
    q: initialQuery,
    type: 'all',
    sortBy: 'relevance',
    time: 'all',
    page: 1,
    pageSize: 10,
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<PopularCategory[]>([]);
  const [popularCategories, setPopularCategories] = useState<PopularCategory[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update URL when search query changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (debouncedQuery) {
      params.set('q', debouncedQuery);
    } else {
      params.delete('q');
    }
    navigate(`/search?${params.toString()}`, { replace: true });
  }, [debouncedQuery, navigate, location.search]);

// Load categories on mount
useEffect(() => {
  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data as any);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };
  loadCategories();
}, []);

  // Load popular categories and trending posts
  useEffect(() => {
    const loadPopularData = async () => {
      setTrendingLoading(true);
      try {
        const [popular, trending] = await Promise.all([
          searchService.getPopularCategories(),
          searchService.getTrending(5, 'week'),
        ]);
        setPopularCategories(popular);
        setTrendingPosts(trending);
      } catch (err) {
        console.error('Failed to load popular data:', err);
      } finally {
        setTrendingLoading(false);
      }
    };
    loadPopularData();
  }, []);

  // Perform search when filters change
  useEffect(() => {
    const performSearch = async () => {
      if (!filters.q && filters.type === 'all' && !filters.categoryId) {
        setSearchResult(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await searchService.search({
          ...filters,
          q: filters.q || undefined,
        });
        setSearchResult(result);
      } catch (err) {
        setError('Failed to perform search');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [filters]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setFilters(prev => ({ ...prev, q: e.target.value, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilters({ type: 'all', sortBy: 'relevance', time: 'all', page: 1 });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    const types: Array<'all' | 'posts' | 'topics' | 'users'> = ['all', 'posts', 'topics', 'users'];
    setFilters(prev => ({ ...prev, type: types[newValue], page: 1 }));
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleCategoryClick = (categoryId: string) => {
    setFilters(prev => ({ ...prev, categoryId, page: 1, type: 'posts' }));
    setActiveTab(1); // Switch to posts tab
    setShowFilters(true);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setFilters(prev => ({ ...prev, page: value }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getTotalResults = () => {
    if (!searchResult) return 0;
    switch (activeTab) {
      case 0: return searchResult.totalPosts + searchResult.totalTopics + searchResult.totalUsers;
      case 1: return searchResult.totalPosts;
      case 2: return searchResult.totalTopics;
      case 3: return searchResult.totalUsers;
      default: return 0;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Search Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Search
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            placeholder="Search posts, topics, users..."
            value={searchQuery}
            onChange={handleSearchInput}
            variant="outlined"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} edge="end">
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant={showFilters ? 'contained' : 'outlined'}
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </Box>

        {/* Filters Panel */}
        {showFilters && (
          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy || 'relevance'}
                label="Sort By"
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="latest">Latest</MenuItem>
                <MenuItem value="popular">Most Viewed</MenuItem>
                <MenuItem value="mostLiked">Most Liked</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time</InputLabel>
              <Select
                value={filters.time || 'all'}
                label="Time"
                onChange={(e) => handleFilterChange('time', e.target.value)}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.categoryId || ''}
                label="Category"
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{cat.icon}</span>
                      {cat.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Paper>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Sidebar - Popular Categories & Trending */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Whatshot color="error" /> Trending
            </Typography>
            {trendingLoading ? (
              <CircularProgress size={24} />
            ) : (
              trendingPosts.map((post) => (
                <Box
                  key={post.id}
                  sx={{
                    py: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => navigate(`/posts/${post.id}`)}
                >
                  <Typography variant="body2" noWrap>
                    {post.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {post.likeCount} likes · {post.viewCount} views
                  </Typography>
                </Box>
              ))
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Category color="primary" /> Popular Categories
            </Typography>
            {popularCategories.map((cat) => (
              <Box
                key={cat.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => handleCategoryClick(cat.id)}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: cat.color || 'primary.main',
                    fontSize: '1rem',
                  }}
                >
                  {cat.icon || '📁'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">{cat.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {cat.postCount} posts
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Main Search Results */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Paper sx={{ p: 3 }}>
            {/* Tabs */}
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="All" />
              <Tab label="Posts" />
              <Tab label="Topics" />
              <Tab label="Users" />
            </Tabs>

            {/* Results Count */}
            {searchResult && (
              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Found {getTotalResults()} results
                  {filters.q && ` for "${filters.q}"`}
                </Typography>
              </Box>
            )}

            {/* Loading State */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Error State */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {/* Empty State */}
            {!loading && searchResult && getTotalResults() === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No results found. Try different keywords.
                </Typography>
              </Box>
            )}

            {/* All Tab */}
            <TabPanel value={activeTab} index={0}>
              {searchResult?.posts && searchResult.posts.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>Posts</Typography>
                  {searchResult.posts.slice(0, 3).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  {searchResult.totalPosts > 3 && (
                    <Button
                      sx={{ mt: 1 }}
                      onClick={() => {
                        setActiveTab(1);
                        handleFilterChange('type', 'posts');
                      }}
                    >
                      View all {searchResult.totalPosts} posts
                    </Button>
                  )}
                </Box>
              )}

              {searchResult?.topics && searchResult.topics.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>Topics</Typography>
                  <Grid container spacing={2}>
                    {searchResult.topics.slice(0, 3).map((topic) => (
                      <Grid size={{ xs: 12 }} key={topic.id}>
                        <TopicCard topic={topic} />
                      </Grid>
                    ))}
                  </Grid>
                  {searchResult.totalTopics > 3 && (
                    <Button
                      sx={{ mt: 1 }}
                      onClick={() => {
                        setActiveTab(2);
                        handleFilterChange('type', 'topics');
                      }}
                    >
                      View all {searchResult.totalTopics} topics
                    </Button>
                  )}
                </Box>
              )}

              {searchResult?.users && searchResult.users.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Users</Typography>
                  <Grid container spacing={2}>
                    {searchResult.users.slice(0, 3).map((user) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={user.id}>
                        <Paper
                          sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                          onClick={() => navigate(`/profile/${user.id}`)}
                        >
                          <Avatar src={user.avatar}>
                            {user.username[0].toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{user.username}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.bio?.substring(0, 50)}...
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </TabPanel>

            {/* Posts Tab */}
            <TabPanel value={activeTab} index={1}>
              {searchResult?.posts?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </TabPanel>

            {/* Topics Tab */}
            <TabPanel value={activeTab} index={2}>
              <Grid container spacing={2}>
                {searchResult?.topics?.map((topic) => (
                  <Grid size={{ xs: 12, md: 6 }} key={topic.id}>
                    <TopicCard topic={topic} />
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            {/* Users Tab */}
            <TabPanel value={activeTab} index={3}>
              <Grid container spacing={2}>
                {searchResult?.users?.map((user) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={user.id}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      <Avatar src={user.avatar}>
                        {user.username[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{user.username}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            {/* Pagination */}
            {searchResult && getTotalResults() > (filters.pageSize || 10) && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={Math.ceil(getTotalResults() / (filters.pageSize || 10))}
                  page={filters.page || 1}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SearchPage;