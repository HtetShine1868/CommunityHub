import { User } from './user.types';
import { Post } from './post.types';
import { Comment } from './comment.types';

export interface UserProfile extends User {
  postCount?: number;
  commentCount?: number;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export interface ProfileStats {
  posts: number;
  comments: number;
  followers: number;
  following: number;
  joinedDate: string;
  lastActive: string;
}

export interface UpdateProfileData {
  username?: string;
  bio?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}