// Seed a business owner user for Conservatorium
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedBusinessOwner = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const email = 'conservatorium@kara.com';
  const password = 'conservatorium123';
  const role = 'owner';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Business owner already exists:', email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword, role });
  await user.save();
  console.log('Business owner seeded:', email);
  process.exit(0);
};

seedBusinessOwner();
