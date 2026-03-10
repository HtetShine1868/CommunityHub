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
  alpha,
  useTheme,
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
  onLike: (commentId: string) => void;
  onReply: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onPin?: (commentId: string) => void;
  currentUserId?: string;
  isPostAuthor?: boolean;
  level?: number;
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
  level = 0,
}) => {
  const theme = useTheme();
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  console.log(`CommentCard rendered for comment: ${comment.id}, level: ${level}, replies: ${comment.replies?.length || 0}`);

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
    console.log(` Edit clicked for comment: ${comment.id}`);
    setIsEditing(true);
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      console.log(`Saving edit for comment: ${comment.id}, content:`, editContent.trim());
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      console.log(`Submitting reply for comment: ${comment.id}, content:`, replyContent.trim());
      console.log(` Calling onReply with: commentId=${comment.id}, content=${replyContent.trim()}`);
      
      onReply(comment.id, replyContent.trim());
      
      console.log(` onReply called, clearing form`);
      setReplyContent('');
      setShowReply(false);
    } else {
      console.log(`Reply content is empty, not submitting`);
    }
  };

  const handlePin = () => {
    console.log(` Pin clicked for comment: ${comment.id}`);
    if (onPin) {
      onPin(comment.id);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    console.log(` Delete clicked for comment: ${comment.id}`);
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment.id);
    }
    handleMenuClose();
  };

  const handleLikeClick = () => {
    console.log(` Like clicked for comment: ${comment.id}`);
    onLike(comment.id);
  };

  const handleReplyButtonClick = () => {
    console.log(` Reply button clicked for comment: ${comment.id}, current showReply: ${showReply}`);
    setShowReply(!showReply);
  };

  const handleReplyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(` Typing reply for comment ${comment.id}:`, e.target.value);
    setReplyContent(e.target.value);
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

  const pinnedStyles = comment.isPinned ? {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.primary.main, 0.2)
      : alpha(theme.palette.primary.main, 0.08),
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
  } : {};

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        ml: level * 4,
        transition: 'all 0.2s ease',
        ...pinnedStyles,
        '&:hover': {
          boxShadow: comment.isPinned 
            ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
            : 2,
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
              bgcolor: comment.isPinned ? 'primary.main' : 'primary.light',
              fontSize: '0.875rem',
              color: comment.isPinned ? 'white' : 'inherit',
            }}
          >
            {getUserInitial()}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography 
                variant="subtitle2" 
                fontWeight={600}
                sx={{
                  color: comment.isPinned ? 'primary.main' : 'text.primary',
                }}
              >
                {getUserName()}
              </Typography>
              {comment.isPinned && (
                <Chip
                  icon={<PushPin sx={{ fontSize: 14 }} />}
                  label="Pinned"
                  size="small"
                  sx={{ 
                    height: 20, 
                    '& .MuiChip-label': { px: 1, fontSize: '0.65rem', fontWeight: 600 },
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                  }}
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

      {isEditing ? (
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={editContent}
            onChange={(e) => {
              console.log(' Editing:', e.target.value);
              setEditContent(e.target.value);
            }}
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
            color: 'text.primary',
            fontWeight: comment.isPinned ? 500 : 400,
          }}
        >
          {comment.content}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <IconButton
          size="small"
          onClick={handleLikeClick}
          sx={{
            color: comment.liked ? 'error.main' : 'action.active',
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
          onClick={handleReplyButtonClick}
        >
          Reply
        </Button>
      </Box>

      {showReply && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={`Reply to ${getUserName()}...`}
            value={replyContent}
            onChange={handleReplyInputChange}
            multiline
            rows={2}
            variant="outlined"
            autoFocus
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={handleReplySubmit}
              disabled={!replyContent.trim()}
            >
              Post Reply
            </Button>
            <Button
              size="small"
              onClick={() => {
                console.log(` Cancel reply for comment: ${comment.id}`);
                setShowReply(false);
                setReplyContent('');
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {comment.replies.map((reply) => {
            console.log(`🔄 Rendering nested reply: ${reply.id} under parent: ${comment.id}`);
            return (
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
                level={level + 1}
              />
            );
          })}
        </Box>
      )}
    </Paper>
  );
};

export default CommentCard;