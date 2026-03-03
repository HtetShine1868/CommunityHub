import React from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import { Topic } from '../../types/topic.types';
import TopicCard from './TopicCard';

interface TopicListProps {
  topics: Topic[];
  emptyMessage?: string;
}

const TopicList: React.FC<TopicListProps> = ({ 
  topics, 
  emptyMessage = 'No topics found' 
}) => {
  if (!topics || topics.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={3}>
      {topics.map((topic) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={topic.id}>
          <TopicCard topic={topic} />
        </Grid>
      ))}
    </Grid>
  );
};

export default TopicList;