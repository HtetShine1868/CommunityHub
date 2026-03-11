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
import { useCategories } from '../hooks/useCategories';
import { useAuthStore } from '../store/authStore';
import { Topic } from '../types/topic.types';
import TopicList from '../components/topics/TopicList';
import CreateTopicModal from '../components/topics/CreateTopicModal';
import EditTopicModal from '../components/topics/EditTopicModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TopicsPage: React.FC = () => {
  const { topics, loading: topicsLoading, error, createTopic, updateTopic, deleteTopic } = useTopics();
  const { categories } = useCategories();
  const { isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Filter topics based on search and category
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(search.toLowerCase()) ||
      (topic.description && topic.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || topic.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  if (topicsLoading && topics.length === 0) {
    return <LoadingSpinner message="Loading topics..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
          Topics
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
          Discover, discuss, and connect over subjects that matter to you.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="medium"
            sx={{ flexGrow: 1, maxWidth: { md: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Categories Filter */}
        <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
          <Chip
            label="All Topics"
            onClick={() => setSelectedCategory('all')}
            color={selectedCategory === 'all' ? 'primary' : 'default'}
            variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
            sx={{ fontWeight: selectedCategory === 'all' ? 600 : 400 }}
          />
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              icon={<span style={{ fontSize: '14px' }}>{cat.icon}</span>}
              label={cat.name}
              onClick={() => setSelectedCategory(cat.id)}
              color={selectedCategory === cat.id ? 'primary' : 'default'}
              variant={selectedCategory === cat.id ? 'filled' : 'outlined'}
              sx={{ fontWeight: selectedCategory === cat.id ? 600 : 400 }}
            />
          ))}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Content Section */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {search || selectedCategory !== 'all' ? 'Filtered Results' : 'All Topics'}
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({filteredTopics.length})
          </Typography>
        </Typography>
      </Box>

      <TopicList
        topics={filteredTopics}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={
          search || selectedCategory !== 'all'
            ? "No topics match your filters."
            : "No topics yet. Be the first to create one!"
        }
      />

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
    </Container>
  );
};

export default TopicsPage;