
import React, { useState } from 'react';
import styles from '../kara-theme.module.css';

const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setMessage(res.message + (res.resetToken ? ` (Token: ${res.resetToken})` : ''));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset link');
    }
    setLoading(false);
  };

  return (
    <div className={styles.card} style={{ maxWidth: 400, margin: '64px auto', padding: 20 }}>
      <button
        type="button"
        className={styles['back-arrow-btn']}
        aria-label="Back to Login"
        onClick={onBack}
        style={{ background: 'none', border: 'none', padding: 0, marginBottom: 16, display: 'flex', alignItems: 'center' }}
      >
        <span className={styles['back-arrow']} aria-hidden="true" style={{ fontSize: 24, color: '#333' }}>&#8592;</span>        
      </button>
      <h2 className={styles.heading}>Forgot Password</h2>
      {error && <div className={styles['alert-error']}>{error}</div>}
      {message && <div className={styles['alert-success']}>{message}</div>}
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
        <button className={styles.button} type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
