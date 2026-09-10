import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('eduflow_token');
    const savedUser = localStorage.getItem('eduflow_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('eduflow_token');
        localStorage.removeItem('eduflow_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const data = response.data;
    localStorage.setItem('eduflow_token', data.access_token);
    const userData = {
      id: data.user_id,
      name: data.name,
      email: data.email,
      role: data.role,
    };
    localStorage.setItem('eduflow_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('eduflow_token');
    localStorage.removeItem('eduflow_user');
    setUser(null);
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (user.role === 'MANAGEMENT') return true;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
