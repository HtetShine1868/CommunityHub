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
  Badge,
} from '@mui/material';
import {
  Lock,
  Public,
  Forum,
  People,
  MoreVert,
  Edit,
  Delete,
  Favorite,
  Comment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Topic } from '../../types/topic.types';
import { useAuthStore } from '../../store/authStore';
import { postService } from '../../services/post.service';

interface TopicCardProps {
  topic: Topic;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [postCount, setPostCount] = useState(topic.postCount || 0);

  // Fetch actual post count if not provided
  React.useEffect(() => {
    const fetchPostCount = async () => {
      if (!topic.postCount) {
        try {
          const response = await postService.getPostsByTopic(topic.id, 1, 1);
          setPostCount(response.total);
        } catch (error) {
          console.error('Failed to fetch post count:', error);
        }
      }
    };
    fetchPostCount();
  }, [topic.id, topic.postCount]);

  const isAuthor = user?.id === topic.userId;

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
    onEdit?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    onDelete?.();
  };

  const getInitials = () => {
    if (topic.user?.username) {
      return topic.user.username[0].toUpperCase();
    }
    return '?';
  };

  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={() => navigate(`/topics/${topic.id}`)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            {topic.title}
          </Typography>
          <Chip
            icon={topic.isPrivate ? <Lock /> : <Public />}
            label={topic.isPrivate ? 'Private' : 'Public'}
            size="small"
            color={topic.isPrivate ? 'default' : 'primary'}
            variant="outlined"
          />
        </Box>

        <Typography
          color="text.secondary"
          sx={{
            mb: 3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            minHeight: '60px',
          }}
        >
          {topic.description || 'No description provided.'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Forum fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                <Badge badgeContent={postCount} color="primary" max={999} showZero>
                  <span style={{ padding: '0 8px' }}>posts</span>
                </Badge>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <People fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {topic.followerCount || 0} followers
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                {getInitials()}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                {topic.user?.username || 'Unknown'}
              </Typography>
            </Box>

            {isAuthor && (
              <>
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  sx={{ ml: 1 }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
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
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopicCard;