import React, { useState, useEffect } from 'react';
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

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        title: '',
        description: '',
        color: '#6366f1',
        isPrivate: false,
      });
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      await createTopic(formData);
      onClose();
    } catch (err) {
      // Error is handled in hook
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      // Prevent focus from being trapped in hidden elements
      disableEnforceFocus
      // Ensure proper cleanup
      TransitionProps={{
        onExited: () => {
          // Remove any lingering focus issues
          document.body.style.overflow = 'unset';
        },
      }}
    >
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
          autoFocus
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
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
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