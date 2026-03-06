import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  useTheme,
  Badge,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  Notifications,
  Home,
  Topic,
  Person,
  Logout,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useUIStore } from '../../store/uiStore';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout, loading } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchInput, setSearchInput] = useState('');

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
    }
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        background: theme.palette.mode === 'light' 
          ? 'rgba(255, 255, 255, 0.8)' 
          : 'rgba(18, 18, 18, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleSidebar}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              mr: 3,
            }}
            onClick={() => navigate('/')}
          >
            Community Hub
          </Typography>
        </motion.div>

        {/* Home Button - Always visible */}
        <IconButton 
          color="inherit" 
          onClick={() => navigate('/')}
          sx={{ mr: 1 }}
          size="large"
        >
          <Home />
        </IconButton>

        {/* Topics Button */}
        <IconButton 
          color="inherit" 
          onClick={() => navigate('/topics')}
          sx={{ mr: 1 }}
          size="large"
        >
          <Topic />
        </IconButton>

        {/* Search Bar */}
        <Box sx={{ flexGrow: 1, mx: 2, maxWidth: 400 }}>
          <TextField
            size="small"
            placeholder="Search posts, topics..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'light' 
                  ? 'rgba(0,0,0,0.04)' 
                  : 'rgba(255,255,255,0.08)',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton color="inherit" onClick={toggleTheme}>
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {isAuthenticated ? (
            <>
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                <Avatar 
                  src={user?.avatar}
                  sx={{
                    width: 40,
                    height: 40,
                    border: '2px solid',
                    borderColor: 'primary.main',
                  }}
                >
                  {user?.username?.[0].toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    borderRadius: 2,
                    minWidth: 200,
                  },
                }}
              >
                <MenuItem onClick={() => handleNavigate('/profile')}>
                  <Person sx={{ mr: 1, fontSize: 20 }} /> 
                  <Box>
                    <Typography variant="body2">{user?.username}</Typography>
                    <Typography variant="caption" color="text.secondary">View Profile</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleLogout} disabled={loading}>
                  <Logout sx={{ mr: 1, fontSize: 20 }} /> 
                  {loading ? <CircularProgress size={20} /> : 'Logout'}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  borderRadius: '9999px',
                  px: 3,
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;