"use client";

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Fab,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ItemList from './components/ItemList';
import ImageCaptureStep from './components/ImageCaptureStep';
import ItemDetailsStep from './components/ItemDetailsStep';
import SearchBar from './components/SearchBar';
import { db, storage } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { classifyImage } from '../utils/imageClassification';

export default function Home() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [newItem, setNewItem] = useState({ imageUrl: '', name: '', quantity: '', tags: [] });
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'pantryItems'));
      const fetchedItems = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
      alert('Error fetching items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async () => {
    try {
      await addDoc(collection(db, 'pantryItems'), {
        name: newItem.name,
        quantity: newItem.quantity,
        imageUrl: newItem.imageUrl,
        tags: newItem.tags
      });
      fetchItems();
      resetForm();
    } catch (error) {
      console.error("Error adding item:", error);
      alert('Error adding item. Please try again.');
    }
  };

  const updateItem = async () => {
    try {
      const itemRef = doc(db, 'pantryItems', editingItem.id);
      await updateDoc(itemRef, {
        name: newItem.name,
        quantity: newItem.quantity,
        imageUrl: newItem.imageUrl,
        tags: newItem.tags
      });
      fetchItems();
      resetForm();
    } catch (error) {
      console.error("Error updating item:", error);
      alert('Error updating item. Please try again.');
    }
  };

  const deleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, 'pantryItems', itemToDelete));
      fetchItems();
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting item:", error);
      alert('Error deleting item. Please try again.');
    }
  };

  const handleImageCapture = async (imageSource) => {
    try {
      let imageUrl;
      if (imageSource.startsWith('data:')) {
        // It's a data URL (from camera or file upload)
        const response = await fetch(imageSource);
        const blob = await response.blob();
        const storageRef = ref(storage, "pantry_images/" + Date.now() + ".jpg");
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
      } else {
        // It's a URL from the internet
        imageUrl = imageSource;
      }

      // Classify the image
      const tags = await classifyImage(imageUrl);

      setNewItem({ ...newItem, imageUrl, tags });
      setActiveStep(1);
    } catch (error) {
      console.error("Error processing captured image:", error);
      alert('Error uploading image. Please try again.');
    }
  };

  const resetForm = () => {
    setIsAddingItem(false);
    setEditingItem(null);
    setActiveStep(0);
    setNewItem({ imageUrl: '', name: '', quantity: '', tags: [] });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setNewItem(item);
    setIsAddingItem(true);
    setActiveStep(1);
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleCancelAddItem = () => {
    if (confirm("Are you sure you want to cancel? Your progress will be lost.")) {
      resetForm();
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const steps = ['Capture Image', 'Item Details'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Pantry Manager
      </Typography>

      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      {isAddingItem ? (
        <Paper elevation={3} sx={{ p: 4, mb: 4, position: 'relative' }}>
          <IconButton
            aria-label="close"
            onClick={handleCancelAddItem}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ mt: 4 }}>
            {activeStep === 0 ? (
              <ImageCaptureStep onCapture={handleImageCapture} onCancel={handleCancelAddItem} />
            ) : (
              <ItemDetailsStep
                item={newItem}
                onChange={(updatedItem) => setNewItem(updatedItem)}
                onSubmit={editingItem ? updateItem : addItem}
                onBack={() => setActiveStep(0)}
                onCancel={handleCancelAddItem}
                isEditing={!!editingItem}
              />
            )}
          </Box>
        </Paper>
      ) : (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setIsAddingItem(true)}
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <AddIcon />
        </Fab>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ItemList
          items={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={deleteItem} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
