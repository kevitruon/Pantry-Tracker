import React, { useRef, useState, useCallback } from 'react';
import { Camera } from 'react-camera-pro';
import { Button, Box } from '@mui/material';

const CameraComponent = ({ onCapture, onCancel }) => {
  const camera = useRef(null);
  const [image, setImage] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = camera.current.takePhoto();
    setImage(imageSrc);
  }, []);

  const retake = useCallback(() => {
    setImage(null);
  }, []);

  const usePhoto = useCallback(() => {
    onCapture(image);
  }, [image, onCapture]);

  return (
    <Box sx={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      {!image ? (
        <>
          <Box sx={{ width: '100%', height: '300px', position: 'relative' }}>
            <Camera ref={camera} aspectRatio={16 / 9} />
          </Box>
          <Box sx={{ mt: 1 }}>
            <Button onClick={capture} variant="contained" color="primary" fullWidth>
              Capture
            </Button>
          </Box>
        </>
      ) : (
        <Box sx={{ mt: 2 }}>
          <img src={image} alt="Captured" style={{ maxWidth: '100%' }} />
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={retake} variant="outlined" color="secondary" sx={{ flex: 1, mr: 1 }}>
              Retake
            </Button>
            <Button onClick={usePhoto} variant="contained" color="primary" sx={{ flex: 1, ml: 1 }}>
              Use Photo
            </Button>
          </Box>
        </Box>
      )}
      <Button onClick={onCancel} variant="text" color="primary" fullWidth sx={{ mt: 2 }}>
        Cancel
      </Button>
    </Box>
  );
};

export default CameraComponent;
