import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { profileService } from '../services/profile.service';
import { UserProfile, UpdateProfileData, ChangePasswordData, ProfileStats } from '../types/profile.types';
import { Post } from '../types/post.types';
import { Comment } from '../types/comment.types';

export const useProfile = (userId?: string) => {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [likedLoading, setLikedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  // Pagination
  const [postsPage, setPostsPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [savedPage, setSavedPage] = useState(1);
  const [likedPage, setLikedPage] = useState(1);
  const [postsTotal, setPostsTotal] = useState(0);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [savedTotal, setSavedTotal] = useState(0);
  const [likedTotal, setLikedTotal] = useState(0);
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
        profileData = await profileService.getProfile(userId!);
      }
      setProfile(profileData);
      
      // Check if following (for other users)
      if (!isOwnProfile && userId) {
        const following = await profileService.isFollowing(userId);
        setIsFollowing(following);
      }
      
      // Get follower count
      if (profileData.followerCount !== undefined) {
        setFollowerCount(profileData.followerCount);
      }
      
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
      
      const statsData = await profileService.getProfileStats(targetId);
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

  // Fetch saved posts (only for own profile)
  const fetchSavedPosts = useCallback(async (page = savedPage) => {
    if (!isOwnProfile) return;
    
    setSavedLoading(true);
    try {
      const response = await profileService.getSavedPosts(page, pageSize);
      setSavedPosts(response.data || []);
      setSavedTotal(response.total || 0);
    } catch (err) {
      console.error('Failed to fetch saved posts:', err);
    } finally {
      setSavedLoading(false);
    }
  }, [isOwnProfile, savedPage]);

  // Fetch liked posts
  const fetchLikedPosts = useCallback(async (page = likedPage) => {
    if (!isOwnProfile) return;
    
    setLikedLoading(true);
    try {
      const response = await profileService.getLikedPosts(page, pageSize);
      setLikedPosts(response.data || []);
      setLikedTotal(response.total || 0);
    } catch (err) {
      console.error('Failed to fetch liked posts:', err);
    } finally {
      setLikedLoading(false);
    }
  }, [isOwnProfile, likedPage]);

  // Initial load
  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchPosts();
    fetchComments();
    
    if (isOwnProfile) {
      fetchSavedPosts();
      fetchLikedPosts();
    }
  }, [fetchProfile, fetchStats, fetchPosts, fetchComments, fetchSavedPosts, fetchLikedPosts, isOwnProfile]);

  // ✅ FIXED: Update profile - returns Promise<void> to match component expectation
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

  // ✅ FIXED: Change password - already returns Promise<void>, good!
  const changePassword = async (data: ChangePasswordData): Promise<void> => {
    try {
      const response = await profileService.changePassword(data);
      addNotification({
        type: 'success',
        message: response.message || 'Password changed successfully!',
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to change password';
      addNotification({
        type: 'error',
        message: errorMsg,
      });
      throw err;
    }
  };

  // Toggle follow
  const toggleFollow = async (): Promise<void> => {
    if (!userId || isOwnProfile) return;
    
    try {
      const { following, followerCount: newCount } = await profileService.toggleFollow(userId);
      setIsFollowing(following);
      setFollowerCount(newCount);
      addNotification({
        type: 'success',
        message: following ? 'User followed!' : 'User unfollowed!',
      });
    } catch (err: any) {
      addNotification({
        type: 'error',
        message: 'Failed to follow/unfollow user',
      });
    }
  };

  // ✅ FIXED: Upload avatar - returns Promise<void> to match component expectation
  const uploadAvatar = async (file: File): Promise<void> => {
    try {
      const { avatarUrl } = await profileService.uploadAvatar(file);
      setProfile(prev => prev ? { ...prev, avatar: avatarUrl } : null);
      addNotification({
        type: 'success',
        message: 'Avatar updated successfully!',
      });
    } catch (err: any) {
      addNotification({
        type: 'error',
        message: 'Failed to upload avatar',
      });
      throw err;
    }
  };

  return {
    profile,
    stats,
    posts,
    comments,
    savedPosts,
    likedPosts,
    loading,
    postsLoading,
    commentsLoading,
    savedLoading,
    likedLoading,
    error,
    isOwnProfile,
    isFollowing,
    followerCount,
    
    // Pagination
    postsPage,
    commentsPage,
    savedPage,
    likedPage,
    postsTotal,
    commentsTotal,
    savedTotal,
    likedTotal,
    setPostsPage,
    setCommentsPage,
    setSavedPage,
    setLikedPage,
    
    // Actions - all return Promise<void>
    updateProfile,
    changePassword,
    toggleFollow,
    uploadAvatar,
    refresh: fetchProfile,
    refreshPosts: () => fetchPosts(1),
    refreshComments: () => fetchComments(1),
    refreshSaved: () => fetchSavedPosts(1),
    refreshLiked: () => fetchLikedPosts(1),
  };
};