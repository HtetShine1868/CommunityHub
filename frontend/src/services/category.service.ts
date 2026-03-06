import api from './api';
import { Category } from '../types/category.types';

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
};