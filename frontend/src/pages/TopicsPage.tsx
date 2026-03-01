import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  InputAdornment,
  Fab,
  Box,
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
  const { topics, loading, createTopic, updateTopic, deleteTopic, refresh } = useTopics();
  const { isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(search.toLowerCase()) ||
    topic.description?.toLowerCase().includes(search.toLowerCase())
  );

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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Topics
      </Typography>
      
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
        emptyMessage="No topics found. Be the first to create one!"
      />

      {isAuthenticated && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setCreateModalOpen(true)}
        >
          <Add />
        </Fab>
      )}

      <CreateTopicModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <EditTopicModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTopic(null);
        }}
        topic={selectedTopic}
        onTopicUpdated={refresh}
      />
    </Container>
  );
};

export default TopicsPage;