import React, { useState, useEffect } from 'react';
import { TextField, Box, Button } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const AddEditItemForm = ({ onSubmit, initialValues, onCancel, onCaptureImage }) => {
  const [item, setItem] = useState({ name: '', quantity: '', imageUrl: '' });

  useEffect(() => {
    if (initialValues) {
      setItem(initialValues);
    }
  }, [initialValues]);

  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(item);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
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
      <Button
        variant="outlined"
        startIcon={<CameraAltIcon />}
        onClick={onCaptureImage}
        sx={{ mb: 2 }}
      >
        Capture Image
      </Button>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary">
          {initialValues ? 'Update' : 'Add'} Item
        </Button>
      </Box>
    </Box>
  );
};

export default AddEditItemForm;
