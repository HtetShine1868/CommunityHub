import { useState, useMemo } from 'react';

interface SearchableItem {
  id: string;
  [key: string]: any;
}

export const useSearch = <T extends SearchableItem>(
  items: T[],
  searchFields: (keyof T)[]
) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(query);
      })
    );
  }, [items, searchQuery, searchFields]);

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
  };
};