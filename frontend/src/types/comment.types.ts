import { User } from './user.types';

export interface Comment {
  id: string;
  content: string;
  contentHtml?: string;
  userId: string;
  postId: string;
  parentId?: string;
   isPinned: boolean; 
  isEdited: boolean;
  editedAt?: string;
  user?: User;
  replies?: Comment[];
  likeCount: number;
  liked?: boolean;
  replyCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentData {
  content: string;
  parentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}