import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://kara-agcc.onrender.com';

export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
  return res.data;
};
