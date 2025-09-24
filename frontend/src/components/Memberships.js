import React, { useEffect, useState } from 'react';
import { getMemberships, createMembership } from '../services/membershipService';
import colors from '../colors';
import styles from '../kara-theme.module.css';

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
  const [modalOpen, setModalOpen] = useState(false);

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

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>Memberships</h2>
      <button className={styles.button} style={{marginBottom: 24}} onClick={openModal}>Add Membership</button>
      {modalOpen && (
        <div className={styles['modal-backdrop']} onClick={closeModal}>
          <div className={styles['modal-content']} onClick={e => e.stopPropagation()}>
            <button className={styles['modal-close']} onClick={closeModal} aria-label="Close">&times;</button>
            <h3 className={styles.heading} style={{fontSize: 22, marginBottom: 20}}>Add Membership</h3>
            <form onSubmit={async (e) => { await handleSubmit(e); closeModal(); }} className={styles['membership-form']} autoComplete="off">
              <div className={styles['form-group']}>
                <input name="business_name" className={styles['form-input']} placeholder=" " value={form.business_name} onChange={handleChange} required />
                <label className={styles['form-label']}>Business Name</label>
              </div>
              <div className={styles['form-group']}>
                <select name="business_type" className={styles['form-input']} value={form.business_type} onChange={handleChange} required>
                  <option value="" disabled hidden></option>
                  <option value="restaurant">Restaurant</option>
                  <option value="hotel">Hotel</option>
                  <option value="other">Other</option>
                </select>
                <label className={styles['form-label']}>Business Type</label>
              </div>
              <div className={styles['form-group']}>
                <input name="contact_name" className={styles['form-input']} placeholder=" " value={form.contact_name} onChange={handleChange} required />
                <label className={styles['form-label']}>Contact Name</label>
              </div>
              <div className={styles['form-group']}>
                <input name="email" className={styles['form-input']} placeholder=" " value={form.email} onChange={handleChange} required />
                <label className={styles['form-label']}>Email</label>
              </div>
              <div className={styles['form-group']}>
                <input name="phone" className={styles['form-input']} placeholder=" " value={form.phone} onChange={handleChange} />
                <label className={styles['form-label']}>Phone</label>
              </div>
              <div className={styles['form-group']}>
                <input name="address" className={styles['form-input']} placeholder=" " value={form.address} onChange={handleChange} />
                <label className={styles['form-label']}>Address</label>
              </div>
              <div className={styles['form-group']}>
                <input name="website" className={styles['form-input']} placeholder=" " value={form.website} onChange={handleChange} />
                <label className={styles['form-label']}>Website</label>
              </div>
              <div className={styles['form-group']}>
                <select name="subscription_plan" className={styles['form-input']} value={form.subscription_plan} onChange={handleChange} required>
                  <option value="" disabled hidden></option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                <label className={styles['form-label']}>Subscription Plan</label>
              </div>
              <div className={styles['form-group']}>
                <input name="notes" className={styles['form-input']} placeholder=" " value={form.notes} onChange={handleChange} />
                <label className={styles['form-label']}>Notes</label>
              </div>
              <button className={styles.button} type="submit" style={{marginTop: 8}}>Add</button>
            </form>
          </div>
        </div>
      )}
      {error && <div className={styles['alert-error']}>{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className={styles['membership-table']}>
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
