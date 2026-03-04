import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  TextField,
  Menu,
  MenuItem,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Reply,
  MoreVert,
  Edit,
  Delete,
  PushPin,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from '../../types/comment.types';
import { useAuthStore } from '../../store/authStore';

interface CommentCardProps {
  comment: Comment;
  onLike: () => void;
  onReply: (content: string) => void;
  onDelete: () => void;
  onEdit: (content: string) => void;
  onPin?: () => void;
  currentUserId?: string;
  isPostAuthor?: boolean;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onLike,
  onReply,
  onDelete,
  onEdit,
  onPin,
  currentUserId,
  isPostAuthor = false,
}) => {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isAuthor = currentUserId === comment.userId;
  const isAdmin = useAuthStore.getState().user?.role === 'admin' || 
                  useAuthStore.getState().user?.role === 'moderator';
  const canPin = isPostAuthor || isAdmin;
  const canEdit = isAuthor || isAdmin;
  const canDelete = isAuthor || isAdmin;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onEdit(editContent);
      setIsEditing(false);
    }
  };

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(replyContent);
      setReplyContent('');
      setShowReply(false);
    }
  };

  const handlePin = () => {
    if (onPin) {
      onPin();
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDelete();
    }
    handleMenuClose();
  };

  const getUserInitial = () => {
    if (comment.user?.username) {
      return comment.user.username[0].toUpperCase();
    }
    return '?';
  };

  const getUserName = () => {
    return comment.user?.username || 'Unknown User';
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        ml: comment.parentId ? 4 : 0,
        borderLeft: comment.isPinned ? '4px solid' : 'none',
        borderLeftColor: 'primary.main',
        bgcolor: comment.isPinned ? 'primary.light' : 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            src={comment.user?.avatar}
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
            }}
          >
            {getUserInitial()}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {getUserName()}
              </Typography>
              {comment.isPinned && (
                <Chip
                  icon={<PushPin />}
                  label="Pinned"
                  size="small"
                  color="primary"
                  sx={{ height: 20, '& .MuiChip-label': { px: 1 } }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </Typography>
              {comment.isEdited && (
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
        </Box>

        {/* Menu Button */}
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
                  {comment.isPinned ? 'Unpin' : 'Pin'}
                </MenuItem>
              )}
            </Menu>
          </>
        )}
      </Box>

      {/* Content Section */}
      {isEditing ? (
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            size="small"
            variant="outlined"
            autoFocus
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={handleSaveEdit}
              disabled={!editContent.trim()}
            >
              Save
            </Button>
            <Button
              size="small"
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography
          sx={{
            mb: 1,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {comment.content}
        </Typography>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <IconButton
          size="small"
          onClick={onLike}
          sx={{
            color: comment.liked ? 'error.main' : 'inherit',
          }}
        >
          {comment.liked ? (
            <Favorite color="error" fontSize="small" />
          ) : (
            <FavoriteBorder fontSize="small" />
          )}
          <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 500 }}>
            {comment.likeCount || 0}
          </Typography>
        </IconButton>

        <Button
          size="small"
          startIcon={<Reply />}
          onClick={() => setShowReply(!showReply)}
        >
          Reply
        </Button>
      </Box>

      {/* Reply Form */}
      {showReply && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            multiline
            rows={2}
            variant="outlined"
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={handleReplySubmit}
              disabled={!replyContent.trim()}
            >
              Reply
            </Button>
            <Button
              size="small"
              onClick={() => {
                setShowReply(false);
                setReplyContent('');
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onReply={onReply}
              onDelete={onDelete}
              onEdit={onEdit}
              onPin={onPin}
              currentUserId={currentUserId}
              isPostAuthor={isPostAuthor}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default CommentCard;