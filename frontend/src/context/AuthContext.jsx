import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (token exists)
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setCurrentUser(response.data);
        } catch (err) {
          console.error('Auth error:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Register a new user
  const register = async (userData) => {
    setError(null);
    try {
      const response = await authAPI.register(userData);
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (credentials) => {
    setError(null);
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setError(null);
    try {
      const response = await authAPI.updateProfile(userData);
      setCurrentUser(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    token: localStorage.getItem('token'), // Add this line
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};