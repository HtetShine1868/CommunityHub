import { Post } from './post.types';
import { Topic } from './topic.types';
import { User } from './user.types';

export interface SearchFilters {
  q?: string;
  type?: 'posts' | 'topics' | 'users' | 'all';
  categoryId?: string;
  tags?: string[];
  sortBy?: 'relevance' | 'latest' | 'popular' | 'mostLiked';
  time?: 'today' | 'week' | 'month' | 'year' | 'all';
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  posts?: Post[];
  topics?: Topic[];
  users?: User[];
  totalPosts: number;
  totalTopics: number;
  totalUsers: number;
  page: number;
  pageSize: number;
}

export interface TrendingPost extends Post {
  trendScore?: number;
}

export interface PopularCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  topicCount: number;
  postCount: number;
}