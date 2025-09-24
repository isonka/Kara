import React, { useEffect, useState } from 'react';
import { getMemberships, createMembership } from '../services/membershipService';

const Memberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [form, setForm] = useState({
    business_name: '',
    business_type: 'restaurant',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    subscription_plan: 'basic',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const data = await getMemberships();
      setMemberships(data);
    } catch (err) {
      setError('Failed to fetch memberships');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createMembership(form);
      setForm({
        business_name: '',
        business_type: 'restaurant',
        contact_name: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        subscription_plan: 'basic',
        notes: ''
      });
      fetchMemberships();
    } catch (err) {
      setError('Failed to create membership');
    }
  };

  return (
    <div>
      <h2>Memberships</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input name="business_name" placeholder="Business Name" value={form.business_name} onChange={handleChange} required />
        <select name="business_type" value={form.business_type} onChange={handleChange} required>
          <option value="restaurant">Restaurant</option>
          <option value="hotel">Hotel</option>
          <option value="other">Other</option>
        </select>
        <input name="contact_name" placeholder="Contact Name" value={form.contact_name} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
        <input name="website" placeholder="Website" value={form.website} onChange={handleChange} />
        <select name="subscription_plan" value={form.subscription_plan} onChange={handleChange} required>
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <input name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />
        <button type="submit">Add Membership</button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Type</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((m) => (
              <tr key={m._id}>
                <td>{m.business_name}</td>
                <td>{m.business_type}</td>
                <td>{m.contact_name}</td>
                <td>{m.email}</td>
                <td>{m.subscription_plan}</td>
                <td>{m.subscription_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Memberships;
