import React from 'react';
import { Box, Typography, Pagination } from '@mui/material';
import { Post } from '../../types/post.types';
import PostCard from './PostCard';

interface PostListProps {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onLike?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onPin?: (postId: string) => void;
  onLock?: (postId: string) => void;
  emptyMessage?: string;
}

const PostList: React.FC<PostListProps> = ({
  posts,
  total,
  page,
  pageSize,
  onPageChange,
  onLike,
  onEdit,
  onDelete,
  onPin,
  onLock,
  emptyMessage = 'No posts found',
}) => {
  const totalPages = Math.ceil(total / pageSize);

  if (posts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => onLike?.(post.id)}
            onEdit={() => onEdit?.(post.id)}
            onDelete={() => onDelete?.(post.id)}
            onPin={() => onPin?.(post.id)}
            onLock={() => onLock?.(post.id)}
          />
        ))}
      </Box>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => onPageChange(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default PostList;