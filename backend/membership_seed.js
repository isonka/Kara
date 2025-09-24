const mongoose = require('mongoose');
require('dotenv').config();
const Membership = require('./models/Membership');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB for membership seeding'))
.catch((err) => console.error('MongoDB connection error:', err));

async function seedMemberships() {
  try {
    // Clear existing memberships
    await Membership.deleteMany({});
    console.log('Cleared existing memberships');

    // Sample memberships
    const memberships = [
      {
        business_name: 'Hotel Grand Palace',
        business_type: 'hotel',
        contact_name: 'Alice Smith',
        email: 'alice@grandpalace.com',
        phone: '+1 555 111 2222',
        address: '123 Palace Ave, New York, NY',
        website: 'https://grandpalace.com',
        subscription_status: 'active',
        subscription_plan: 'premium',
        notes: 'VIP customer, always pays on time.'
      },
      {
        business_name: 'Bella Italia Restaurant',
        business_type: 'restaurant',
        contact_name: 'Marco Rossi',
        email: 'marco@bellaitalia.com',
        phone: '+39 06 1234567',
        address: 'Via Roma 10, Rome, Italy',
        website: 'https://bellaitalia.com',
        subscription_status: 'trial',
        subscription_plan: 'basic',
        notes: 'Interested in premium plan.'
      },
      {
        business_name: 'Sunset Diner',
        business_type: 'restaurant',
        contact_name: 'Jane Doe',
        email: 'jane@sunsetdiner.com',
        phone: '+1 555 333 4444',
        address: '456 Ocean Blvd, Los Angeles, CA',
        website: 'https://sunsetdiner.com',
        subscription_status: 'expired',
        subscription_plan: 'basic',
        notes: 'Subscription expired last month.'
      }
    ];

    await Membership.insertMany(memberships);
    console.log('✅ Memberships seeded successfully');

    const total = await Membership.countDocuments();
    console.log(`🎉 Database now has ${total} memberships`);
  } catch (error) {
    console.error('❌ Error seeding memberships:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedMemberships();
