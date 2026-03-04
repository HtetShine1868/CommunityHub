import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Visibility,
  PushPin,
  Lock,
  MoreVert,
  Edit,
  Delete,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../types/post.types';
import { useAuthStore } from '../../store/authStore';

interface PostCardProps {
  post: Post;
  onLike?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  onLock?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onEdit,
  onDelete,
  onPin,
  onLock,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [liked, setLiked] = useState(post.liked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);

  const isAuthor = user?.id === post.userId;
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
  const canPin = isAdmin; // Admins can pin any post
  const canEdit = isAuthor || isAdmin;
  const canDelete = isAuthor || isAdmin;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    if (onLike) onLike();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    if (onEdit) onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    if (onDelete) onDelete();
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    if (onPin) onPin();
  };

  const handleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    if (onLock) onLock();
  };

  const handleCardClick = () => {
    navigate(`/posts/${post.id}`);
  };

  const getUserInitial = () => {
    if (post.user?.username) {
      return post.user.username[0].toUpperCase();
    }
    return '?';
  };

  const getUserName = () => {
    return post.user?.username || 'Unknown User';
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        borderLeft: post.isPinned ? '4px solid' : 'none',
        borderLeftColor: 'primary.main',
        bgcolor: post.isPinned ? 'action.hover' : 'background.paper',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
      }}
      onClick={handleCardClick}
    >
      <CardContent>
        {/* Header with status chips and menu */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {post.isPinned && (
              <Chip
                icon={<PushPin />}
                label="Pinned"
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {post.isLocked && (
              <Chip
                icon={<Lock />}
                label="Locked"
                size="small"
                color="error"
                variant="outlined"
              />
            )}
          </Box>

          {(canEdit || canPin) && (
            <>
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVert fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {canEdit && (
                  <MenuItem onClick={handleEdit}>
                    <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
                  </MenuItem>
                )}
                {canDelete && (
                  <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
                  </MenuItem>
                )}
                {canPin && (
                  <MenuItem onClick={handlePin}>
                    <PushPin fontSize="small" sx={{ mr: 1 }} />
                    {post.isPinned ? 'Unpin' : 'Pin'}
                  </MenuItem>
                )}
                {isAdmin && (
                  <MenuItem onClick={handleLock}>
                    <Lock fontSize="small" sx={{ mr: 1 }} />
                    {post.isLocked ? 'Unlock' : 'Lock'}
                  </MenuItem>
                )}
              </Menu>
            </>
          )}
        </Box>

        {/* Post Title */}
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            pr: 4
          }}
        >
          {post.title}
        </Typography>

        {/* Post Content Preview */}
        <Typography
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            minHeight: '60px',
          }}
        >
          {post.content}
        </Typography>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
            {post.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag.id}
                label={tag.name}
                size="small"
                variant="outlined"
                sx={{ borderRadius: 1 }}
              />
            ))}
            {post.tags.length > 3 && (
              <Chip
                label={`+${post.tags.length - 3}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        )}

        {/* Stats Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Visibility fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {post.viewCount || 0}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Comment fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {post.commentCount || 0}
              </Typography>
            </Box>
          </Box>

          <IconButton 
            size="small" 
            onClick={handleLikeClick}
            sx={{ 
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.04)',
              }
            }}
          >
            {liked ? (
              <Favorite color="error" fontSize="small" />
            ) : (
              <FavoriteBorder fontSize="small" />
            )}
            <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 500 }}>
              {likeCount}
            </Typography>
          </IconButton>
        </Box>

        {/* User Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar 
            src={post.user?.avatar} 
            sx={{ 
              width: 24, 
              height: 24,
              bgcolor: 'primary.main',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {getUserInitial()}
          </Avatar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="caption" fontWeight={500}>
              {getUserName()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              •
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </Typography>
            {post.isEdited && (
              <>
                <Typography variant="caption" color="text.secondary">
                  •
                </Typography>
                <Typography variant="caption" color="text.secondary" fontStyle="italic">
                  edited
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PostCard;