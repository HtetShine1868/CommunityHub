import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Chip,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Close,
  Title as TitleIcon,
  Description as DescriptionIcon,
  Tag as TagIcon,
} from '@mui/icons-material';
import { usePosts } from '../../hooks/usePosts';
import { Post } from '../../types/post.types';

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  topicId: string;
  onPostCreated: (post: Post) => void;
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
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        title: '',
        content: '',
        tags: [],
      });
      setTagInput('');
      setError(null);
    }
  }, [open]);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

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
      const newPost = await createPost({
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      });
      
      onPostCreated(newPost);
      onClose();
      setFormData({ title: '', content: '', tags: [] });
      setTagInput('');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create post');
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <span style={{ 
          fontSize: '1.5rem',
          fontWeight: 600,
        }}>
          Create New Post
        </span>
        <IconButton onClick={handleClose} size="small" disabled={loading}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        <TextField
          fullWidth
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          margin="normal"
          required
          disabled={loading}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TitleIcon color="action" />
              </InputAdornment>
            ),
          }}
          helperText={formData.title.length > 0 ? `${formData.title.length}/200` : ''}
          inputProps={{ maxLength: 200 }}
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
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                <DescriptionIcon color="action" />
              </InputAdornment>
            ),
          }}
          placeholder="Write your post content here..."
        />

        {/* Tags Section */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Add Tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              placeholder="Type and press Enter"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TagIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button 
              variant="outlined" 
              onClick={handleAddTag}
              disabled={!tagInput.trim() || loading}
              sx={{ minWidth: 80 }}
            >
              Add
            </Button>
          </Box>
          
          {formData.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                  disabled={loading}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.title.trim() || !formData.content.trim()}
          sx={{
            borderRadius: 2,
            minWidth: 100,
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Post'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePostModal;