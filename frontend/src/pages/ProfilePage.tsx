import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { useProfile } from '../hooks/useProfile';
import ProfileHeader from '../components/profile/ProfileHeader';
import EditProfileModal from '../components/profile/EditProfileModal';
import ProfileTabs from '../components/profile/ProfileTabs';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const {
    profile,
    stats,
    posts,
    comments,
    loading: profileLoading,
    postsLoading,
    commentsLoading,
    error,
    isOwnProfile,
    postsPage,
    commentsPage,
    postsTotal,
    commentsTotal,
    setPostsPage,
    setCommentsPage,
    updateProfile,
  } = useProfile(userId);

  // Show loading while auth is being checked
  if (authLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated and trying to view own profile
  useEffect(() => {
    if (!user && !userId) {
      navigate('/login');
    }
  }, [user, userId, navigate]);

  // Show loading while profile is loading
  if (profileLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Show error if profile not found
  if (error || !profile) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Profile not found'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink
          component="button"
          variant="body1"
          onClick={() => navigate('/')}
          sx={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          Home
        </MuiLink>
        <Typography color="text.primary">
          {isOwnProfile ? 'My Profile' : profile.username}
        </Typography>
      </Breadcrumbs>

      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        stats={stats || undefined}
        isOwnProfile={isOwnProfile}
        loading={false}
        onEditProfile={() => setEditModalOpen(true)}
      />

      {/* Profile Tabs */}
      <ProfileTabs
        value={tabValue}
        onChange={setTabValue}
        posts={posts}
        comments={comments}
        loading={{
          posts: postsLoading,
          comments: commentsLoading,
        }}
        pagination={{
          posts: {
            page: postsPage,
            total: postsTotal,
            onChange: setPostsPage,
          },
          comments: {
            page: commentsPage,
            total: commentsTotal,
            onChange: setCommentsPage,
          },
        }}
        onPostLike={() => {}}
        onCommentLike={() => {}}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        profile={profile}
        onUpdateProfile={updateProfile}
      />
    </Container>
  );
};

export default ProfilePage;