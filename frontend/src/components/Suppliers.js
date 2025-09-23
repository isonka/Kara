import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/suppliers';
const ORDER_TYPES = ['csv', 'pdf', 'xls', 'email', 'phone', 'custom'];

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    order_type: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    products_url: '',
    currency: '',
    timezone: '',
    language: '',
    comment: '',
    logo: '',
    categories: '',
    order_example: ''
  });
  const [orderExampleFile, setOrderExampleFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setSuppliers(res.data);
    } catch (err) {
      setError('Failed to fetch suppliers');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setOrderExampleFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let dataToSend = { ...form };
      // Convert categories from comma-separated string to array
      if (form.categories) {
        dataToSend.categories = form.categories.split(',').map((c) => c.trim());
      }
      // If file is uploaded, upload it (mock: just set file name)
      if (orderExampleFile) {
        // In a real app, upload file to storage and get URL
        dataToSend.order_example = orderExampleFile.name;
      }
      await axios.post(API_URL, dataToSend);
      setForm({
        order_type: '', name: '', email: '', phone: '', address: '', website: '', products_url: '', currency: '', timezone: '', language: '', comment: '', logo: '', categories: '', order_example: ''
      });
      setOrderExampleFile(null);
      fetchSuppliers();
    } catch (err) {
      setError('Failed to add supplier');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Suppliers</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <select name="order_type" value={form.order_type} onChange={handleChange} required>
          <option value="">Select Order Type</option>
          {ORDER_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
        <input name="website" placeholder="Website" value={form.website} onChange={handleChange} />
        <input name="products_url" placeholder="Products URL" value={form.products_url} onChange={handleChange} />
        <input name="currency" placeholder="Currency" value={form.currency} onChange={handleChange} />
        <input name="timezone" placeholder="Timezone" value={form.timezone} onChange={handleChange} />
        <input name="language" placeholder="Language" value={form.language} onChange={handleChange} />
        <input name="comment" placeholder="Comment" value={form.comment} onChange={handleChange} />
        <input name="logo" placeholder="Logo URL" value={form.logo} onChange={handleChange} />
        <input name="categories" placeholder="Categories (comma separated)" value={form.categories} onChange={handleChange} />
        <input name="order_example" placeholder="Order Example URL" value={form.order_example} onChange={handleChange} />
        <div>or upload example order: <input type="file" onChange={handleFileChange} /></div>
        <button type="submit" disabled={loading}>Add Supplier</button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {suppliers.map((s) => (
            <li key={s._id}>
              <b>{s.name}</b> ({s.email}) - {s.order_type} <br />
              {s.address} <br />
              {s.website && <a href={s.website} target="_blank" rel="noopener noreferrer">Website</a>}<br />
              {s.categories && s.categories.join(', ')}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
