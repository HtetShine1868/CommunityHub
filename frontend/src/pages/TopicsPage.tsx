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
import TopicList from '../components/topics/TopicList';
import CreateTopicModal from '../components/topics/CreateTopicModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TopicsPage: React.FC = () => {
  const { topics, loading, error } = useTopics();
  const { isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Filter topics based on search
  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(search.toLowerCase()) ||
    (topic.description && topic.description.toLowerCase().includes(search.toLowerCase()))
  );

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
      />
    </Container>
  );
};

export default TopicsPage;