import React, { useState } from 'react';
import { TextField, Box, Button, Stepper, Step, StepLabel } from '@mui/material';
import ImageCaptureStep from './ImageCaptureStep';

const AddEditItemForm = ({ onSubmit, initialValues, onCancel, isEditing, onImageCapture }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [item, setItem] = useState(initialValues || { imageUrl: '', name: '', quantity: '', tags: [] });

  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleImageCapture = async (imageData) => {
    try {
      const result = await onImageCapture(imageData);
      setItem(prevItem => ({
        ...prevItem,
        imageUrl: result.imageUrl,
        name: result.classification,
        tags: result.tags
      }));
      setActiveStep(1);
    } catch (error) {
      console.error("Error capturing image:", error);
      alert('Error capturing image. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(item);
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel>
        <Step>
          <StepLabel>Capture Image</StepLabel>
        </Step>
        <Step>
          <StepLabel>Item Details</StepLabel>
        </Step>
      </Stepper>

      {activeStep === 0 ? (
        <ImageCaptureStep onCapture={handleImageCapture} />
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
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
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditing ? 'Update' : 'Add'} Item
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AddEditItemForm;
