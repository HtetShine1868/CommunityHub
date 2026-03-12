import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  InputAdornment,
  Fab,
  Box,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Filter topics based on search and category
  const filteredTopics = topics.filter(topic => {
    const matchesSearch =
      topic.title.toLowerCase().includes(search.toLowerCase()) ||
      (topic.description && topic.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || topic.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      setSelectedTopic(topic);
      setEditModalOpen(true);
    }
  };

  const handleDelete = async (topicId: string) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      await deleteTopic(topicId);
    }
  };

  const handleUpdateTopic = async (updatedTopic: Topic) => {
    // Sync the updated topic into local state so the list reflects changes immediately
    await updateTopic(updatedTopic.id, {
      title: updatedTopic.title,
      description: updatedTopic.description,
      color: updatedTopic.color,
      isPrivate: updatedTopic.isPrivate,
    });
    setEditModalOpen(false);
    setSelectedTopic(null);
  };

  const handleCreateTopic = async (data: any) => {
    await createTopic(data);
    setCreateModalOpen(false);
  };

  const isFiltered = search.trim() !== '' || selectedCategory !== 'all';

  if (topicsLoading && topics.length === 0) {
    return <LoadingSpinner message="Loading topics..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
          Topics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse discussions by topic. Select a category or search to filter.
        </Typography>
      </Box>

      {/* Filters row */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
        }}
      >
        <TextField
          placeholder="Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="all">All Categories</MenuItem>
            <Divider />
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {cat.icon && <span style={{ fontSize: '16px' }}>{cat.icon}</span>}
                  {cat.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Result count */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {isFiltered ? 'Filtered results:' : 'All topics:'}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {filteredTopics.length}
        </Typography>
      </Box>

      <TopicList
        topics={filteredTopics}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={
          isFiltered
            ? 'No topics match your filters.'
            : 'No topics yet. Be the first to create one!'
        }
      />

      {isAuthenticated && (
        <Fab
          color="primary"
          aria-label="add topic"
          title="Create new topic"
          sx={{ position: 'fixed', bottom: 32, right: 32 }}
          onClick={() => setCreateModalOpen(true)}
        >
          <Add />
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