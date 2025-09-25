// Delete all suppliers and seed new ones for conservatorium user
const mongoose = require('mongoose');
const Supplier = require('./models/Supplier');
const User = require('./models/User');
require('dotenv').config();

async function seedSuppliers() {
  console.log('Connecting to MongoDB URI:', process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Find the business owner user
  const owner = await User.findOne({ email: 'conservatorium@kara.com' });
  if (!owner) throw new Error('Owner user not found');
  console.log('Business owner ObjectId:', owner._id.toString());

  // Delete all suppliers
  await Supplier.deleteMany({});
  console.log('All suppliers deleted.');

  // Seed new suppliers
  const suppliers = [
    {
      user: owner._id,
      name: 'Fresh Produce Co.',
      email: 'produce@freshco.com',
      phone: '+1 555-1234',
      address: '123 Market St',
      order_type: 'email',
      categories: ['Vegetables', 'Fruits'],
      currency: 'USD',
      language: 'en',
      comment: 'Delivers daily',
    },
    {
      user: owner._id,
      name: 'Meat Masters',
      email: 'orders@meatmasters.com',
      phone: '+1 555-5678',
      address: '456 Butcher Ave',
      order_type: 'web',
      categories: ['Meat', 'Poultry'],
      currency: 'USD',
      language: 'en',
      comment: 'Order before 10am for next-day delivery',
    },
    {
      user: owner._id,
      name: 'Bakery Bros',
      email: 'sales@bakerybros.com',
      phone: '+1 555-8765',
      address: '789 Bread Blvd',
      order_type: 'phone',
      categories: ['Bakery'],
      currency: 'USD',
      language: 'en',
      comment: 'Fresh bread every morning',
    }
  ];

  await Supplier.insertMany(suppliers);
  console.log('Seeded new suppliers for:', owner.email);
  process.exit(0);
}

seedSuppliers();
