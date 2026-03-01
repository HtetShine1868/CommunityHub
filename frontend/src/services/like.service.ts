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
};