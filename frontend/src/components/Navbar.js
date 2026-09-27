import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Last-Mile Delivery</div>
      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/orders">Orders</Link>
        {(user.role === 'ADMIN') && <Link to="/users">Users</Link>}
        {user.role === 'ADMIN' && <Link to="/pricing">Pricing</Link>}
      </div>
      <div className="navbar-user">
        <span>
          {user.name} ({user.role})
        </span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
