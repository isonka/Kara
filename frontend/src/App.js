import React, { useState } from 'react';
import './App.css';
import styles from './kara-theme.module.css';
import Memberships from './components/Memberships';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import Ingredients from './components/Ingredients';
import Recipes from './components/Recipes';
import RecipeCreator from './components/RecipeCreator';
import { Routes, Route } from 'react-router-dom';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [authScreen, setAuthScreen] = useState('login'); // login | forgot | renew

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
    if (authScreen === 'forgot') return <ForgotPassword onBack={() => setAuthScreen('login')} />;
    return <Login onLogin={handleLogin} onForgot={() => setAuthScreen('forgot')} />;
  }

  if (role === 'admin') {
    return (
      <div className={styles.container}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h1 className={styles.heading}>Kara Membership Management</h1>
          <div>
            <button className={styles.button} style={{marginRight: 8}} onClick={() => setAuthScreen('renew')}>Change Password</button>
            <button className={styles.button} onClick={handleLogout}>Logout</button>
          </div>
        </div>        
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/ingredients" element={<Ingredients />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/create" element={<RecipeCreator />} />
        <Route path="/recipes/edit/:id" element={<RecipeCreator />} />
      </Routes>
      <div style={{textAlign:'right', marginTop: 16}}>
        <button className={styles.button} onClick={handleLogout}>Logout</button>
      </div>
    </>
  );
}

export default App;
