import React, { useEffect, useState } from 'react';
import styles from '../kara-theme.module.css';
import { getSuppliers } from '../services/supplierService';

export default function Dashboard() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const data = await getSuppliers(token);
        setSuppliers(data);
      } catch (err) {
        setError('Failed to load suppliers');
      }
      setLoading(false);
    };
    fetchSuppliers();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Business Dashboard</h1>
      <div style={{display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: 32}}>
        <section className={styles.card}>
          <h2 className={styles.heading} style={{fontSize: 20}}>Suppliers</h2>
          {loading ? (
            <p>Loading suppliers...</p>
          ) : error ? (
            <p style={{color: 'red'}}>{error}</p>
          ) : suppliers.length === 0 ? (
            <p>No suppliers found.</p>
          ) : (
            <ul style={{paddingLeft: 18}}>
              {suppliers.map(s => (
                <li key={s._id} style={{marginBottom: 8}}>
                  <strong>{s.name}</strong>{s.email ? ` (${s.email})` : ''}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className={styles.card}>
          <h2 className={styles.heading} style={{fontSize: 20}}>Orderable Products</h2>
          <p>Browse and order products from your suppliers.</p>
          {/* TODO: List products, order actions */}
        </section>
        <section className={styles.card}>
          <h2 className={styles.heading} style={{fontSize: 20}}>Recipes</h2>
          <p>View and manage your recipes.</p>
          {/* TODO: List recipes, add/manage actions */}
        </section>
      </div>
    </div>
  );
}
