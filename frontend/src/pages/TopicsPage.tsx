import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  InputAdornment,
  Fab,
  Box,
  Alert,
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Topics
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        fullWidth
        placeholder="Search topics..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

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

      {isAuthenticated && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
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