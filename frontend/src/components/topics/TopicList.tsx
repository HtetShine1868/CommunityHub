import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { Topic } from '../../types/topic.types';
import TopicCard from './TopicCard';

interface TopicListProps {
  topics: Topic[];
  onEdit?: (topicId: string) => void;
  onDelete?: (topicId: string) => void;
  emptyMessage?: string;
}

const TopicList: React.FC<TopicListProps> = ({
  topics,
  onEdit,
  onDelete,
  emptyMessage = 'No topics found',
}) => {
  if (topics.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {topics.map((topic) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={topic.id}>
          <TopicCard
            topic={topic}
            onEdit={() => onEdit?.(topic.id)}
            onDelete={() => onDelete?.(topic.id)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default TopicList;