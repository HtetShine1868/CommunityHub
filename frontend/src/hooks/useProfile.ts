import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { profileService } from '../services/profile.service';
import { UserProfile, UpdateProfileData, ProfileStats } from '../types/profile.types';
import { Post } from '../types/post.types';
import { Comment } from '../types/comment.types';

export const useProfile = (userId?: string) => {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<Post[]>([]);
  const [pinnedComments, setPinnedComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [postsPage, setPostsPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [postsTotal, setPostsTotal] = useState(0);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const pageSize = 10;

  const isOwnProfile = !userId || userId === user?.id;

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!userId && !isOwnProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let profileData;
      if (isOwnProfile) {
        profileData = await profileService.getMyProfile();
      } else {
        profileData = await profileService.getUserProfile(userId!);
      }
      setProfile(profileData);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId, isOwnProfile]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!userId && !isOwnProfile) return;
    
    try {
      const targetId = userId || user?.id;
      if (!targetId) return;
      
      const statsData = await profileService.getUserStats(targetId);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [userId, user?.id, isOwnProfile]);

  // Fetch user posts
  const fetchPosts = useCallback(async (page = postsPage) => {
    if (!userId && !isOwnProfile) return;
    
    setPostsLoading(true);
    try {
      const targetId = userId || user?.id;
      if (!targetId) return;
      
      const response = await profileService.getUserPosts(targetId, page, pageSize);
      setPosts(response.data || []);
      setPostsTotal(response.total || 0);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setPostsLoading(false);
    }
  }, [userId, user?.id, isOwnProfile, postsPage]);

  // Fetch user comments
  const fetchComments = useCallback(async (page = commentsPage) => {
    if (!userId && !isOwnProfile) return;
    
    setCommentsLoading(true);
    try {
      const targetId = userId || user?.id;
      if (!targetId) return;
      
      const response = await profileService.getUserComments(targetId, page, pageSize);
      setComments(response.data || []);
      setCommentsTotal(response.total || 0);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  }, [userId, user?.id, isOwnProfile, commentsPage]);

  // Initial load
  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchPosts();
    fetchComments();
  }, [fetchProfile, fetchStats, fetchPosts, fetchComments]);

  // Update profile
  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    try {
      const updated = await profileService.updateProfile(data);
      setProfile(updated);
      addNotification({
        type: 'success',
        message: 'Profile updated successfully!',
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to update profile';
      addNotification({
        type: 'error',
        message: errorMsg,
      });
      throw err;
    }
  };

  return {
    profile,
    stats,
    posts,
    comments,
    pinnedPosts,
    pinnedComments,
    loading,
    postsLoading,
    commentsLoading,
    error,
    isOwnProfile,
    
    // Pagination
    postsPage,
    commentsPage,
    postsTotal,
    commentsTotal,
    setPostsPage,
    setCommentsPage,
    
    // Actions
    updateProfile,
    refresh: fetchProfile,
    refreshPosts: () => fetchPosts(1),
    refreshComments: () => fetchComments(1),
  };
};