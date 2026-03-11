import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  InputAdornment,
  Fab,
  Box,
  Alert,
  Chip,
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import { useTopics } from '../hooks/useTopics';
import { useAuthStore } from '../store/authStore';
import { Topic } from '../types/topic.types';
import TopicList from '../components/topics/TopicList';
import CreateTopicModal from '../components/topics/CreateTopicModal';
import EditTopicModal from '../components/topics/EditTopicModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TopicsPage: React.FC = () => {
  const { topics, loading, error, createTopic, updateTopic, deleteTopic } = useTopics();
  const { isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Filter topics based on search
  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(search.toLowerCase()) ||
    (topic.description && topic.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleEdit = (topicId: string) => {
    console.log('📝 Editing topic with ID:', topicId);
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      console.log('✅ Found topic:', topic);
      setSelectedTopic(topic);
      setEditModalOpen(true);
    } else {
      console.error('❌ Topic not found with ID:', topicId);
    }
  };

  const handleDelete = async (topicId: string) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      await deleteTopic(topicId);
    }
  };

  const handleUpdateTopic = async (updatedTopic: Topic) => {
    console.log('🔄 Topic updated, updating local state:', updatedTopic);
    
    // Update the local state directly
    // The updateTopic function in useTopics already does this, but we'll also update here to be safe
    setEditModalOpen(false);
    setSelectedTopic(null);
    
    // No need to do anything else as the useTopics hook already updates the state
  };

  const handleCreateTopic = async (data: any) => {
    await createTopic(data);
    setCreateModalOpen(false);
  };

  if (loading && topics.length === 0) {
    return <LoadingSpinner message="Loading topics..." />;
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 8, bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box sx={{ 
        mb: 6, 
        position: 'relative',
        borderRadius: { xs: 0, md: '0 0 32px 32px' },
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0, left: 0,
          opacity: 0.4,
          background: 'radial-gradient(circle at top right, rgba(56, 189, 248, 0.4), transparent 50%), radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.4), transparent 50%)',
          pointerEvents: 'none',
        }} />
        <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 6, md: 8 }, position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" gutterBottom sx={{ 
            fontWeight: 800, 
            letterSpacing: '-0.02em',
            background: 'linear-gradient(to right, #fff, #cbd5e1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}>
            Explore Topics
          </Typography>
          <Typography variant="h6" sx={{ color: '#94a3b8', maxWidth: 600, mb: 5, fontWeight: 400, lineHeight: 1.6 }}>
            Discover, discuss, and connect over subjects that matter to you. Find your community today.
          </Typography>

          <TextField
            fullWidth
            placeholder="Search topics by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ 
              maxWidth: 700,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                color: 'white',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.2s ease-in-out',
                '& fieldset': { border: 'none' },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255,255,255,0.3)',
                },
                '&.Mui-focused': {
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 0 0 4px rgba(56, 189, 248, 0.15)',
                }
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255,255,255,0.5)',
                opacity: 1,
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'rgba(255,255,255,0.6)' }} />
                </InputAdornment>
              ),
            }}
          />
        </Container>
      </Box>

      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Content Section */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.01em' }}>
            {search ? 'Search Results' : 'All Topics'}
          </Typography>
          <Chip 
            label={`${filteredTopics.length} topics`} 
            size="small" 
            sx={{ 
              fontWeight: 600, 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText',
              borderRadius: '8px'
            }} 
          />
        </Box>

        <TopicList
          topics={filteredTopics}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage={
            search 
              ? `No topics matching "${search}"` 
              : "No topics yet. Be the first to create one!"
          }
        />
      </Container>

      {/* FAB and Modals */}
      {isAuthenticated && (
        <Fab
          color="primary"
          aria-label="add topic"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            boxShadow: '0 8px 24px rgba(14, 165, 233, 0.5)',
            width: 64,
            height: 64,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { 
              transform: 'scale(1.08) translateY(-4px)',
              boxShadow: '0 12px 28px rgba(14, 165, 233, 0.6)'
            }
          }}
          onClick={() => setCreateModalOpen(true)}
        >
          <Add sx={{ fontSize: 32 }} />
        </Fab>
      )}

      <CreateTopicModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreateTopic={handleCreateTopic}
      />

      <EditTopicModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTopic(null);
        }}
        topic={selectedTopic}
        onTopicUpdated={handleUpdateTopic}
      />
    </Box>
  );
};

export default TopicsPage;