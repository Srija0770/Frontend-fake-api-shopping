import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Index from './pages/Index';
import Cart from './pages/Cart';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Admin from './pages/Admin';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Index />} />
        <Route path="/" element={<Signup />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
};

export default App;