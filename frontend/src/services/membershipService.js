import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/memberships`;

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getMemberships = async () => {
  const res = await axios.get(API_URL, { headers: authHeaders() });
  return res.data;
};

export const createMembership = async (membership) => {
  const res = await axios.post(API_URL, membership, { headers: authHeaders() });
  return res.data;
};

export const getMembership = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, { headers: authHeaders() });
  return res.data;
};

export const updateMembership = async (id, membership) => {
  const res = await axios.put(`${API_URL}/${id}`, membership, { headers: authHeaders() });
  return res.data;
};

export const deleteMembership = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, { headers: authHeaders() });
  return res.data;
};
