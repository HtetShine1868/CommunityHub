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
  Tooltip,
} from '@mui/material';
import {
  Forum,
  People,
  Lock,
  Public,
  MoreVert,
  Edit,
  Delete,
  Category as CategoryIcon,
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
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'visible',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          '& .topic-icon': {
            transform: 'scale(1.1) rotate(5deg)',
          },
        },
      }}
      onClick={() => navigate(`/topics/${topic.id}`)}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          left: 20,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${getTopicColor()} 0%, ${getTopicColor()}dd 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 10px 20px ${getTopicColor()}40`,
          transition: 'transform 0.3s ease',
          className: 'topic-icon',
        }}
      >
        {topic.icon ? (
          <img src={topic.icon} alt={topic.title} style={{ width: 30, height: 30 }} />
        ) : (
          <Forum sx={{ color: 'white', fontSize: 30 }} />
        )}
      </Box>

      <CardContent sx={{ pt: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, pr: 4 }}>
            {topic.title}
          </Typography>
          <Chip
            icon={topic.isPrivate ? <Lock /> : <Public />}
            label={topic.isPrivate ? 'Private' : 'Public'}
            size="small"
            sx={{
              backgroundColor: topic.isPrivate ? '#fee2e2' : '#e0f2fe',
              color: topic.isPrivate ? '#b91c1c' : '#0369a1',
              '& .MuiChip-icon': {
                color: 'inherit',
              },
            }}
          />
        </Box>

        {/* Category Chip */}
        {topic.category && (
          <Box sx={{ mb: 1 }}>
            <Chip
              icon={<span>{topic.category.icon || '📁'}</span>}
              label={topic.category.name}
              size="small"
              variant="outlined"
              sx={{
                backgroundColor: topic.category.color ? `${topic.category.color}20` : 'transparent',
                borderColor: topic.category.color || theme.palette.primary.main,
                color: topic.category.color || theme.palette.primary.main,
              }}
            />
          </Box>
        )}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: 40,
          }}
        >
          {topic.description || 'No description provided.'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Forum fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {topic.postCount || 0} posts
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <People fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {topic.followerCount || 0} followers
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              src={topic.user?.avatar}
              sx={{ width: 24, height: 24 }}
            >
              {getUserInitial()}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              by {getUserDisplay()}
            </Typography>
          </Box>
          
          {canEdit && (
            <>
              <IconButton 
                size="small" 
                onClick={handleMenuOpen}
                aria-label="topic options"
              >
                <MoreVert fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleEdit}>
                  <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                  <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopicCard;