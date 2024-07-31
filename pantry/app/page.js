"use client";

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { db, storage } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import CameraComponent from './components/CameraComponent';

export default function Home() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', imageUrl: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const querySnapshot = await getDocs(collection(db, 'pantryItems'));
    setItems(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const addItem = async () => {
    await addDoc(collection(db, 'pantryItems'), newItem);
    setNewItem({ name: '', quantity: '', imageUrl: '' });
    fetchItems();
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'pantryItems', id));
    fetchItems();
  };

  const startEditing = (item) => {
    setEditingItem(item);
    setNewItem({ name: item.name, quantity: item.quantity, imageUrl: item.imageUrl });
  };

  const updateItem = async () => {
    await updateDoc(doc(db, 'pantryItems', editingItem.id), newItem);
    setEditingItem(null);
    setNewItem({ name: '', quantity: '', imageUrl: '' });
    fetchItems();
  };

  const uploadImage = async (imageDataUrl) => {
    const storageRef = ref(storage, "pantry_images/" + Date.now() + ".jpg");
    await uploadString(storageRef, imageDataUrl, "data_url");
    return await getDownloadURL(storageRef);
  };

  const classifyImage = async (imageUrl) => {
    // This is a placeholder. You'll need to implement the actual AI classification here.
    // For now, we'll just return a dummy result
    return "Unknown Object";
  };

  const handleImageCapture = async (imageDataUrl) => {
    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(imageDataUrl);
      const classification = await classifyImage(imageUrl);

      setNewItem(prevItem => ({
        ...prevItem,
        imageUrl,
        name: classification || prevItem.name
      }));
    } catch (error) {
      console.error("Error processing captured image:", error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsUploading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pantry Manager
        </Typography>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Item Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Quantity"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            fullWidth
            margin="normal"
          />
          <CameraComponent onCapture={handleImageCapture} />
          {isUploading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          )}
          {newItem.imageUrl && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img src={newItem.imageUrl} alt="Captured item" style={{ maxWidth: '100%', maxHeight: '200px' }} />
            </Box>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={editingItem ? updateItem : addItem}
            fullWidth
            sx={{ mt: 2 }}
            disabled={isUploading}
          >
            {editingItem ? "Update Item" : "Add Item"}
          </Button>
        </Box>
        <TextField
          label="Search items"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          margin="normal"
        />
        <List>
          {filteredItems.map((item) => (
            <ListItem key={item.id}>
              <ListItemText
                primary={item.name}
                secondary={`Quantity: ${item.quantity}`}
              />
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
              )}
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => startEditing(item)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => deleteItem(item.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
}
