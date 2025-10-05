import React from 'react';
import styles from '../kara-theme.module.css';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Business Dashboard</h1>
      <div style={{display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: 32}}>
        <section className={styles.card}>
          <h2 className={styles.heading} style={{fontSize: 20}}>Suppliers</h2>
          <button className={styles.button} onClick={() => navigate('/suppliers')}>Go to Suppliers</button>
        </section>
        <section className={styles.card}>
          <h2 className={styles.heading} style={{fontSize: 20}}>Orderable Products</h2>
          <p>Browse and order products from your suppliers.</p>
        </section>
        <section className={styles.card}>
          <h2 className={styles.heading} style={{fontSize: 20}}>Recipes</h2>
          <button className={styles.button} onClick={() => navigate('/recipes')}>Go to Recipes</button>
        </section>
      </div>
    </div>
  );
}
