import api from './api';
import { UserProfile, UpdateProfileData, ChangePasswordData, ProfileStats } from '../types/profile.types';
import { Post,PaginatedResponse } from '../types/post.types';
import { Comment } from '../types/comment.types';

export const profileService = {

  async getUserProfile(userId: string): Promise<UserProfile> {
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


   async getUserPosts(userId: string, page = 1, pageSize = 10): Promise<PaginatedResponse<Post>> {
    const response = await api.get(`/users/${userId}/posts`, {
      params: { page, pageSize },
    });
    return response.data;
  },

  async getUserComments(userId: string, page = 1, pageSize = 10): Promise<PaginatedResponse<Comment>> {
    const response = await api.get(`/users/${userId}/comments`, {
      params: { page, pageSize },
    });
    return response.data;
  },

   async getUserStats(userId: string): Promise<ProfileStats> {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  },

  async getPinnedPostsByTopic(topicId: string): Promise<Post[]> {
    const response = await api.get(`/topics/${topicId}/pinned-posts`);
    return response.data;
  },

  async getPinnedCommentsByPost(postId: string): Promise<Comment[]> {
    const response = await api.get(`/posts/${postId}/pinned-comments`);
    return response.data;
  },
};