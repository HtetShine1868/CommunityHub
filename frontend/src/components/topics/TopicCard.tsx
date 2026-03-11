import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Forum,
  Lock,
  Public,
  MoreVert,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Topic } from '../../types/topic.types';
import { useAuthStore } from '../../store/authStore';

interface TopicCardProps {
  topic: Topic;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onEdit, onDelete }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isAuthor = user?.id === topic.userId;
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
  const canEdit = isAuthor || isAdmin;

  const getTopicColor = () => topic.color || theme.palette.primary.main;

  const getUserDisplay = () => topic.user?.username || 'Unknown';
  const getUserInitial = () => topic.user?.username?.[0].toUpperCase() || '?';

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

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

  return (
    <Card
      onClick={() => navigate(`/topics/${topic.id}`)}
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        border: '1.5px solid',
        borderColor: theme.palette.divider,
        borderRadius: '12px',
        transition: 'border-color 0.18s, box-shadow 0.18s',
        '&:hover': {
          borderColor: getTopicColor(),
          boxShadow: `0 0 0 3px ${getTopicColor()}18`,
        },
      }}
    >
      {/* Color accent bar at top */}
      <Box
        sx={{
          height: 4,
          borderRadius: '12px 12px 0 0',
          bgcolor: getTopicColor(),
          opacity: 0.85,
        }}
      />

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5, pb: '20px !important' }}>
        {/* Header row: icon + title + menu */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${getTopicColor()}18`,
              color: getTopicColor(),
              flexShrink: 0,
            }}
          >
            {topic.icon ? (
              <img src={topic.icon} alt={topic.title} style={{ width: 22, height: 22 }} />
            ) : (
              <Forum sx={{ fontSize: 22 }} />
            )}
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, lineHeight: 1.25, mb: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {topic.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {topic.isPrivate ? (
                <Lock sx={{ fontSize: 13, color: 'text.disabled' }} />
              ) : (
                <Public sx={{ fontSize: 13, color: 'text.disabled' }} />
              )}
              <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1 }}>
                {topic.isPrivate ? 'Private' : 'Public'}
              </Typography>
              {topic.category && (
                <>
                  <Typography variant="caption" color="text.disabled">·</Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1 }}>
                    {topic.category.icon ? `${topic.category.icon} ` : ''}{topic.category.name}
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {canEdit && (
            <Box onClick={(e) => e.stopPropagation()} sx={{ flexShrink: 0 }}>
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}
              >
                <MoreVert sx={{ fontSize: 18 }} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
                PaperProps={{ elevation: 3, sx: { borderRadius: '10px', minWidth: 130 } }}
              >
                <MenuItem onClick={handleEdit} sx={{ fontSize: '0.875rem', gap: 1 }}>
                  <Edit sx={{ fontSize: 16, color: 'text.secondary' }} /> Edit
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ fontSize: '0.875rem', color: 'error.main', gap: 1 }}>
                  <Delete sx={{ fontSize: 16 }} /> Delete
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            flexGrow: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.55,
            mb: 2,
          }}
        >
          {topic.description || 'No description provided.'}
        </Typography>

        <Divider sx={{ mb: 1.5 }} />

        {/* Footer: author + post count */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Avatar src={topic.user?.avatar} sx={{ width: 22, height: 22, fontSize: '0.7rem' }}>
              {getUserInitial()}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {getUserDisplay()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled' }}>
            <Forum sx={{ fontSize: 14 }} />
            <Typography variant="caption">{topic.postCount || 0}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopicCard;