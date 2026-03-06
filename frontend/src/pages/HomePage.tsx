import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Chip,
  Paper,
  Skeleton,
  useTheme,
  useMediaQuery,
  IconButton,
  Divider,
  Stack,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  Whatshot,
  Schedule,
  ArrowForward,
  Search,
  Add,
  Group,
  Forum,
  Star,
  LocalFireDepartment,
  RocketLaunch,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import { useTopics } from '../hooks/useTopics';
import { useAuthStore } from '../store/authStore';
import { postService } from '../services/post.service';
import { topicService } from '../services/topic.service';
import PostCard from '../components/posts/PostCard';
import TopicCard from '../components/topics/TopicCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Stats {
  totalUsers: number;
  totalTopics: number;
  totalPosts: number;
  totalComments: number;
}

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user } = useAuthStore();
  
  // State for different data sections
  const [popularPosts, setPopularPosts] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTopics: 0,
    totalPosts: 0,
    totalComments: 0,
  });
  
  // Loading states
  const [popularLoading, setPopularLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch all data
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch popular posts (most liked/viewed)
        setPopularLoading(true);
        const popular = await postService.getPopularPosts(6);
        setPopularPosts(popular);
      } catch (error) {
        console.error('Failed to fetch popular posts:', error);
      } finally {
        setPopularLoading(false);
      }

      try {
        // Fetch recent posts
        setRecentLoading(true);
        const recent = await postService.getRecentPosts(6);
        setRecentPosts(recent);
      } catch (error) {
        console.error('Failed to fetch recent posts:', error);
      } finally {
        setRecentLoading(false);
      }

      try {
        // Fetch trending topics (most active)
        setTopicsLoading(true);
        const topics = await topicService.getAllTopics();
        // Sort by post count (mock for now - you can implement backend sorting later)
        const sorted = topics.sort((a, b) => (b.postCount || 0) - (a.postCount || 0)).slice(0, 4);
        setTrendingTopics(sorted);
      } catch (error) {
        console.error('Failed to fetch topics:', error);
      } finally {
        setTopicsLoading(false);
      }

      // Mock stats for now (you can create a stats endpoint later)
      setStatsLoading(false);
      setStats({
        totalUsers: 1250,
        totalTopics: 45,
        totalPosts: 3200,
        totalComments: 8900,
      });
    };

    fetchHomeData();
  }, []);

  // Hero Section Component
  const HeroSection = () => (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        mb: 6,
        overflow: 'hidden',
        borderRadius: { xs: 0, md: 4 },
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          opacity: 0.9,
        }}
      />
      
      {/* Decorative Circles */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: alpha(theme.palette.common.white, 0.1),
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: alpha(theme.palette.common.white, 0.1),
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 8, md: 12 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              {!isAuthenticated ? (
                <>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                      fontWeight: 800,
                      mb: 2,
                      lineHeight: 1.2,
                    }}
                  >
                    Welcome to{' '}
                    <Box component="span" sx={{ color: 'secondary.main' }}>
                      Community Hub
                    </Box>
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 4,
                      opacity: 0.9,
                      maxWidth: 600,
                      mx: { xs: 'auto', md: 0 },
                    }}
                  >
                    Join the conversation. Share your ideas. Connect with like-minded people from around the world.
                  </Typography>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}
                  >
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      onClick={() => navigate('/topics')}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: '1.1rem',
                        boxShadow: 4,
                      }}
                      endIcon={<ArrowForward />}
                    >
                      Explore Topics
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="large"
                      onClick={() => navigate('/register')}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: '1.1rem',
                        borderColor: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: alpha(theme.palette.common.white, 0.1),
                        },
                      }}
                    >
                      Get Started
                    </Button>
                  </Stack>
                </>
              ) : (
                <>
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                      fontWeight: 700,
                      mb: 2,
                    }}
                  >
                    Welcome back,{' '}
                    <Box component="span" sx={{ color: 'secondary.main' }}>
                      {user?.username}!
                    </Box>
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 4,
                      opacity: 0.9,
                      maxWidth: 600,
                      mx: { xs: 'auto', md: 0 },
                    }}
                  >
                    Ready to continue the conversation? Check out what's happening in your communities.
                  </Typography>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}
                  >
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      onClick={() => navigate('/topics')}
                      sx={{ py: 1.5, px: 4 }}
                      startIcon={<Search />}
                    >
                      Browse Topics
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="large"
                      onClick={() => navigate('/topics')}
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderColor: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: alpha(theme.palette.common.white, 0.1),
                        },
                      }}
                      startIcon={<Add />}
                    >
                      Create Post
                    </Button>
                  </Stack>
                </>
              )}
            </Box>
          </Grid>
          
          {/* Stats Cards - Desktop */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper
              sx={{
                p: 3,
                backgroundColor: alpha(theme.palette.common.white, 0.15),
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: 'white', opacity: 0.9 }}>
                Community Stats
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Group sx={{ fontSize: 40, mb: 1, color: 'secondary.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {statsLoading ? <Skeleton width={60} /> : stats.totalUsers.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Members</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Forum sx={{ fontSize: 40, mb: 1, color: 'secondary.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {statsLoading ? <Skeleton width={60} /> : stats.totalTopics.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Topics</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Whatshot sx={{ fontSize: 40, mb: 1, color: 'secondary.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {statsLoading ? <Skeleton width={60} /> : stats.totalPosts.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Posts</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Schedule sx={{ fontSize: 40, mb: 1, color: 'secondary.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {statsLoading ? <Skeleton width={60} /> : stats.totalComments.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Comments</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Paper>
  );

  // Section Header Component
  const SectionHeader = ({ title, icon, viewAllLink }: { title: string; icon: React.ReactNode; viewAllLink?: string }) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>
      {viewAllLink && (
        <Button
          endIcon={<KeyboardArrowRight />}
          onClick={() => navigate(viewAllLink)}
          sx={{ textTransform: 'none' }}
        >
          View All
        </Button>
      )}
    </Box>
  );

  // Loading Skeleton for Posts
  const PostSkeleton = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Skeleton variant="text" width="60%" height={30} />
        <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width={100} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <HeroSection />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Stats Cards - Mobile */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Group color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {statsLoading ? <Skeleton /> : stats.totalUsers.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Members</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Forum color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {statsLoading ? <Skeleton /> : stats.totalTopics.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Topics</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Whatshot color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {statsLoading ? <Skeleton /> : stats.totalPosts.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Posts</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Schedule color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {statsLoading ? <Skeleton /> : stats.totalComments.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Comments</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Trending Topics */}
        <Box sx={{ mb: 6 }}>
          <SectionHeader 
            title="Trending Topics" 
            icon={<TrendingUp />} 
            viewAllLink="/topics"
          />
          
          {topicsLoading ? (
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Card>
                    <CardContent>
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {trendingTopics.map((topic) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={topic.id}>
                  <TopicCard topic={topic} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Popular Posts Section */}
        <Box sx={{ mb: 6 }}>
          <SectionHeader 
            title="🔥 Popular Now" 
            icon={<LocalFireDepartment color="error" />} 
            viewAllLink="/search?sortBy=popular"
          />
          
          {popularLoading ? (
            <Grid container spacing={3}>
              {[1, 2, 3].map((i) => (
                <Grid size={{ xs: 12, md: 4 }} key={i}>
                  <PostSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : popularPosts.length > 0 ? (
            <Grid container spacing={3}>
              {popularPosts.slice(0, isMobile ? 2 : 3).map((post) => (
                <Grid size={{ xs: 12, md: 4 }} key={post.id}>
                  <PostCard post={post} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                No popular posts yet
              </Typography>
              {isAuthenticated && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/topics')}
                  sx={{ mt: 2 }}
                >
                  Create First Post
                </Button>
              )}
            </Card>
          )}
        </Box>

        {/* Recent Posts Section */}
        <Box sx={{ mb: 6 }}>
          <SectionHeader 
            title="📝 Recent Posts" 
            icon={<Schedule />} 
            viewAllLink="/search?sortBy=latest"
          />
          
          {recentLoading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((i) => (
                <Grid size={{ xs: 12, md: 6 }} key={i}>
                  <PostSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : recentPosts.length > 0 ? (
            <Grid container spacing={3}>
              {recentPosts.slice(0, isMobile ? 3 : 4).map((post) => (
                <Grid size={{ xs: 12, md: 6 }} key={post.id}>
                  <PostCard post={post} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" paragraph>
                No recent posts yet
              </Typography>
              {isAuthenticated && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/topics')}
                >
                  Create Your First Post
                </Button>
              )}
            </Card>
          )}
        </Box>

        {/* Call to Action for New Users */}
        {!isAuthenticated && (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
              borderRadius: 3,
              mb: 4,
            }}
          >
            <RocketLaunch sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Join Our Community Today!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Sign up now to start posting, commenting, and connecting with others.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.9),
                },
              }}
            >
              Get Started
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;