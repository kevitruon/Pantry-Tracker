import React from 'react';
import { Grid, Typography } from '@mui/material';
import ItemCard from './ItemCard';

const ItemList = ({ items, onEdit, onDelete }) => {
  if (items.length === 0) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        No items found. Start by adding some to your pantry!
      </Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item.id}>
          <ItemCard item={item} onEdit={onEdit} onDelete={onDelete} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ItemList;
