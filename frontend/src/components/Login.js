import React, { useState } from 'react';
import axios from 'axios';
import styles from '../kara-theme.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://kara-agcc.onrender.com';

const Login = ({ onLogin, onForgot }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      onLogin(res.data.token, res.data.role);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className={styles.card} style={{ maxWidth: 400, margin: '64px auto' }}>
      <h2 className={styles.heading}>Admin Login</h2>
      {error && <div className={styles['alert-error']}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles['membership-form']} autoComplete="off">
        <div className={styles['form-group']}>
          <input
            className={styles['form-input']}
            type="email"
            name="email"
            placeholder=" "
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <label className={styles['form-label']}>Email</label>
        </div>
        <div className={styles['form-group']}>
          <input
            className={styles['form-input']}
            type="password"
            name="password"
            placeholder=" "
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <label className={styles['form-label']}>Password</label>
        </div>
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className={styles['text-link']} onClick={onForgot}>Forgot Password?</button>
        </div>
        <button className={styles.button} type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
