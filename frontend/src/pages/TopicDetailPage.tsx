import React, { useState, useEffect } from 'react';
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
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Add, ArrowBack, Lock, Public, Forum } from '@mui/icons-material';
import { topicService } from '../services/topic.service';
import { usePosts } from '../hooks/usePosts';
import { useAuthStore } from '../store/authStore';
import PostCard from '../components/posts/PostCard';
import CreatePostModal from '../components/posts/CreatePostModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Topic } from '../types/topic.types';

const TopicDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  const {
    posts,
    total,
    page,
    setPage,
    toggleLike,
    refresh: refreshPosts,
  } = usePosts(id);

  useEffect(() => {
    const fetchTopic = async () => {
      if (!id) return;
      try {
        const data = await topicService.getTopicById(id);
        setTopic(data);
      } catch (error) {
        console.error('Failed to fetch topic:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!topic) {
    return (
      <Container>
        <Card>
          <CardContent>
            <Typography>Topic not found</Typography>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/topics')}>
              Back to Topics
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/topics')} sx={{ mb: 2 }}>
        Back to Topics
      </Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">{topic.title}</Typography>
          <Chip
            icon={topic.isPrivate ? <Lock /> : <Public />}
            label={topic.isPrivate ? 'Private' : 'Public'}
            color={topic.isPrivate ? 'default' : 'primary'}
          />
        </Box>
        
        <Typography color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
          {topic.description || 'No description provided.'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Forum color="action" />
            <Typography variant="body2">
              {total} {total === 1 ? 'Post' : 'Posts'}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Created by {topic.user?.username || 'Unknown'} • {new Date(topic.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Posts ({total})
        </Typography>
        {isAuthenticated && !topic.isLocked && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setModalOpen(true)}
          >
            New Post
          </Button>
        )}
      </Box>

      {posts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" gutterBottom>
              No posts yet in this topic.
            </Typography>
            {isAuthenticated && !topic.isLocked && (
              <Button 
                variant="contained" 
                onClick={() => setModalOpen(true)}
                sx={{ mt: 2 }}
              >
                Create the First Post
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => toggleLike(post.id)}
              />
            ))}
          </Box>

          {total > 10 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(total / 10)}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {isAuthenticated && !topic.isLocked && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setModalOpen(true)}
        >
          <Add />
        </Fab>
      )}

      <CreatePostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        topicId={id!}
        onPostCreated={refreshPosts}
      />
    </Container>
  );
};

export default TopicDetailPage;