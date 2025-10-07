const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');

const suppliersRouter = require('./routes/suppliers');
const membershipsRouter = require('./routes/memberships');
const authRouter = require('./routes/auth');
const ingredientsRouter = require('./routes/ingredients');
const recipesRouter = require('./routes/recipes');
const usersRouter = require('./routes/users');
const teamRouter = require('./routes/team');

const app = express();

// --- ENVIRONMENT LOGGING FOR CI/CD ---
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('API ENV:', process.env.API_ENV);
console.log('Frontend Origin:', process.env.FRONTEND_ORIGIN);

// --- UNIVERSAL CORS FOR DEBUGGING ---
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kara Backend API', 
    version: '1.0.0',
    endpoints: {
      health: '/health',
      suppliers: '/api/suppliers'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Database connection test endpoint
app.get('/db-test', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isConnected = mongoose.connection.readyState === 1;
    res.json({ 
      database: isConnected ? 'Connected' : 'Disconnected',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || 'Not connected'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/suppliers', suppliersRouter);
app.use('/api/memberships', membershipsRouter);
app.use('/api/auth', authRouter);
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/users', usersRouter);
app.use('/api/team', teamRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
