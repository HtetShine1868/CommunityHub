import { useState, useEffect, useCallback } from 'react';
import { postService } from '../services/post.service';
import { likeService } from '../services/like.service';
import { Post, CreatePostData, UpdatePostData, PaginatedResponse } from '../types/post.types';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';

export const usePosts = (topicId?: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const { addNotification } = useUIStore();
  const { user } = useAuthStore();

  const fetchPosts = useCallback(async () => {
    if (!topicId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await postService.getPostsByTopic(topicId, page, pageSize);
      setPosts(response.data || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch posts';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  }, [topicId, page, pageSize, addNotification]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (data: CreatePostData): Promise<Post> => {
    if (!topicId) throw new Error('Topic ID is required');
    setLoading(true);
    setError(null);
    try {
      const newPost = await postService.createPost(topicId, data);
      setPosts((prev) => [newPost, ...prev]);
      addNotification({ type: 'success', message: 'Post created successfully!' });
      return newPost;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to create post';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (id: string, data: UpdatePostData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPost = await postService.updatePost(id, data);
      setPosts((prev) => prev.map(p => p.id === id ? updatedPost : p));
      addNotification({ type: 'success', message: 'Post updated successfully!' });
      return updatedPost;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to update post';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await postService.deletePost(id);
      setPosts((prev) => prev.filter(p => p.id !== id));
      addNotification({ type: 'success', message: 'Post deleted successfully!' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to delete post';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      addNotification({ type: 'info', message: 'Please login to like posts' });
      return;
    }
    try {
      const { liked, count } = await likeService.togglePostLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, liked, likeCount: count } : p
        )
      );
    } catch (err: any) {
      addNotification({ type: 'error', message: 'Failed to toggle like' });
    }
  };

  const togglePin = async (postId: string) => {
    try {
      await postService.togglePin(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isPinned: !p.isPinned } : p))
      );
      addNotification({ type: 'success', message: 'Post pin toggled' });
    } catch (err: any) {
      addNotification({ type: 'error', message: 'Failed to toggle pin' });
    }
  };

  const toggleLock = async (postId: string) => {
    try {
      await postService.toggleLock(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isLocked: !p.isLocked } : p))
      );
      addNotification({ type: 'success', message: 'Post lock toggled' });
    } catch (err: any) {
      addNotification({ type: 'error', message: 'Failed to toggle lock' });
    }
  };

  return {
    posts,
    loading,
    error,
    total,
    page,
    setPage,
    pageSize,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    togglePin,
    toggleLock,
    refresh: fetchPosts,
  };
};