import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth as authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider mounted');
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      console.log('Loading user profile...');
      const response = await authApi.getProfile();
      setUser(response.data);
      console.log('User profile loaded:', response.data);
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    console.log('Attempting login...', credentials);
    try {
      const response = await authApi.login(credentials);
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return response.data;
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    console.log('Attempting registration...', userData);
    try {
      const response = await authApi.register(userData);
      console.log('Registration response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return response.data;
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
