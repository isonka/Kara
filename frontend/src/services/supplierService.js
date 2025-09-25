import axios from 'axios';

export async function getSuppliers(token) {
  const baseUrl = process.env.REACT_APP_API_URL;
  const res = await axios.get(`${baseUrl}/api/suppliers`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
