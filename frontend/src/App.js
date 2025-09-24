import React, { useState } from 'react';
import './App.css';
import styles from './kara-theme.module.css';
import Memberships from './components/Memberships';
import Login from './components/Login';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));

  const handleLogin = (jwt, userRole) => {
    setToken(jwt);
    setRole(userRole);
    localStorage.setItem('token', jwt);
    localStorage.setItem('role', userRole);
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  if (role === 'admin') {
    return (
      <div className={styles.container}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h1 className={styles.heading}>Kara Membership Management</h1>
          <button className={styles.button} onClick={handleLogout}>Logout</button>
        </div>
        <Memberships />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Welcome to Kara</h1>
      <p>You are logged in as a user. Membership management is for admins only.</p>
      <button className={styles.button} onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default App;
