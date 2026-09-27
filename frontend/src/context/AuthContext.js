import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginRequest, registerRequest, meRequest } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    meRequest()
      .then((res) => setUser(res.data.data))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await loginRequest({ email, password });
    const { token, ...userData } = res.data.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, role) => {
    const res = await registerRequest({ name, email, password, role });
    const { token, ...userData } = res.data.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
