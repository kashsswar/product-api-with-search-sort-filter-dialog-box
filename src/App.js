// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import ProductList from './components/ProductList';
import AddEditProduct from './components/AddEditProduct';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/product-list" element={<ProductList />} />
        <Route path="/add-product" element={<AddEditProduct />} />
        <Route path="/edit-product/:id" element={<AddEditProduct />} />
      </Routes>
    </Router>
  );
};

export default App;
