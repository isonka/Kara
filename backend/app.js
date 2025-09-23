const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');

const suppliersRouter = require('./routes/suppliers');

const app = express();

// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.onrender.com'] // Replace with your actual frontend URL
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
};

app.use(cors(corsOptions));
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

app.use('/api/suppliers', suppliersRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
