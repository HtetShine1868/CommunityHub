import React from 'react';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Typography,
  Pagination,
  CircularProgress,
} from '@mui/material';
import {
  PostAdd,
  Comment,
  Bookmark,
  Favorite,
} from '@mui/icons-material';
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
  savedPosts: Post[];
  likedPosts: Post[];
  loading: {
    posts: boolean;
    comments: boolean;
    saved: boolean;
    liked: boolean;
  };
  pagination: {
    posts: { page: number; total: number; onChange: (page: number) => void };
    comments: { page: number; total: number; onChange: (page: number) => void };
    saved: { page: number; total: number; onChange: (page: number) => void };
    liked: { page: number; total: number; onChange: (page: number) => void };
  };
  onPostLike?: (postId: string) => void;
  onCommentLike?: (commentId: string) => void;
  isOwnProfile: boolean;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  value,
  onChange,
  posts,
  comments,
  savedPosts,
  likedPosts,
  loading,
  pagination,
  onPostLike,
  onCommentLike,
  isOwnProfile,
}) => {
  const pageSize = 10;

  const calculateTotalPages = (total: number) => Math.ceil(total / pageSize);

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
        {isOwnProfile && (
          <Tab icon={<Bookmark />} label="Saved" iconPosition="start" />
        )}
        {isOwnProfile && (
          <Tab icon={<Favorite />} label="Liked" iconPosition="start" />
        )}
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
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={() => onPostLike?.(post.id)}
                />
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
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onLike={() => onCommentLike?.(comment.id)}
                  onReply={() => {}}
                  onDelete={() => {}}
                  onEdit={() => {}}
                />
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

      {/* Saved Posts Tab */}
      {isOwnProfile && (
        <TabPanel value={value} index={2}>
          {loading.saved ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : savedPosts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No saved posts yet.
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {savedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={() => onPostLike?.(post.id)}
                  />
                ))}
              </Box>
              {pagination.saved.total > pageSize && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={calculateTotalPages(pagination.saved.total)}
                    page={pagination.saved.page}
                    onChange={(_, page) => pagination.saved.onChange(page)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </TabPanel>
      )}

      {/* Liked Posts Tab */}
      {isOwnProfile && (
        <TabPanel value={value} index={3}>
          {loading.liked ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : likedPosts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No liked posts yet.
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {likedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={() => onPostLike?.(post.id)}
                  />
                ))}
              </Box>
              {pagination.liked.total > pageSize && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={calculateTotalPages(pagination.liked.total)}
                    page={pagination.liked.page}
                    onChange={(_, page) => pagination.liked.onChange(page)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </TabPanel>
      )}
    </Paper>
  );
};

export default ProfileTabs;