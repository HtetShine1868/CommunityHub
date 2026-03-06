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
import { useUIStore } from '../store/uiStore';
import { commentService } from '../services/comment.service';
import { likeService } from '../services/like.service';
import ProfileHeader from '../components/profile/ProfileHeader';
import EditProfileModal from '../components/profile/EditProfileModal';
import ProfileTabs from '../components/profile/ProfileTabs';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuthStore();
  const { addNotification } = useUIStore();
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
    refreshComments,
    refreshPosts,
  } = useProfile(userId);

  // Handle comment like
  const handleCommentLike = async (commentId: string) => {
    if (!user) {
      addNotification({ type: 'info', message: 'Please login to like comments' });
      return;
    }
    try {
      await likeService.toggleCommentLike(commentId);
      refreshComments();
      addNotification({ type: 'success', message: 'Comment liked!' });
    } catch (err) {
      addNotification({ type: 'error', message: 'Failed to like comment' });
    }
  };

  // Handle comment reply
  const handleCommentReply = async (commentId: string, content: string) => {
    if (!user) {
      addNotification({ type: 'info', message: 'Please login to reply' });
      return;
    }
    try {
      // You need to pass the postId - you might need to get it from the comment
      // This is a placeholder - you'll need to implement properly
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        await commentService.createComment(comment.postId, { 
          content, 
          parentId: commentId 
        });
        refreshComments();
        addNotification({ type: 'success', message: 'Reply posted!' });
      }
    } catch (err) {
      addNotification({ type: 'error', message: 'Failed to post reply' });
    }
  };

  // Handle comment delete
  const handleCommentDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await commentService.deleteComment(commentId);
      refreshComments();
      addNotification({ type: 'success', message: 'Comment deleted' });
    } catch (err) {
      addNotification({ type: 'error', message: 'Failed to delete comment' });
    }
  };

  // Handle comment edit
  const handleCommentEdit = async (commentId: string, content: string) => {
    try {
      await commentService.updateComment(commentId, { content });
      refreshComments();
      addNotification({ type: 'success', message: 'Comment updated' });
    } catch (err) {
      addNotification({ type: 'error', message: 'Failed to update comment' });
    }
  };

  // Handle post like
  const handlePostLike = async (postId: string) => {
    if (!user) {
      addNotification({ type: 'info', message: 'Please login to like posts' });
      return;
    }
    try {
      await likeService.togglePostLike(postId);
      refreshPosts();
      addNotification({ type: 'success', message: 'Post liked!' });
    } catch (err) {
      addNotification({ type: 'error', message: 'Failed to like post' });
    }
  };

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
        <MuiLink
          component="button"
          variant="body1"
          onClick={() => navigate('/topics')}
          sx={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          Topics
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
        onPostLike={handlePostLike}
        onCommentLike={handleCommentLike}
        onCommentReply={handleCommentReply}
        onCommentDelete={handleCommentDelete}
        onCommentEdit={handleCommentEdit}
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