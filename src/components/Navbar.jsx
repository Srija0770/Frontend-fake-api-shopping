import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../pages/Home.css';

const Navbar = ({ cartCount, onCartClick, user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">🛒 ShopEase</div>

      <div>
        {/* ✅ Show username if logged in */}
        {user && (
          <span style={{ marginRight: '15px', color: '#fff' }}>
            Hello, {user.displayName || user.email}
          </span>
        )}

        <button className="cart-button" onClick={onCartClick}>
          View Cart ({cartCount})
        </button>

        {/* ✅ Logout if user is logged in */}
        {user && (
          <button
            className="cart-button"
            style={{ marginLeft: '10px' }}
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;