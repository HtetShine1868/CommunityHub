import { User } from './user.types';

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon?: string;
  banner?: string;
  color?: string;
  isPrivate: boolean;
  isLocked?: boolean; // Add this
  userId: string;
  user?: User;
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
}

export interface UpdateTopicData {
  title?: string;
  description?: string;
  icon?: string;
  color?: string;
  isPrivate?: boolean;
}