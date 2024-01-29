import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Add Zoho OAuth configuration
  const zohoOAuthConfig = {
    clientId: '1000.ODN9JRZ4LBMSN2UEU5UHNSKO7H23WM',
    redirectUri: 'http://localhost:5003/zoho-callback',  // Replace with your actual redirect URI
    authUrl: 'https://accounts.zoho.com/oauth/v2/auth',
    tokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
    scope: 'ZOHOPEOPLE.forms.ALL',  // Adjust scope based on your needs
  };
  

  // Function to initiate Zoho OAuth flow
  const initiateZohoOAuth = () => {
    const authParams = {
      client_id: zohoOAuthConfig.clientId,
      redirect_uri: zohoOAuthConfig.redirectUri,
      response_type: 'code',
      scope: zohoOAuthConfig.scope,
    };

    const authUrl = `${zohoOAuthConfig.authUrl}?${new URLSearchParams(authParams)}`;
    window.location.href = authUrl;
  };

  // Handle signup with Zoho OAuth after successful user registration
  const handleSignup = async () => {
    try {
      console.log('Sending signup request...');

      const response = await axios.post('http://localhost:5000/signup', {
        name,
        email,
        password,
      });

      console.log('User Registered:', { name, email, password });

      console.log('Signup successful:', response.data.message);
      setSignupSuccess(true);

      // After successful signup, initiate Zoho OAuth flow
      initiateZohoOAuth();
    } catch (error) {
      console.error('Signup failed:', error);

      // Handle signup failure (e.g., show an error message)
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      {signupSuccess ? (
        <div>
          <p>User successfully registered! Please proceed to Zoho OAuth authentication.</p>
          {/* You can add a button to trigger Zoho OAuth authentication */}
          <button onClick={initiateZohoOAuth}>Zoho OAuth</button>
        </div>
      ) : (
        <div>
          <label>
            Name:
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Email:
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password:
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button onClick={handleSignup}>Signup</button>
        </div>
      )}
    </div>
  );
};

export default Signup;
