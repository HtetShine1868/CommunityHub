import React from 'react';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Typography,
  Pagination,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  PostAdd,
  Comment,
  PushPin,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { Post } from '../../types/post.types';
import { Comment as CommentType } from '../../types/comment.types';
import PostCard from '../posts/PostCard';
import CommentCard from '../comments/CommentCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

interface ProfileTabsProps {
  value: number;
  onChange: (value: number) => void;
  posts: Post[];
  comments: CommentType[];
  loading: {
    posts: boolean;
    comments: boolean;
  };
  pagination: {
    posts: { page: number; total: number; onChange: (page: number) => void };
    comments: { page: number; total: number; onChange: (page: number) => void };
  };
  onPostLike?: (postId: string) => void;
  onCommentLike?: (commentId: string) => void;
  onCommentReply?: (commentId: string, content: string) => void;
  onCommentDelete?: (commentId: string) => void;
  onCommentEdit?: (commentId: string, content: string) => void;
  pageSize?: number;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  value,
  onChange,
  posts,
  comments,
  loading,
  pagination,
  onPostLike,
  onCommentLike,
  onCommentReply,
  onCommentDelete,
  onCommentEdit,
  pageSize = 10,
}) => {
  const { user } = useAuthStore();

  const calculateTotalPages = (total: number) => Math.ceil(total / pageSize);

  const renderPinnedBadge = (isPinned: boolean) => {
    if (!isPinned) return null;
    return (
      <Chip
        icon={<PushPin />}
        label="Pinned"
        size="small"
        color="primary"
        sx={{ ml: 1 }}
      />
    );
  };

  return (
    <Paper sx={{ width: '100%' }}>
      <Tabs
        value={value}
        onChange={(_, v) => onChange(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<PostAdd />} label="Posts" iconPosition="start" />
        <Tab icon={<Comment />} label="Comments" iconPosition="start" />
      </Tabs>

      {/* Posts Tab */}
      <TabPanel value={value} index={0}>
        {loading.posts ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No posts yet.
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {posts.map((post) => (
                <Box key={post.id}>
                  {post.isPinned && renderPinnedBadge(true)}
                  <PostCard
                    post={post}
                    onLike={() => onPostLike?.(post.id)}
                  />
                </Box>
              ))}
            </Box>
            {pagination.posts.total > pageSize && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={calculateTotalPages(pagination.posts.total)}
                  page={pagination.posts.page}
                  onChange={(_, page) => pagination.posts.onChange(page)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </TabPanel>

      {/* Comments Tab */}
      <TabPanel value={value} index={1}>
        {loading.comments ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : comments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No comments yet.
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {comments.map((comment) => (
                <Box key={comment.id}>
                  {comment.isPinned && renderPinnedBadge(true)}
                  <CommentCard
                    comment={comment}
                    onLike={() => onCommentLike?.(comment.id)}
                    onReply={(content) => onCommentReply?.(comment.id, content)}
                    onDelete={() => onCommentDelete?.(comment.id)}
                    onEdit={(content) => onCommentEdit?.(comment.id, content)}
                    currentUserId={user?.id}
                    isPostAuthor={false} // You might want to pass this from parent if needed
                  />
                </Box>
              ))}
            </Box>
            {pagination.comments.total > pageSize && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={calculateTotalPages(pagination.comments.total)}
                  page={pagination.comments.page}
                  onChange={(_, page) => pagination.comments.onChange(page)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </TabPanel>
    </Paper>
  );
};

export default ProfileTabs;