import { useState, useEffect, useCallback } from 'react';
import { topicService } from '../services/topic.service';
import { Topic, CreateTopicData, UpdateTopicData } from '../types/topic.types';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';

export const useTopics = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await topicService.getAllTopics();
      setTopics(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch topics';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const createTopic = async (data: CreateTopicData) => {
    if (!isAuthenticated) {
      addNotification({ type: 'error', message: 'Please login to create a topic' });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const newTopic = await topicService.createTopic(data);
      setTopics((prev) => [newTopic, ...prev]);
      addNotification({ type: 'success', message: 'Topic created successfully!' });
      return newTopic;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to create topic';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTopic = async (id: string, data: UpdateTopicData) => {
    if (!isAuthenticated) {
      addNotification({ type: 'error', message: 'Please login to update a topic' });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const updatedTopic = await topicService.updateTopic(id, data);
      setTopics((prev) => prev.map(t => t.id === id ? updatedTopic : t));
      addNotification({ type: 'success', message: 'Topic updated successfully!' });
      return updatedTopic;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to update topic';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTopic = async (id: string) => {
    if (!isAuthenticated) {
      addNotification({ type: 'error', message: 'Please login to delete a topic' });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await topicService.deleteTopic(id);
      setTopics((prev) => prev.filter(t => t.id !== id));
      addNotification({ type: 'success', message: 'Topic deleted successfully!' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to delete topic';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    topics,
    loading,
    error,
    createTopic,
    updateTopic,
    deleteTopic,
    refresh: fetchTopics,
  };
};