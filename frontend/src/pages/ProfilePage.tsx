import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Box,
  Button,
  TextField,
  Divider,
  Tab,
  Tabs,

} from '@mui/material';
import { useAuthStore } from '../store/authStore';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');

  // You'll need to implement these hooks
  // const { posts: userPosts } = usePosts({ userId: user?.id });
  // const { posts: likedPosts } = usePosts({ liked: true });

  if (!user) {
    return (
      <Container>
        <Typography>Please login to view your profile</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 4 }}>
          <Avatar
            sx={{ width: 100, height: 100, fontSize: 40 }}
            src={user.avatar}
          >
            {user.username[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4">{user.username}</Typography>
            <Typography color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Button variant="outlined" onClick={() => setIsEditing(!isEditing)}>
            Edit Profile
          </Button>
        </Box>

        {isEditing ? (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained">Save</Button>
              <Button onClick={() => setIsEditing(false)}>Cancel</Button>
            </Box>
          </Box>
        ) : (
          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
            <Typography variant="body1">
              {user.bio || 'No bio yet.'}
            </Typography>
          </Paper>
        )}

        <Divider />

        <Box sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="My Posts" />
            <Tab label="Liked Posts" />
            <Tab label="Comments" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Typography>Your posts will appear here</Typography>
            {/* Add user posts list here */}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography>Posts you've liked will appear here</Typography>
            {/* Add liked posts list here */}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography>Your comments will appear here</Typography>
            {/* Add user comments list here */}
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;