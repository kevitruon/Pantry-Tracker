"use client";

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Fab,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ItemList from './components/ItemList';
import AddEditItemForm from './components/AddEditItemForm';
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

export default function Home() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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

  const addItem = async (item) => {
    try {
      await addDoc(collection(db, 'pantryItems'), item);
      fetchItems();
      setIsAddingItem(false);
    } catch (error) {
      console.error("Error adding item:", error);
      alert('Error adding item. Please try again.');
    }
  };

  const updateItem = async (item) => {
    try {
      const itemRef = doc(db, 'pantryItems', editingItem.id);
      await updateDoc(itemRef, item);
      fetchItems();
      setEditingItem(null);
      setIsAddingItem(false);
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

      // Call the API endpoint for image classification
      const response = await fetch('/api/classify-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to classify image');
      }

      const data = await response.json();

      return {
        imageUrl,
        classification: data.tags[0] || '',
        tags: data.tags
      };
    } catch (error) {
      console.error("Error processing captured image:", error);
      alert('Error uploading image. Please try again.');
      throw error;
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsAddingItem(true);
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold', color: theme.palette.primary.main }}>
        Pantry Manager
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      </Paper>

      {isAddingItem ? (
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <AddEditItemForm
            onSubmit={editingItem ? updateItem : addItem}
            initialValues={editingItem}
            onCancel={() => {
              setEditingItem(null);
              setIsAddingItem(false);
            }}
            isEditing={!!editingItem}
            onImageCapture={handleImageCapture}
          />
        </Paper>
      ) : (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setIsAddingItem(true)}
          sx={{
            position: 'fixed',
            bottom: theme.spacing(4),
            right: theme.spacing(4),
          }}
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
