"use client";

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export default function Home() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const querySnapshot = await getDocs(collection(db, 'pantryItems'));
    setItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const addItem = async () => {
    await addDoc(collection(db, 'pantryItems'), newItem);
    setNewItem({ name: '', quantity: '' });
    fetchItems();
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'pantryItems', id));
    fetchItems();
  };

  const startEditing = (item) => {
    setEditingItem(item);
    setNewItem({ name: item.name, quantity: item.quantity });
  };

  const updateItem = async () => {
    await updateDoc(doc(db, 'pantryItems', editingItem.id), newItem);
    setEditingItem(null);
    setNewItem({ name: '', quantity: '' });
    fetchItems();
  };

  const filteredItems = items.filter(item =>
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
          <Button
            variant="contained"
            color="primary"
            onClick={editingItem ? updateItem : addItem}
            fullWidth
          >
            {editingItem ? 'Update Item' : 'Add Item'}
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
              <ListItemText primary={item.name} secondary={`Quantity: ${item.quantity}`} />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="edit" onClick={() => startEditing(item)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => deleteItem(item.id)}>
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
