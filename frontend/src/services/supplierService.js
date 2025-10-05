import axios from 'axios';

export async function getSuppliers(token) {
  const baseUrl = process.env.REACT_APP_API_URL || 'https://kara-agcc.onrender.com';
  const url = `${baseUrl}/api/suppliers`;
  
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
