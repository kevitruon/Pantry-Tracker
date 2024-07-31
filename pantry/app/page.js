"use client";

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Avatar,
  Paper,
  AppBar,
  Toolbar,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import LinkIcon from '@mui/icons-material/Link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { db, storage } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';
import CameraComponent from './components/CameraComponent';

export default function Home() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', imageUrl: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'pantryItems'));
      const fetchedItems = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(fetchedItems);
      setItemCount(fetchedItems.length);
    } catch (error) {
      console.error("Error fetching items:", error);
      alert('Error fetching items. Please try again.');
    }
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.imageUrl) {
      alert('Please fill in all fields and add a photo.');
      return;
    }

    try {
      await addDoc(collection(db, 'pantryItems'), newItem);
      setNewItem({ name: '', quantity: '', imageUrl: '' });
      fetchItems();
      setShowAddForm(false);
      setActiveStep(0);
      alert('Item added successfully!');
    } catch (error) {
      console.error("Error adding item:", error);
      alert(`Error adding item: ${error.message}`);
    }
  };

  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'pantryItems', id));
      fetchItems();
      alert('Item deleted successfully!');
    } catch (error) {
      console.error("Error deleting item:", error);
      alert(`Error deleting item: ${error.message}`);
    }
  };

  const startEditing = (item) => {
    setEditingItem(item);
    setNewItem({ name: item.name, quantity: item.quantity, imageUrl: item.imageUrl });
    setShowAddForm(true);
    setActiveStep(1);
  };

  const updateItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.imageUrl) {
      alert('Please fill in all fields and add a photo.');
      return;
    }

    try {
      await updateDoc(doc(db, 'pantryItems', editingItem.id), newItem);
      setEditingItem(null);
      setNewItem({ name: '', quantity: '', imageUrl: '' });
      fetchItems();
      setShowAddForm(false);
      setActiveStep(0);
      alert('Item updated successfully!');
    } catch (error) {
      console.error("Error updating item:", error);
      alert(`Error updating item: ${error.message}`);
    }
  };

  const uploadImage = async (file) => {
    try {
      const storageRef = ref(storage, "pantry_images/" + Date.now() + "_" + file.name);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        const imageUrl = await uploadImage(file);
        setNewItem(prevItem => ({ ...prevItem, imageUrl }));
        setActiveStep(1);
      } catch (error) {
        alert(`Error uploading image: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleImageCapture = async (imageDataUrl) => {
    setIsUploading(true);
    try {
      const storageRef = ref(storage, "pantry_images/" + Date.now() + ".jpg");
      await uploadString(storageRef, imageDataUrl, "data_url");
      const imageUrl = await getDownloadURL(storageRef);
      setNewItem(prevItem => ({ ...prevItem, imageUrl }));
      setActiveStep(1);
      setShowCamera(false);
    } catch (error) {
      console.error("Error processing captured image:", error);
      alert(`Error uploading image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlInput = async (url) => {
    setIsUploading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], "image_from_url.jpg", { type: blob.type });
      const imageUrl = await uploadImage(file);
      setNewItem(prevItem => ({ ...prevItem, imageUrl }));
      setActiveStep(1);
    } catch (error) {
      console.error("Error processing image from URL:", error);
      alert(`Error uploading image from URL: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pantry Manager
          </Typography>
          <Button color="inherit" onClick={() => {
            setShowAddForm(!showAddForm);
            setActiveStep(0);
            setNewItem({ name: '', quantity: '', imageUrl: '' });
          }}>
            {showAddForm ? 'Cancel' : 'Add Item'}
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Total Items: {itemCount}
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search items"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
            }}
            sx={{ mb: 2 }}
          />
          {showAddForm && (
            <Card elevation={2} sx={{ mb: 3, p: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </Typography>
                <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
                  <Step>
                    <StepLabel>Upload Image</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Item Details</StepLabel>
                  </Step>
                </Stepper>
                {activeStep === 0 && (
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="raised-button-file"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="raised-button-file">
                      <Button variant="contained" component="span" startIcon={<FileUploadIcon />}>
                        Upload Image
                      </Button>
                    </label>
                    <Button
                      variant="contained"
                      onClick={() => setShowCamera(true)}
                      sx={{ ml: 2 }}
                      startIcon={<PhotoCameraIcon />}
                    >
                      Capture Image
                    </Button>
                    {showCamera && <CameraComponent onCapture={handleImageCapture} />}
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Or input image URL:</Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="https://example.com/image.jpg"
                      InputProps={{
                        endAdornment: (
                          <Button
                            variant="contained"
                            onClick={() => handleUrlInput(document.getElementById('image-url-input').value)}
                            startIcon={<LinkIcon />}
                          >
                            Add URL
                          </Button>
                        ),
                      }}
                      id="image-url-input"
                    />
                  </Box>
                )}
                {activeStep === 1 && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={() => setActiveStep(0)}
                      sx={{ mb: 2 }}
                    >
                      Back to Image Upload
                    </Button>
                    <TextField
                      label="Item Name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      fullWidth
                      margin="normal"
                      required
                      variant="outlined"
                    />
                    <TextField
                      label="Quantity"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      fullWidth
                      margin="normal"
                      required
                      variant="outlined"
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={editingItem ? updateItem : addItem}
                      fullWidth
                      sx={{ mt: 2 }}
                      disabled={isUploading || !newItem.name || !newItem.quantity || !newItem.imageUrl}
                      startIcon={<AddIcon />}
                    >
                      {editingItem ? "Update Item" : "Add Item"}
                    </Button>
                  </>
                )}
                {isUploading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress />
                  </Box>
                )}
                {newItem.imageUrl && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <img src={newItem.imageUrl} alt="Captured item" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
          <Grid container spacing={2}>
            {filteredItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar src={item.imageUrl} alt={item.name} sx={{ width: 60, height: 60, mr: 2 }} />
                      <Box>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Quantity: {item.quantity}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton onClick={() => startEditing(item)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => deleteItem(item.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
