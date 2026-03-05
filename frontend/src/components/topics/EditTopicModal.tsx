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
import { Topic } from '../../types/topic.types';
import { topicService } from '../../services/topic.service';
import { useUIStore } from '../../store/uiStore';

interface EditTopicModalProps {
  open: boolean;
  onClose: () => void;
  topic: Topic | null;
  onTopicUpdated: (updatedTopic: Topic) => void; // Change to receive updated topic
}

const EditTopicModal: React.FC<EditTopicModalProps> = ({
  open,
  onClose,
  topic,
  onTopicUpdated,
}) => {
  const { addNotification } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#6366f1',
    isPrivate: false,
  });

  useEffect(() => {
    if (topic && open) {
      console.log('Setting form data from topic:', topic);
      setFormData({
        title: topic.title || '',
        description: topic.description || '',
        color: topic.color || '#6366f1',
        isPrivate: topic.isPrivate || false,
      });
      setError(null);
    }
  }, [topic, open]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!topic) {
      setError('No topic selected');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📤 Updating topic:', topic.id, formData);
      
      const response = await topicService.updateTopic(topic.id, {
        title: formData.title,
        description: formData.description,
        color: formData.color,
        isPrivate: formData.isPrivate,
      });
      
      console.log('📥 Update response:', response);
      
      // Show success message
      addNotification({
        type: 'success',
        message: 'Topic updated successfully!',
      });
      
      // Pass the updated topic back to parent
      onTopicUpdated(response);
    } catch (err: any) {
      console.error('❌ Update error:', err);
      setError(err.response?.data?.error || 'Failed to update topic');
      addNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to update topic',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!topic) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Topic</DialogTitle>
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
          error={!formData.title.trim()}
          helperText={!formData.title.trim() ? 'Title is required' : ''}
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
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.title.trim()}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTopicModal;