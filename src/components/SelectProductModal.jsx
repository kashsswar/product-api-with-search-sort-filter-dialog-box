import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

const SelectProductModal = ({ isOpen, onClose, onConfirm, selectedProductCount }) => {
    console.log("Selected product count:", selectedProductCount);
    console.log("Is open:", isOpen);
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Please select at least one product to delete.</DialogTitle>
      <DialogContent>
        {selectedProductCount > 0 && (
          <p>{selectedProductCount} product(s) selected for deletion.</p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleConfirm}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectProductModal;
