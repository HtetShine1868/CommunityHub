import api from './api';
import { Topic, CreateTopicData, UpdateTopicData } from '../types/topic.types';

export const topicService = {
  async getAllTopics(): Promise<Topic[]> {
    const response = await api.get('/topics');
    return response.data;
  },

  async getTopicById(id: string): Promise<Topic> {
    const response = await api.get(`/topics/${id}`);
    return response.data;
  },

  async createTopic(data: CreateTopicData): Promise<Topic> {
    const response = await api.post('/topics', data);
    return response.data;
  },

  async updateTopic(id: string, data: UpdateTopicData): Promise<Topic> {
    const response = await api.put(`/topics/${id}`, data);
    return response.data;
  },

  async deleteTopic(id: string): Promise<void> {
    await api.delete(`/topics/${id}`);
  },
};