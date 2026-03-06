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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  InputAdornment,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Category as CategoryIcon,
  ColorLens,
  Lock,
  Public,
  Title,
  Description,
  Close,
} from '@mui/icons-material';
import { Category } from '../../types/category.types';
import { categoryService } from '../../services/category.service';

interface CreateTopicModalProps {
  open: boolean;
  onClose: () => void;
  onCreateTopic: (data: any) => Promise<void>;
}

const CreateTopicModal: React.FC<CreateTopicModalProps> = ({ 
  open, 
  onClose, 
  onCreateTopic 
}) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#6366f1',
    isPrivate: false,
    categoryId: '',
  });

  // Fetch categories when modal opens
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        title: '',
        description: '',
        color: '#6366f1',
        isPrivate: false,
        categoryId: '',
      });
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await onCreateTopic({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        isPrivate: formData.isPrivate,
        categoryId: formData.categoryId || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create topic');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const selectedCategory = categories.find(c => c.id === formData.categoryId);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      disableEnforceFocus
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
      TransitionProps={{
        onExited: () => {
          document.body.style.overflow = 'unset';
        },
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
          background: `linear-gradient(135deg, ${formData.color} 0%, ${formData.color}dd 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Create New Topic
        </span>
        <IconButton onClick={handleClose} size="small" disabled={loading}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
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
                <Title color="action" />
              </InputAdornment>
            ),
          }}
          helperText={formData.title.length > 0 ? `${formData.title.length}/100` : ''}
          inputProps={{ maxLength: 100 }}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            disabled={loading || loadingCategories}
            startAdornment={
              <InputAdornment position="start">
                <CategoryIcon color="action" />
              </InputAdornment>
            }
            renderValue={(selected) => {
              const category = categories.find(c => c.id === selected);
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {category?.icon && (
                    <Avatar 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        bgcolor: category.color || 'primary.main',
                        fontSize: '0.875rem'
                      }}
                    >
                      {category.icon}
                    </Avatar>
                  )}
                  <span>{category?.name}</span>
                </Box>
              );
            }}
          >
            <MenuItem value="">
              <em>No category</em>
            </MenuItem>
            {loadingCategories ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} /> Loading categories...
              </MenuItem>
            ) : (
              categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {category.icon && (
                      <Avatar 
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          bgcolor: category.color || 'primary.main',
                          fontSize: '1rem'
                        }}
                      >
                        {category.icon}
                      </Avatar>
                    )}
                    <Box>
                      <Typography variant="body2">{category.name}</Typography>
                      {category.description && (
                        <Typography variant="caption" color="text.secondary">
                          {category.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {selectedCategory && (
          <Box sx={{ mt: 1, mb: 1 }}>
            <Chip
              icon={<span>{selectedCategory.icon}</span>}
              label={selectedCategory.name}
              onDelete={() => setFormData({ ...formData, categoryId: '' })}
              color="primary"
              variant="outlined"
              disabled={loading}
            />
          </Box>
        )}

        <TextField
          fullWidth
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          margin="normal"
          multiline
          rows={3}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                <Description color="action" />
              </InputAdornment>
            ),
          }}
          placeholder="What is this topic about? (optional)"
        />

        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ColorLens color="action" />
            <TextField
              label="Topic Color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              disabled={loading}
              sx={{ width: 100 }}
              size="small"
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                disabled={loading}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {formData.isPrivate ? <Lock fontSize="small" /> : <Public fontSize="small" />}
                {formData.isPrivate ? 'Private Topic' : 'Public Topic'}
              </Box>
            }
          />
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
          disabled={loading || !formData.title.trim()}
          sx={{
            borderRadius: 2,
            background: `linear-gradient(135deg, ${formData.color} 0%, ${formData.color}dd 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${formData.color}dd 0%, ${formData.color} 100%)`,
            },
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Topic'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTopicModal;