// DeleteConfirmationModal.jsx

import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

const DeleteConfirmationModal = ({ isOpen, onCancel, onConfirm, selectedProductCount }) => {
  return (
    <Dialog open={isOpen} onClose={onCancel}>
      <DialogTitle>
        {selectedProductCount === 1
          ? 'Are you sure you want to delete this product?'
          : `Are you sure you want to delete ${selectedProductCount} selected product(s)?`}
      </DialogTitle>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
