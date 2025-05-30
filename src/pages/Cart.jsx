import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
      console.log('Cart - Loaded items from localStorage:', savedCart); // Debug log
      setCartItems(savedCart);
    } catch (error) {
      console.error('Cart - Error loading cart:', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Calculate total amount whenever cart items change
    const total = cartItems.reduce((sum, item) => {
      const itemTotal = (item.price * (item.quantity || 1));
      console.log(`Item ${item.id} total:`, itemTotal); // Debug log
      return sum + itemTotal;
    }, 0);
    console.log('Cart - Total amount:', total); // Debug log
    setTotalAmount(total);
  }, [cartItems]);

  const updateQuantity = (id, change) => {
    console.log(`Updating quantity for item ${id} by ${change}`); // Debug log
    
    setCartItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, (item.quantity || 1) + change);
          console.log(`New quantity for item ${id}:`, newQuantity); // Debug log
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
  };

  const removeItem = (id) => {
    console.log('Removing item:', id); // Debug log
    
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== id);
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
  };

  const handleCheckout = () => {
    // Implement checkout logic here
    alert('Proceeding to checkout...');
  };

  if (isLoading) {
    return (
      <div className="cart-container">
        <h2 className="cart-title">Loading cart...</h2>
      </div>
    );
  }

  return (
    <>
      <Navbar cartCount={cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} />
      
      <div className="cart-container">
        <h2 className="cart-title">🛒 Your Shopping Cart</h2>
        
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button className="continue-shopping" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  
                  <div className="item-details">
                    <h3>{item.title}</h3>
                    <p className="item-description">{item.description?.slice(0, 100)}...</p>
                    <p className="item-price">${item.price?.toFixed(2)}</p>
                  </div>

                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                    <span>{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>

                  <div className="item-total">
                    <p>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                  </div>

                  <button 
                    className="remove-item"
                    onClick={() => removeItem(item.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-item">
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Shipping</span>
                <span>${(totalAmount > 100 ? 0 : 10).toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Tax (10%)</span>
                <span>${(totalAmount * 0.1).toFixed(2)}</span>
              </div>
              <div className="summary-item total">
                <span>Total</span>
                <span>${(totalAmount + (totalAmount > 100 ? 0 : 10) + (totalAmount * 0.1)).toFixed(2)}</span>
              </div>
              <button className="checkout-button" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
              <button className="continue-shopping" onClick={() => navigate('/home')}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </>
  );
};

export default Cart;