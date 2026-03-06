import { User } from './user.types';
import { Topic } from './topic.types';
import { Category } from './category.types';
export interface Tag {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  contentHtml?: string;
  excerpt?: string;
  coverImage?: string;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isEdited?: boolean;
  userId: string;
  topicId: string;
  user?: User;
  topic?: Topic & { category?: Category };
  tags?: Tag[];
  likeCount: number;
  commentCount: number;
  liked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface PostFilters {
  topicId?: string;
  userId?: string;
  tag?: string;
  sort?: 'latest' | 'popular';
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}