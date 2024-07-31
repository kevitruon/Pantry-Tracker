import React, { useRef, useState, useCallback } from 'react';
import { Camera } from 'react-camera-pro';
import { Button, Box } from '@mui/material';

const CameraComponent = ({ onCapture, width = '100%', height = '300px' }) => {
  const camera = useRef(null);
  const [image, setImage] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const startCamera = useCallback(() => {
    setIsCameraOn(true);
    setImage(null);
  }, []);

  const capture = useCallback(() => {
    if (camera.current) {
      const imageSrc = camera.current.takePhoto();
      setImage(imageSrc);
      setIsCameraOn(false);
    }
  }, []);

  const retake = useCallback(() => {
    setImage(null);
    startCamera();
  }, [startCamera]);

  const usePhoto = useCallback(() => {
    if (image) {
      onCapture(image);
    }
  }, [image, onCapture]);

  return (
    <Box sx={{ width: width, maxWidth: '500px', margin: '0 auto' }}>
      {isCameraOn && !image && (
        <>
          <Box sx={{ width: '100%', height: height, position: 'relative' }}>
            <Camera ref={camera} aspectRatio={16 / 9} errorMessages={{}} />
          </Box>
          <Box sx={{ mt: 1 }}>
            <Button onClick={capture} variant="contained" color="primary" fullWidth>
              Capture
            </Button>
          </Box>
        </>
      )}
      {!isCameraOn && !image && (
        <Button onClick={startCamera} variant="contained" color="primary" fullWidth>
          Start Camera
        </Button>
      )}
      {image && (
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
    </Box>
  );
};

export default CameraComponent;
