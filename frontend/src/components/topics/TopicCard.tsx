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
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        background: theme.palette.background.paper,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid',
        borderColor: theme.palette.divider,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 20px 25px -5px ${getTopicColor()}30, 0 8px 10px -6px ${getTopicColor()}20`,
          borderColor: theme.palette.mode === 'dark' ? `${getTopicColor()}80` : `${getTopicColor()}50`,
          '& .topic-icon-container': {
            transform: 'scale(1.1) rotate(5deg)',
          },
        },
      }}
    >
      <Box
        sx={{
          height: 80,
          background: `lineargradient(135deg, ${getTopicColor()} 0%, ${getTopicColor()}dd 100%)`,
          backgroundColor: getTopicColor(),
          backgroundImage: `linear-gradient(135deg, ${getTopicColor()} 0%, ${getTopicColor()}99 100%)`,
          position: 'relative',
          opacity: 0.9,
        }}
      />
      <Box
        className="topic-icon-container"
        sx={{
          position: 'absolute',
          top: 50,
          left: 20,
          width: 60,
          height: 60,
          borderRadius: 3,
          background: theme.palette.background.paper,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          border: '2px solid',
          borderColor: theme.palette.background.paper,
          zIndex: 2,
        }}
      >
        {topic.icon ? (
          <img src={topic.icon} alt={topic.title} style={{ width: 32, height: 32 }} />
        ) : (
          <Forum sx={{ color: getTopicColor(), fontSize: 32 }} />
        )}
      </Box>

      <CardContent sx={{ pt: 5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, pr: 1, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
            {topic.title}
          </Typography>
          <Chip
            icon={topic.isPrivate ? <Lock sx={{ fontSize: '14px !important' }} /> : <Public sx={{ fontSize: '14px !important' }} />}
            label={topic.isPrivate ? 'Private' : 'Public'}
            size="small"
            sx={{
              height: 24,
              backgroundColor: topic.isPrivate ? 'rgba(239, 68, 68, 0.1)' : 'rgba(14, 165, 233, 0.1)',
              color: topic.isPrivate ? (theme.palette.mode === 'dark' ? '#fca5a5' : '#ef4444') : (theme.palette.mode === 'dark' ? '#7dd3fc' : '#0ea5e9'),
              fontWeight: 600,
              fontSize: '0.75rem',
              '& .MuiChip-icon': { color: 'inherit' },
            }}
          />
        </Box>

        {topic.category && (
          <Box sx={{ mb: 1.5 }}>
            <Chip
              icon={<span style={{ fontSize: '12px' }}>{topic.category.icon || '📁'}</span>}
              label={topic.category.name}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 600,
                backgroundColor: topic.category.color ? `${topic.category.color}15` : theme.palette.action.hover,
                color: topic.category.color || theme.palette.text.secondary,
                border: 'none',
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
            lineHeight: 1.6,
            flexGrow: 1,
            minHeight: 44,
          }}
        >
          {topic.description || 'No description provided.'}
        </Typography>

        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
              <Forum sx={{ fontSize: 18 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {topic.postCount || 0}
              </Typography>
            </Box>
            {topic.followerCount !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {topic.followerCount} followers
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            pt: 2, 
            borderTop: '1px solid', 
            borderColor: theme.palette.divider 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={topic.user?.avatar}
                sx={{ width: 28, height: 28, border: '2px solid', borderColor: 'background.paper' }}
              >
                {getUserInitial()}
              </Avatar>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {getUserDisplay()}
              </Typography>
            </Box>
            
            {canEdit && (
              <Box onClick={(e) => e.stopPropagation()}>
                <IconButton 
                  size="small" 
                  onClick={handleMenuOpen}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { bgcolor: 'action.hover', color: 'primary.main' }
                  }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={(e) => e.stopPropagation()}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    elevation: 3,
                    sx: { borderRadius: 2, mt: 0.5, minWidth: 120 }
                  }}
                >
                  <MenuItem onClick={handleEdit} sx={{ fontSize: '0.875rem' }}>
                    <Edit fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} /> Edit
                  </MenuItem>
                  <MenuItem onClick={handleDelete} sx={{ fontSize: '0.875rem', color: 'error.main' }}>
                    <Delete fontSize="small" sx={{ mr: 1.5, color: 'inherit' }} /> Delete
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