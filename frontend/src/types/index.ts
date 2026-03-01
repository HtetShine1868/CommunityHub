export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  last_login_at?: string;
}

export interface Topic {
  id: number;
  name: string;
  description: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  post_count?: number;
  creator?: User;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  topic_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  topic_name?: string;
  username?: string;
  author?: User;
  topic?: Topic;
  comment_count?: number;
  vote_count?: number;
  upvotes?: number;
  downvotes?: number;
  user_vote?: boolean | null;
}

export interface Comment {
  id: number;
  content: string;
  post_id: number;
  user_id: number;
  parent_comment_id?: number | null;
  created_at: string;
  updated_at: string;
  author?: User;
  replies?: Comment[];
  reply_count?: number;
  vote_count?: number;
  upvotes?: number;
  downvotes?: number;
  user_vote?: boolean | null;
}

// Notification types
export type NotificationType = 'reply' | 'vote' | 'mention' | 'follow';

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  content: string;
  post_id?: number;
  comment_id?: number;
  from_user_id: number;
  from_username: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

// Vote types
export interface VoteState {
  postVotes: { [key: number]: { upvotes: number; downvotes: number; score: number } };
  commentVotes: { [key: number]: { upvotes: number; downvotes: number; score: number } };
  userVotes: {
    posts: { [key: number]: boolean | null };
    comments: { [key: number]: boolean | null };
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
   initialLoadDone?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}