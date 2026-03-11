import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
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

  const getTopicColor = () => {
    return topic.color || theme.palette.primary.main;
  };

  const getUserDisplay = () => {
    if (topic.user?.username) {
      return topic.user.username;
    }
    return 'Unknown User';
  };

  const getUserInitial = () => {
    if (topic.user?.username) {
      return topic.user.username[0].toUpperCase();
    }
    return '?';
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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

  return (
    <Card
      onClick={() => navigate(`/topics/${topic.id}`)}
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[3],
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              color: getTopicColor(),
            }}
          >
            {topic.icon ? (
              <img src={topic.icon} alt={topic.title} style={{ width: 28, height: 28 }} />
            ) : (
              <Forum sx={{ fontSize: 28 }} />
            )}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2, mb: 0.5 }}>
                {topic.title}
              </Typography>
              <Chip
                icon={topic.isPrivate ? <Lock sx={{ fontSize: '14px !important' }} /> : <Public sx={{ fontSize: '14px !important' }} />}
                label={topic.isPrivate ? 'Private' : 'Public'}
                size="small"
                variant="outlined"
                sx={{ ml: 1, height: 24, fontSize: '0.75rem' }}
              />
            </Box>
            {topic.category && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span>{topic.category.icon || '📁'}</span>
                {topic.category.name}
              </Typography>
            )}
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {topic.description || 'No description provided.'}
        </Typography>

        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={topic.user?.avatar} sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
              {getUserInitial()}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              by {getUserDisplay()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <Forum sx={{ fontSize: 16 }} />
              <Typography variant="caption">{topic.postCount || 0}</Typography>
            </Box>
            
            {canEdit && (
              <Box onClick={(e) => e.stopPropagation()}>
                <IconButton size="small" onClick={handleMenuOpen} sx={{ padding: 0.5 }}>
                  <MoreVert fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MenuItem onClick={handleEdit} sx={{ fontSize: '0.875rem' }}>
                    <Edit fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> Edit
                  </MenuItem>
                  <MenuItem onClick={handleDelete} sx={{ fontSize: '0.875rem', color: 'error.main' }}>
                    <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopicCard;