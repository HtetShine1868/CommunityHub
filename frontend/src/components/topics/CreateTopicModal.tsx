import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTopics } from '../../hooks/useTopics';

interface CreateTopicModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateTopicModal: React.FC<CreateTopicModalProps> = ({ open, onClose }) => {
  const { createTopic, loading } = useTopics();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#6366f1',
    isPrivate: false,
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      await createTopic(formData);
      onClose();
      setFormData({ title: '', description: '', color: '#6366f1', isPrivate: false });
    } catch (err) {
      // Error is handled in hook
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Topic</DialogTitle>
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
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          margin="normal"
          multiline
          rows={3}
          disabled={loading}
        />
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            disabled={loading}
            sx={{ width: 100 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                disabled={loading}
              />
            }
            label="Private Topic"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.title.trim()}
        >
          {loading ? <CircularProgress size={24} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTopicModal;