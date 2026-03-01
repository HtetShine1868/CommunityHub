import api from './api';
import { Comment, CreateCommentData, UpdateCommentData, PaginatedResponse } from '../types/comment.types';

export const commentService = {
  async getCommentsByPost(postId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<Comment>> {
    const response = await api.get(`/posts/${postId}/comments`, {
      params: { page, pageSize },
    });
    return response.data;
  },

  async createComment(postId: string, data: CreateCommentData): Promise<Comment> {
    const response = await api.post(`/posts/${postId}/comments`, data);
    return response.data;
  },

  async updateComment(id: string, data: UpdateCommentData): Promise<Comment> {
    const response = await api.put(`/comments/${id}`, data);
    return response.data;
  },

  async deleteComment(id: string): Promise<void> {
    await api.delete(`/comments/${id}`);
  },

  async getReplies(commentId: string, page = 1, pageSize = 10): Promise<PaginatedResponse<Comment>> {
    const response = await api.get(`/comments/${commentId}/replies`, {
      params: { page, pageSize },
    });
    return response.data;
  },
};