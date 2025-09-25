import axios from 'axios';

export async function getSuppliers(token) {
  const res = await axios.get('/api/suppliers', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
