import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, IconButton, Chip, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ItemCard = ({ item, onEdit, onDelete }) => {
  return (
    <Card elevation={3} sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: '0.3s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 6,
      }
    }}>
      <CardMedia
        component="img"
        height="140"
        image={item.imageUrl}
        alt={item.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="div" gutterBottom>
          {item.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Quantity: {item.quantity}
        </Typography>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {item.tags && item.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  m: 0.5,
                  backgroundColor: getTagColor(tag),
                  color: 'white'
                }}
              />
            ))}
          </Stack>
        </Box>
        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => onEdit(item)} color="primary" size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => onDelete(item.id)} color="error" size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

const getTagColor = (tag) => {
  const colors = ['#1976d2', '#388e3c', '#d32f2f', '#f57c00', '#7b1fa2', '#0097a7'];
  const index = tag.charCodeAt(0) % colors.length;
  return colors[index];
};

export default ItemCard;
