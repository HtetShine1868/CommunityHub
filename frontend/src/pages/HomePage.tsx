import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import { useAuthStore } from '../store/authStore';
import PostCard from '../components/posts/PostCard';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { posts: popularPosts, loading: popularLoading } = usePosts();
  const { posts: recentPosts, loading: recentLoading } = usePosts();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 2,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          {!isAuthenticated ? (
            <>
              <Typography variant="h2" gutterBottom>
                Welcome to Community Hub
              </Typography>
              <Typography variant="h5" paragraph>
                Join the conversation. Share your ideas. Connect with others.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/topics')}
                >
                  Explore Topics
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h2" gutterBottom>
                Welcome back, {user?.username}!
              </Typography>
              <Typography variant="h5" paragraph>
                What would you like to discuss today?
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/topics')}
                >
                  Browse Topics
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={() => navigate('/topics')}
                >
                  Create Post
                </Button>
              </Box>
            </>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Popular Posts */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom>
            🔥 Popular Now
          </Typography>
          {popularLoading ? (
            <Typography>Loading...</Typography>
          ) : popularPosts.length > 0 ? (
            <Grid container spacing={3}>
              {popularPosts.slice(0, 3).map((post) => (
                <Grid size={{ xs: 12, md: 4 }} key={post.id}>
                  <PostCard post={post} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card>
              <CardContent>
                <Typography color="text.secondary">No popular posts yet</Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Recent Posts */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom>
            📝 Recent Posts
          </Typography>
          {recentLoading ? (
            <Typography>Loading...</Typography>
          ) : recentPosts.length > 0 ? (
            <Grid container spacing={3}>
              {recentPosts.slice(0, 6).map((post) => (
                <Grid size={{ xs: 12, md: 6 }} key={post.id}>
                  <PostCard post={post} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card>
              <CardContent>
                <Typography color="text.secondary">No recent posts yet</Typography>
                {isAuthenticated && (
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/topics')}>
                    Create Your First Post
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;