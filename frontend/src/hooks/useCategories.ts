import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/category.service';
import { Category } from '../types/category.types';
import { useUIStore } from '../store/uiStore';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useUIStore();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('❌ Error fetching categories:', err);
      const errorMsg = err.response?.data?.error || 'Failed to fetch categories';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
  };
};
