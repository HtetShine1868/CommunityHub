import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { UserProfile, UpdateProfileData } from '../../types/profile.types';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (data: UpdateProfileData) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  open,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: profile.username,
    bio: profile.bio || '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        username: profile.username,
        bio: profile.bio || '',
      });
      setError(null);
    }
  }, [open, profile]);

  const handleSubmit = async () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onUpdateProfile({
        username: formData.username !== profile.username ? formData.username : undefined,
        bio: formData.bio !== profile.bio ? formData.bio : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TextField
          fullWidth
          label="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          margin="normal"
          required
          disabled={loading}
        />
        
        <TextField
          fullWidth
          label="Bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          margin="normal"
          multiline
          rows={4}
          disabled={loading}
          placeholder="Tell us about yourself..."
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.username.trim()}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;