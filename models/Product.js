const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  phone: {
    type: String, // Assuming phone number is a string
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
