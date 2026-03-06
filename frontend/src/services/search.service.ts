import api from './api';
import { SearchFilters, SearchResult, TrendingPost, PopularCategory } from '../types/search.types';

export const searchService = {
  async search(filters: SearchFilters): Promise<SearchResult> {
    const params = new URLSearchParams();
    
    if (filters.q) params.append('q', filters.q);
    if (filters.type) params.append('type', filters.type);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.time) params.append('time', filters.time);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.tags?.length) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }
    
    const response = await api.get('/search', { params });
    return response.data;
  },

  async getTrending(limit = 10, time: 'day' | 'week' | 'month' = 'week'): Promise<TrendingPost[]> {
    const response = await api.get('/trending', { params: { limit, time } });
    return response.data;
  },

  async getPopularCategories(): Promise<PopularCategory[]> {
    const response = await api.get('/categories/popular');
    return response.data;
  },
};