import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set axios defaults
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get(`${API_URL}/me`);
          setUser(res.data.user);
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  // Signup
  const signup = async (name, email, password) => {
    const res = await axios.post(`${API_URL}/signup`, { name, email, password });
    return res.data;
  };

  // Login
  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Verify email
  const verifyEmail = async (token) => {
    const res = await axios.get(`${API_URL}/verify-email/${token}`);
    return res.data;
  };

  // Forgot password
  const forgotPassword = async (email) => {
    const res = await axios.post(`${API_URL}/forgot-password`, { email });
    return res.data;
  };

  // Reset password
  const resetPassword = async (token, password) => {
    const res = await axios.put(`${API_URL}/reset-password/${token}`, { password });
    return res.data;
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};