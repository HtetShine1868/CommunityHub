import api from './api';
import { Post, CreatePostData, UpdatePostData, PaginatedResponse } from '../types/post.types';

export const postService = {
  async getPostsByTopic(topicId: string, page = 1, pageSize = 10): Promise<PaginatedResponse<Post>> {
    const response = await api.get(`/topics/${topicId}/posts`, {
      params: { page, pageSize },
    });
        return {
      data: response.data.data || [],
      total: response.data.total || 0,
      page: response.data.page || 1,
      pageSize: response.data.pageSize || 10,
      totalPages: response.data.totalPages || 0,
    };
  },

  async getPostById(id: string): Promise<Post> {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  async createPost(topicId: string, data: CreatePostData): Promise<Post> {
    const response = await api.post(`/topics/${topicId}/posts`, data);
    return response.data;
  },

  async updatePost(id: string, data: UpdatePostData): Promise<Post> {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },

  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },

  async togglePin(id: string): Promise<void> {
    await api.post(`/posts/${id}/pin`);
  },

  async toggleLock(id: string): Promise<void> {
    await api.post(`/posts/${id}/lock`);
  },

  async getPopularPosts(limit = 10): Promise<Post[]> {
    const response = await api.get('/popular-posts', { params: { limit } });
    return response.data;
  },

  async getRecentPosts(limit = 10): Promise<Post[]> {
    const response = await api.get('/recent-posts', { params: { limit } });
    return response.data;
  },
};