import React, { useState, useEffect } from 'react';
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
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Reply,
  MoreVert,
  Edit,
  Delete,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from '../../types/comment.types';

interface CommentCardProps {
  comment: Comment;
  onLike: () => void;
  onReply: (content: string) => void;
  onDelete: () => void;
  onEdit: (content: string) => void;
  currentUserId?: string;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onLike,
  onReply,
  onDelete,
  onEdit,
  currentUserId,
}) => {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [liked, setLiked] = useState(comment.liked || false);
  const [likeCount, setLikeCount] = useState(Number(comment.likeCount) || 0);

  useEffect(() => {
    setLiked(comment.liked || false);
    setLikeCount(Number(comment.likeCount) || 0);
  }, [comment.liked, comment.likeCount]);

  const isAuthor = currentUserId === comment.userId;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? (prev || 0) + 1 : Math.max(0, (prev || 0) - 1));
    onLike();
  };

  const handleEdit = () => {
    setIsEditing(true);
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    onEdit(editContent);
    setIsEditing(false);
  };

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(replyContent);
      setReplyContent('');
      setShowReply(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, ml: comment.parentId ? 4 : 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {comment.user?.username?.[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2">{comment.user?.username}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              {comment.isEdited && ' (edited)'}
            </Typography>
          </Box>
        </Box>

        {isAuthor && (
          <>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert fontSize="small" />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleEdit}>
                <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
              </MenuItem>
              <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
                <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
              </MenuItem>
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
            onChange={(e) => setEditContent(e.target.value)}
            size="small"
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button size="small" variant="contained" onClick={handleSaveEdit}>
              Save
            </Button>
            <Button size="small" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>{comment.content}</Typography>
      )}

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
        <Tooltip title={liked ? 'Unlike' : 'Like'}>
          <IconButton 
            size="small" 
            onClick={handleLike}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.04)',
              },
            }}
          >
            <Badge
              badgeContent={likeCount}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  height: '18px',
                  minWidth: '18px',
                },
              }}
            >
              {liked ? (
                <Favorite color="error" fontSize="small" />
              ) : (
                <FavoriteBorder fontSize="small" />
              )}
            </Badge>
          </IconButton>
        </Tooltip>
        <Button size="small" startIcon={<Reply />} onClick={() => setShowReply(!showReply)}>
          Reply
        </Button>
      </Box>

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
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button size="small" variant="contained" onClick={handleReplySubmit}>
              Reply
            </Button>
            <Button size="small" onClick={() => setShowReply(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {comment.replies?.map((reply) => (
        <Box key={reply.id} sx={{ mt: 2 }}>
          <CommentCard
            comment={reply}
            onLike={onLike}
            onReply={onReply}
            onDelete={onDelete}
            onEdit={onEdit}
            currentUserId={currentUserId}
          />
        </Box>
      ))}
    </Paper>
  );
};

export default CommentCard;