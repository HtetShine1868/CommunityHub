import api from './api';

export const likeService = {
  async togglePostLike(postId: string): Promise<{ liked: boolean; count: number }> {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  async toggleCommentLike(commentId: string): Promise<{ liked: boolean; count: number }> {
    const response = await api.post(`/comments/${commentId}/like`);
    return response.data;
  },

  async getPostLikeInfo(postId: string): Promise<{ liked: boolean; count: number }> {
    try {
      const response = await api.get(`/posts/${postId}/like-info`);
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist, return default values
      return { liked: false, count: 0 };
    }
  },

  async getCommentLikeInfo(commentId: string): Promise<{ liked: boolean; count: number }> {
    try {
      const response = await api.get(`/comments/${commentId}/like-info`);
      return response.data;
    } catch (error) {
      return { liked: false, count: 0 };
    }
  },

  async checkPostLike(postId: string): Promise<{ liked: boolean; count: number }> {
    const response = await api.get(`/posts/${postId}/like`);
    return response.data;
  }
};