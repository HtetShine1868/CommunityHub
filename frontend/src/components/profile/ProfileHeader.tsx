import React, { useState } from 'react';
import {
  Paper,
  Avatar,
  Typography,
  Box,
  Button,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Person,
  Email,
  CalendarToday,
  AccessTime,
  PostAdd,
  Comment,
  PushPin,
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import { UserProfile } from '../../types/profile.types';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  stats?: {
    posts: number;
    comments: number;
    pinnedPosts: number;
    pinnedComments: number;
  };
  isOwnProfile: boolean;
  loading?: boolean;
  onEditProfile?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  stats,
  isOwnProfile,
  loading = false,
  onEditProfile,
}) => {
  const getJoinedDate = () => {
    if (!profile?.createdAt) return 'Unknown';
    try {
      const date = new Date(profile.createdAt);
      if (isNaN(date.getTime())) return 'Unknown';
      return format(date, 'MMMM yyyy');
    } catch {
      return 'Unknown';
    }
  };


  if (loading || !profile) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography>Loading profile...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Avatar Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            src={profile.avatar}
            sx={{
              width: { xs: 100, md: 120 },
              height: { xs: 100, md: 120 },
              fontSize: { xs: '3rem', md: '4rem' },
              bgcolor: 'primary.main',
            }}
          >
            {profile.username?.[0]?.toUpperCase() || '?'}
          </Avatar>
        </Box>

        {/* Profile Info */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {profile.username || 'Unknown User'}
            </Typography>
            
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
              <Tooltip title="Total Posts">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PostAdd color="action" fontSize="small" />
                  <Typography variant="body2">{stats.posts}</Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Total Comments">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Comment color="action" fontSize="small" />
                  <Typography variant="body2">{stats.comments}</Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Pinned Comments">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PushPin color="action" fontSize="small" />
                  <Typography variant="body2">{stats.pinnedComments}</Typography>
                </Box>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfileHeader;