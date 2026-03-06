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
      console.log('📥 Fetching topics...');
      const data = await topicService.getAllTopics();
      console.log('📦 Topics fetched:', data.length);
      setTopics(data);
    } catch (err: any) {
      console.error('❌ Error fetching topics:', err);
      const errorMsg = err.response?.data?.error || 'Failed to fetch topics';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Fetch topics on mount
  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const createTopic = async (data: CreateTopicData): Promise<Topic> => {
    if (!isAuthenticated) {
      addNotification({ type: 'error', message: 'Please login to create a topic' });
      throw new Error('Not authenticated');
    }

    setLoading(true);
    setError(null);
    try {
      console.log('➕ Creating topic:', data);
      const newTopic = await topicService.createTopic(data);
      console.log('✅ Topic created:', newTopic);
      
      // Immediately update the topics list with the new topic
      setTopics(prevTopics => [newTopic, ...prevTopics]);
      
      addNotification({ type: 'success', message: 'Topic created successfully!' });
      return newTopic;
    } catch (err: any) {
      console.error('❌ Error creating topic:', err);
      const errorMsg = err.response?.data?.error || 'Failed to create topic';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTopic = async (id: string, data: UpdateTopicData): Promise<Topic> => {
    if (!isAuthenticated) {
      addNotification({ type: 'error', message: 'Please login to update a topic' });
      throw new Error('Not authenticated');
    }

    setLoading(true);
    setError(null);
    try {
      const updatedTopic = await topicService.updateTopic(id, data);
      // Update the specific topic in the list
      setTopics(prev => prev.map(t => t.id === id ? updatedTopic : t));
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

  const deleteTopic = async (id: string): Promise<void> => {
    if (!isAuthenticated) {
      addNotification({ type: 'error', message: 'Please login to delete a topic' });
      throw new Error('Not authenticated');
    }

    setLoading(true);
    setError(null);
    try {
      await topicService.deleteTopic(id);
      setTopics(prev => prev.filter(t => t.id !== id));
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