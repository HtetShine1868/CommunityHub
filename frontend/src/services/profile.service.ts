import api from './api';
import { UserProfile, UpdateProfileData, ChangePasswordData, ProfileStats } from '../types/profile.types';
import { Post } from '../types/post.types';
import { Comment } from '../types/comment.types';

export const profileService = {

  async getProfile(userId: string): Promise<UserProfile> {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
  },


  async getMyProfile(): Promise<UserProfile> {
    const response = await api.get('/user/profile');
    return response.data;
  },


  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await api.put('/user/profile', data);
    return response.data;
  },

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await api.post('/user/change-password', data);
    return response.data;
  },


  async getUserPosts(userId: string, page = 1, pageSize = 10): Promise<{ data: Post[]; total: number }> {
    const response = await api.get(`/users/${userId}/posts`, {
      params: { page, pageSize },
    });
    return response.data;
  },


  async getUserComments(userId: string, page = 1, pageSize = 10): Promise<{ data: Comment[]; total: number }> {
    const response = await api.get(`/users/${userId}/comments`, {
      params: { page, pageSize },
    });
    return response.data;
  },


  async getSavedPosts(page = 1, pageSize = 10): Promise<{ data: Post[]; total: number }> {
    const response = await api.get('/user/saved-posts', {
      params: { page, pageSize },
    });
    return response.data;
  },


  async getLikedPosts(page = 1, pageSize = 10): Promise<{ data: Post[]; total: number }> {
    const response = await api.get('/user/liked-posts', {
      params: { page, pageSize },
    });
    return response.data;
  },


  async getProfileStats(userId: string): Promise<ProfileStats> {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  },

 
  async toggleFollow(userId: string): Promise<{ following: boolean; followerCount: number }> {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },


  async isFollowing(userId: string): Promise<boolean> {
    const response = await api.get(`/users/${userId}/is-following`);
    return response.data.following;
  },


  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};