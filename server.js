const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const userApp = require('./userModule'); // Import user module
const productApp = require('./productModule'); // Import product module

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Mount the user module on the '/user' path
app.use(userApp);

// Mount the product module on the '/product' path
app.use(productApp);
// Add this in your server code
app.get('/test', (req, res) => {
  res.send('Hello from the server!');
});


app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
