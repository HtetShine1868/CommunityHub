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
  Tab,
  Tabs,
} from '@mui/material';
import { UserProfile, UpdateProfileData, ChangePasswordData } from '../../types/profile.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (data: UpdateProfileData) => Promise<void>;
  onChangePassword: (data: ChangePasswordData) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  open,
  onClose,
  profile,
  onUpdateProfile,
  onChangePassword,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: profile.username,
    bio: profile.bio || '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (open) {
      setProfileForm({
        username: profile.username,
        bio: profile.bio || '',
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setError(null);
    }
  }, [open, profile]);

  const validatePasswordForm = (): boolean => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    let isValid = true;

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handleProfileSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await onUpdateProfile({
        username: profileForm.username !== profile.username ? profileForm.username : undefined,
        bio: profileForm.bio !== profile.bio ? profileForm.bio : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!validatePasswordForm()) return;

    setLoading(true);
    setError(null);
    try {
      await onChangePassword(passwordForm);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ px: 3 }}>
        <Tab label="Profile" />
        <Tab label="Password" />
      </Tabs>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TabPanel value={tabValue} index={0}>
          <TextField
            fullWidth
            label="Username"
            value={profileForm.username}
            onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
            margin="normal"
            disabled={loading}
            helperText="Changing username will affect how others see you"
          />
          <TextField
            fullWidth
            label="Bio"
            value={profileForm.bio}
            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
            margin="normal"
            multiline
            rows={4}
            disabled={loading}
            placeholder="Tell us about yourself..."
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            margin="normal"
            error={!!passwordErrors.currentPassword}
            helperText={passwordErrors.currentPassword}
            disabled={loading}
          />
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            margin="normal"
            error={!!passwordErrors.newPassword}
            helperText={passwordErrors.newPassword || 'Minimum 6 characters'}
            disabled={loading}
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            margin="normal"
            error={!!passwordErrors.confirmPassword}
            helperText={passwordErrors.confirmPassword}
            disabled={loading}
          />
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={tabValue === 0 ? handleProfileSubmit : handlePasswordSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;