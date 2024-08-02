import React from 'react';
import { TextField, Box, Button } from '@mui/material';

const ItemDetailsStep = ({ item, onChange, onSubmit, onBack, onCancel, isEditing }) => {
  const handleChange = (e) => {
    onChange({ ...item, [e.target.name]: e.target.value });
  };

  return (
    <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <TextField
        fullWidth
        label="Item Name"
        name="name"
        value={item.name}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Quantity"
        name="quantity"
        type="number"
        value={item.quantity}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button onClick={onBack}>
          Back
        </Button>
        <Button onClick={onCancel} color="secondary">
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary">
          {isEditing ? 'Update' : 'Add'} Item
        </Button>
      </Box>
    </Box>
  );
};

export default ItemDetailsStep;
