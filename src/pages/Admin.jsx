// Admin.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase'; // ✅ firebase config
import './Admin.css';

const ADMIN_EMAIL = 'admin@gmail.com'; // 🔒 admin's email

const Admin = () => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    price: '',
    description: '',
    category: '',
    image: '',
    rating: {
      rate: '',
      count: ''
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'rate' || name === 'count') {
      setFormData((prev) => ({
        ...prev,
        rating: {
          ...prev.rating,
          [name]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newItem = {
      ...formData,
      id: formData.id.trim(),
      price: parseFloat(formData.price),
      rating: {
        rate: parseFloat(formData.rating.rate),
        count: parseInt(formData.rating.count, 10)
      }
    };

    try {
      const res = await fetch('https://backend-fake-api-shopping.onrender.com/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log('✅ Product added:', data);
      alert('✅ Product added successfully!');

      setFormData({
        id: '',
        title: '',
        price: '',
        description: '',
        category: '',
        image: '',
        rating: {
          rate: '',
          count: ''
        }
      });
    } catch (err) {
      console.error('❌ Error:', err);
      alert(`❌ Failed to add product: ${err.message}`);
    }
  };

  // 🛡️ Route protection logic
  if (!authChecked) return <div>Loading authentication...</div>;
  if (!user || user.email !== ADMIN_EMAIL) return <Navigate to="/" replace />;

  return (
    <div className="admin-container">
      <div className="admin-form-wrapper">
        <h2 className="admin-title">📦 Add New Product</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          <Input name="id" value={formData.id} onChange={handleChange} label="Product ID" />
          <Input name="title" value={formData.title} onChange={handleChange} label="Title" />
          <Input type="number" name="price" value={formData.price} onChange={handleChange} label="Price" />
          <Textarea name="description" value={formData.description} onChange={handleChange} label="Description" />
          <Input name="category" value={formData.category} onChange={handleChange} label="Category" />
          <Input name="image" value={formData.image} onChange={handleChange} label="Image URL" />
          <div className="admin-rating-group">
            <Input type="number" step="0.1" name="rate" value={formData.rating.rate} onChange={handleChange} label="Rating (Rate)" />
            <Input type="number" name="count" value={formData.rating.count} onChange={handleChange} label="Rating (Count)" />
          </div>
          <button type="submit" className="admin-submit-button">➕ Add Product</button>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div className="admin-input-group">
    <label className="admin-label">{label}</label>
    <input {...props} className="admin-input" placeholder={label} required />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="admin-input-group">
    <label className="admin-label">{label}</label>
    <textarea {...props} className="admin-textarea" placeholder={label} required />
  </div>
);

export default Admin;
