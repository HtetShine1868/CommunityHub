import { User } from './user.types';
import { Category } from './category.types';

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon?: string;
  banner?: string;
  color?: string;
  isPrivate: boolean;
  categoryId?: string;
  userId: string;
  user?: User;
  category?: Category; // Add this
  postCount?: number;
  followerCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicData {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  isPrivate?: boolean;
  categoryId?: string; // Add this
}

export interface UpdateTopicData {
  title?: string;
  description?: string;
  icon?: string;
  color?: string;
  isPrivate?: boolean;
  categoryId?: string; // Add this
}