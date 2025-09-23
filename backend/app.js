const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');

const suppliersRouter = require('./routes/suppliers');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/suppliers', suppliersRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
