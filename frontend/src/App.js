import React from 'react';
import './App.css';
import styles from './kara-theme.module.css';
import Memberships from './components/Memberships';

function App() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Kara Membership Management</h1>
      <Memberships />
    </div>
  );
}

export default App;
