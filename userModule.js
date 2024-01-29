const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const morgan = require('morgan');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('./models/User');

const userApp = express();
const PORT_USER = process.env.PORT_USER || 5001;

userApp.use(cors());
userApp.use(express.json());
userApp.use(morgan('dev'));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Zoho OAuth Configuration
const zohoOAuthConfig = {
  clientId: '1000.ODN9JRZ4LBMSN2UEU5UHNSKO7H23WM',
  redirectUri: 'http://localhost:5003/zoho-callback',  // Replace with your actual redirect URI
  authUrl: 'https://accounts.zoho.com/oauth/v2/auth',
  tokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
  scope: 'ZOHOPEOPLE.forms.ALL',  // Adjust scope based on your needs
};

// Signup Route
userApp.post('/signup', async (req, res) => {
  console.log('Received signup request');
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Zoho OAuth Redirect Route
userApp.get('/zoho-callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange Zoho authorization code for an access token
    const tokenResponse = await axios.post(zohoOAuthConfig.tokenUrl, {
      client_id: zohoOAuthConfig.clientId,
      client_secret: zohoOAuthConfig.clientSecret,
      code,
      redirect_uri: zohoOAuthConfig.redirectUri,
      grant_type: 'authorization_code',
    });

    const zohoAccessToken = tokenResponse.data.access_token;

    // Use the access token to fetch user details from Zoho
    const zohoUserResponse = await axios.get('https://people.zoho.com/people/api/forms/P_EmployeeView/records', {
      headers: {
        Authorization: `Zoho-oauthtoken ${zohoAccessToken}`,
      },
    });

    const zohoUser = zohoUserResponse.data.data[0];

    // Save or update user details in your database based on your requirements
    // Example: const user = await User.findOneAndUpdate({ email: zohoUser.Email }, { name: zohoUser.First_Name });

    res.status(200).json({ message: 'Zoho OAuth successful', zohoUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login Route
userApp.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Profile Route
userApp.get('/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

userApp.listen(PORT_USER, () => console.log(`User module running on port ${PORT_USER}`));

function generateToken(user) {
  const token = jwt.sign({ email: user.email, name: user.name }, process.env.JWT_SECRET || 'your_default_secret_for_development');
  return token;
}

function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret_for_development', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.user = user;
    next();
  });
}

module.exports = userApp;
