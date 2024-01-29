import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Function to initiate Zoho OAuth flow after successful login
  const initiateZohoOAuth = async () => {
    try {
      console.log('Initiating Zoho OAuth flow...');

      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // If login is successful, initiate Zoho OAuth flow
        console.log('Login successful! Initiating Zoho OAuth...');
        const zohoOAuthResponse = await response.json();
        
        // You can redirect to Zoho OAuth or handle it as needed
        console.log('Zoho OAuth response:', zohoOAuthResponse);
        return true;
      } else {
        // If login fails, show error message
        const errorData = await response.json();
        console.error('Login failed. Error details:', errorData);
        setErrorMessage('User is not registered. Sign up first.');
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous error message
    const success = await initiateZohoOAuth();

    if (success) {
      // Handle successful login or redirect as needed
      navigate('/product-list'); // Navigate to the product API list
    }
  };

  return (
    <div className="popup">
      <div className="popup-inner">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit">Login</button>
        </form>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <p>
          Not registered yet?{' '}
          <Link to="/signup">
            <button>Signup</button>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
