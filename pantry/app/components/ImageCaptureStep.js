import React, { useState } from 'react';
import { Box, Button, Typography, TextField } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LinkIcon from '@mui/icons-material/Link';
import CameraComponent from './CameraComponent';

const ImageCaptureStep = ({ onCapture, onCancel }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleUrlSubmit = () => {
    onCapture(imageUrl);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      onCapture(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box>
      {!showCamera ? (
        <>
          <Typography variant="h6" gutterBottom>
            Choose an image capture method:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CameraAltIcon />}
              onClick={() => setShowCamera(true)}
            >
              Use Camera
            </Button>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileUpload}
              />
            </Button>
            <TextField
              fullWidth
              label="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={handleUrlSubmit}
                    disabled={!imageUrl}
                    startIcon={<LinkIcon />}
                  >
                    Use URL
                  </Button>
                ),
              }}
            />
            <Button onClick={onCancel} color="secondary">
              Cancel
            </Button>
          </Box>
        </>
      ) : (
        <CameraComponent
          onCapture={onCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </Box>
  );
};

export default ImageCaptureStep;
