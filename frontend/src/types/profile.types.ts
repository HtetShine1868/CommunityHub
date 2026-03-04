import { User } from './user.types';
import { Post } from './post.types';
import { Comment } from './comment.types';

export interface UserProfile extends User {
  postCount?: number;
  commentCount?: number;
}

export interface ProfileStats {
  posts: number;
  comments: number;
  pinnedPosts: number;
  pinnedComments: number;
  joinedDate: string;
}

export interface UpdateProfileData {
  username?: string;
  bio?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}