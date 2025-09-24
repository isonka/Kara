const mongoose = require('mongoose');
require('dotenv').config();
const Supplier = require('./models/Supplier');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB for seeding'))
.catch((err) => console.error('MongoDB connection error:', err));

async function seedDatabase() {
  try {
    // Clear existing data
    await Supplier.deleteMany({});
    console.log('Cleared existing suppliers');

    // Read supplier data from JSON file
    const supplierData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../supplier.json'), 'utf8')
    );

    // Create the supplier
    const supplier = new Supplier(supplierData);
    await supplier.save();

    console.log('✅ Supplier seeded successfully:', supplier.name);
    
    // Add a few more sample suppliers
    const additionalSuppliers = [
      {
        order_type: "api",
        name: "Fresh Foods Direct",
        email: "orders@freshfoodsdirect.com",
        phone: "+1 555 123 4567",
        address: "123 Market St, San Francisco, CA 94102",
        website: "https://freshfoodsdirect.com",
        currency: "USD",
        timezone: "America/Los_Angeles",
        language: "en",
        categories: ["Fresh Produce", "Organic Foods", "Dairy Products"],
        comment: "Premium organic food supplier"
      },
      {
        order_type: "email",
        name: "Euro Beverage Co",
        email: "sales@eurobeverage.com",
        phone: "+49 30 12345678",
        address: "Berliner Str. 45, 10115 Berlin, Germany",
        website: "https://eurobeverage.com",
        currency: "EUR",
        timezone: "Europe/Berlin",
        language: "de",
        categories: ["Beverages", "Wine & Spirits", "Coffee & Tea"],
        comment: "Leading European beverage distributor"
      }
    ];

    await Supplier.insertMany(additionalSuppliers);
    console.log('✅ Additional suppliers seeded successfully');

    const totalSuppliers = await Supplier.countDocuments();
    console.log(`🎉 Database seeded with ${totalSuppliers} suppliers`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();