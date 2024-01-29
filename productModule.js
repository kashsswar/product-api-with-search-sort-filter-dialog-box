const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const productApp = express();
const PORT_PRODUCT = process.env.PORT_PRODUCT || 5002;

productApp.use(cors());
productApp.use(express.json());
productApp.use(morgan('dev'));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

productApp.get('/api/products', async (req, res) => {
    try {
      const { minPrice, maxPrice, sortField, sortOrder, isActive } = req.query;
  
      console.log('Query Parameters:', req.query); // Log query parameters
  
      let query = {};
  
      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
  
        if (minPrice !== undefined) {
          query.price.$gte = parseFloat(minPrice);
        }
  
        if (maxPrice !== undefined) {
          query.price.$lte = parseFloat(maxPrice);
        }
      }
  
      // Add the condition to filter out inactive products
      if (isActive !== undefined) {
        query.isActive = isActive === 'true'; // Convert the string to a boolean
      }
  
      console.log('Final Query:', query); // Log the final query object
  
      // Assuming sortField = "name" and sortOrder = "asc"
      const sortOptions = {};
      if (sortField && sortOrder) {
        sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;
      }
  
      const products = await Product.find(query).sort(sortOptions);
  
      console.log('Filtered Products:', products); // Log the filtered products
  
      res.status(200).json(products);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
productApp.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, address, phone } = req.body;
    const product = new Product({ name, description, price, address, phone });
    await product.save();
    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

productApp.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

productApp.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, address, phone } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.address = address;
    product.phone = phone; // Update phone number

    await product.save();

    res.status(200).json({ message: 'Product updated', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

productApp.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Instead of deleting, update the isActive status to false
    product.isActive = false;
    await product.save();

    res.status(200).json({ message: 'Product deactivated' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

productApp.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

productApp.listen(PORT_PRODUCT, () => console.log(`Product module running on port ${PORT_PRODUCT}`));

module.exports = productApp;