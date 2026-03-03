import React, { useState, useRef } from 'react';
import {
  Paper,
  Avatar,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Badge,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  Person,
  Email,
  CalendarToday,
  AccessTime,
  PostAdd,
  Comment,
  People,
  Favorite,
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import { UserProfile } from '../../types/profile.types';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  stats?: {
    posts: number;
    comments: number;
    followers: number;
    following: number;
  };
  isOwnProfile: boolean;
  isFollowing?: boolean;
  followerCount?: number;
  loading?: boolean;
  onFollow?: () => void;
  onEditProfile?: () => void;
  onAvatarChange?: (file: File) => Promise<void>;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  stats,
  isOwnProfile,
  isFollowing = false,
  followerCount = 0,
  loading = false,
  onFollow,
  onEditProfile,
  onAvatarChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  const handleAvatarClick = () => {
    if (isOwnProfile && onAvatarChange && profile) {
      setAvatarDialogOpen(true);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onAvatarChange) return;

    setUploading(true);
    try {
      await onAvatarChange(file);
      setAvatarDialogOpen(false);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };


  const getJoinedDate = () => {
  if (!profile?.createdAt) return 'Unknown';
  try {
    const date = new Date(profile.createdAt);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Unknown';
    return format(date, 'MMMM yyyy');
  } catch {
    return 'Unknown';
  }
};



  // Show skeleton loading state
  if (loading) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Skeleton variant="circular" width={120} height={120} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="80%" height={60} />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Skeleton variant="rounded" width={80} height={32} />
              <Skeleton variant="rounded" width={80} height={32} />
              <Skeleton variant="rounded" width={80} height={32} />
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  }

  // Show nothing if no profile
  if (!profile) {
    return null;
  }

  return (
    <>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Avatar Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                isOwnProfile && onAvatarChange ? (
                  <Tooltip title="Change avatar">
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                      onClick={handleAvatarClick}
                    >
                      <PhotoCamera fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : null
              }
            >
              <Avatar
                src={profile.avatar}
                sx={{
                  width: { xs: 100, md: 120 },
                  height: { xs: 100, md: 120 },
                  fontSize: { xs: '3rem', md: '4rem' },
                  bgcolor: 'primary.main',
                  cursor: isOwnProfile && onAvatarChange ? 'pointer' : 'default',
                  transition: 'opacity 0.2s',
                  '&:hover': isOwnProfile && onAvatarChange ? { opacity: 0.8 } : {},
                }}
                onClick={handleAvatarClick}
              >
                {profile.username?.[0]?.toUpperCase() || '?'}
              </Avatar>
            </Badge>

            {isOwnProfile && (
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            )}
          </Box>

          {/* Profile Info */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {profile.username || 'Unknown User'}
              </Typography>
              
              {!isOwnProfile && (
                <Button
                  variant={isFollowing ? 'outlined' : 'contained'}
                  color="primary"
                  onClick={onFollow}
                  startIcon={<People />}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}
              
              {isOwnProfile && (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={onEditProfile}
                >
                  Edit Profile
                </Button>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              {profile.email || 'No email provided'}
            </Typography>

            {profile.bio && (
              <Typography variant="body1" sx={{ mt: 2, mb: 2, whiteSpace: 'pre-wrap' }}>
                {profile.bio}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              <Chip
                icon={<Person />}
                label={`Role: ${profile.role || 'user'}`}
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<CalendarToday />}
                label={`Joined ${getJoinedDate()}`}
                variant="outlined"
                size="small"
              />
         
            </Box>

            {stats && (
              <Box sx={{ display: 'flex', gap: 3, mt: 3, flexWrap: 'wrap' }}>
                <Tooltip title="Posts">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PostAdd color="action" fontSize="small" />
                    <Typography variant="body2">{stats.posts || 0}</Typography>
                  </Box>
                </Tooltip>
                <Tooltip title="Comments">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Comment color="action" fontSize="small" />
                    <Typography variant="body2">{stats.comments || 0}</Typography>
                  </Box>
                </Tooltip>
                <Tooltip title="Followers">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <People color="action" fontSize="small" />
                    <Typography variant="body2">{followerCount}</Typography>
                  </Box>
                </Tooltip>
                <Tooltip title="Following">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <People color="action" fontSize="small" />
                    <Typography variant="body2">{stats.following || 0}</Typography>
                  </Box>
                </Tooltip>
                <Tooltip title="Likes received">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Favorite color="action" fontSize="small" />
                    <Typography variant="body2">0</Typography>
                  </Box>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Avatar Upload Dialog */}
      <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)}>
        <DialogTitle>Change Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
            <Avatar
              src={profile.avatar}
              sx={{ width: 150, height: 150, fontSize: '4rem' }}
            >
              {profile.username?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <Button
              variant="contained"
              onClick={handleFileInputClick}
              disabled={uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <PhotoCamera />}
            >
              Choose Image
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileHeader;