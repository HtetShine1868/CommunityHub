import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { usePosts } from '../../hooks/usePosts';

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  topicId: string;
  onPostCreated: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  onClose,
  topicId,
  onPostCreated,
}) => {
  const { createPost, loading } = usePosts(topicId);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    try {
      await createPost(formData);
      onPostCreated();
      onClose();
      setFormData({ title: '', content: '' });
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Post</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          fullWidth
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          margin="normal"
          required
          disabled={loading}
        />
        <TextField
          fullWidth
          label="Content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          margin="normal"
          multiline
          rows={6}
          required
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.title.trim() || !formData.content.trim()}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Post'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePostModal;