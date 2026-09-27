import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OrderList from './pages/OrderList';
import OrderCreate from './pages/OrderCreate';
import OrderDetails from './pages/OrderDetails';
import UserList from './pages/UserList';
import UserForm from './pages/UserForm';
import PricingList from './pages/PricingList';
import PricingForm from './pages/PricingForm';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <OrderList />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders/new"
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'DISPATCHER']}>
              <OrderCreate />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <PrivateRoute>
              <OrderDetails />
            </PrivateRoute>
          }
        />

        <Route
          path="/users"
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserList />
            </PrivateRoute>
          }
        />
        <Route
          path="/users/new"
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserForm />
            </PrivateRoute>
          }
        />

        <Route
          path="/pricing"
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <PricingList />
            </PrivateRoute>
          }
        />
        <Route
          path="/pricing/new"
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <PricingForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/pricing/:id/edit"
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <PricingForm />
            </PrivateRoute>
          }
        />

        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
