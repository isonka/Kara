// Seed ingredients for the conservatorium user
const mongoose = require('mongoose');
const Ingredient = require('./models/Ingredient');
const Supplier = require('./models/Supplier');
const User = require('./models/User');
require('dotenv').config();

async function seedIngredients() {
  console.log('Connecting to MongoDB URI:', process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Find the business owner user
  const owner = await User.findOne({ email: 'conservatorium@kara.com' });
  if (!owner) throw new Error('Owner user not found');
  console.log('Business owner ObjectId:', owner._id.toString());

  // Get all suppliers for this user
  const suppliers = await Supplier.find({ user: owner._id });
  if (suppliers.length === 0) throw new Error('No suppliers found for this user');

  // Delete all existing ingredients for this user
  await Ingredient.deleteMany({ user: owner._id });
  console.log('All existing ingredients deleted.');

  // Sample ingredients data
  const ingredientsData = [
    // Fresh Produce Co. ingredients
    {
      supplier: suppliers.find(s => s.name === 'Fresh Produce Co.')?._id,
      name: 'Organic Tomatoes',
      description: 'Fresh organic Roma tomatoes',
      category: 'Vegetables',
      unit: 'kg',
      price_per_unit: 4.50,
      minimum_order_quantity: 2,
      organic: true,
      product_code: 'FPC-TOM-001',
      shelf_life_days: 7
    },
    {
      supplier: suppliers.find(s => s.name === 'Fresh Produce Co.')?._id,
      name: 'Fresh Basil',
      description: 'Fresh sweet basil leaves',
      category: 'Herbs',
      unit: 'bunch',
      price_per_unit: 2.25,
      minimum_order_quantity: 1,
      organic: true,
      product_code: 'FPC-BAS-001',
      shelf_life_days: 5,
      storage_instructions: 'Keep refrigerated, do not wash until use'
    },
    {
      supplier: suppliers.find(s => s.name === 'Fresh Produce Co.')?._id,
      name: 'Yellow Onions',
      description: 'Large yellow cooking onions',
      category: 'Vegetables',
      unit: 'kg',
      price_per_unit: 2.80,
      minimum_order_quantity: 5,
      product_code: 'FPC-ONI-001',
      shelf_life_days: 30
    },
    {
      supplier: suppliers.find(s => s.name === 'Fresh Produce Co.')?._id,
      name: 'Bell Peppers Mix',
      description: 'Mixed colored bell peppers (red, yellow, green)',
      category: 'Vegetables',
      unit: 'kg',
      price_per_unit: 6.20,
      minimum_order_quantity: 1,
      product_code: 'FPC-PEP-001',
      shelf_life_days: 10
    },

    // Meat Masters ingredients
    {
      supplier: suppliers.find(s => s.name === 'Meat Masters')?._id,
      name: 'Chicken Breast',
      description: 'Boneless, skinless chicken breast fillets',
      category: 'Poultry',
      unit: 'kg',
      price_per_unit: 12.50,
      minimum_order_quantity: 2,
      product_code: 'MM-CHK-001',
      shelf_life_days: 3,
      storage_instructions: 'Keep refrigerated at 4°C or below'
    },
    {
      supplier: suppliers.find(s => s.name === 'Meat Masters')?._id,
      name: 'Ground Beef',
      description: '85% lean ground beef',
      category: 'Meat',
      unit: 'kg',
      price_per_unit: 15.80,
      minimum_order_quantity: 1,
      product_code: 'MM-BEF-001',
      shelf_life_days: 2,
      storage_instructions: 'Keep refrigerated, use within 48 hours'
    },
    {
      supplier: suppliers.find(s => s.name === 'Meat Masters')?._id,
      name: 'Italian Sausage',
      description: 'Mild Italian pork sausage links',
      category: 'Meat',
      unit: 'kg',
      price_per_unit: 14.20,
      minimum_order_quantity: 1,
      product_code: 'MM-SAU-001',
      shelf_life_days: 5
    },

    // Bakery Bros ingredients  
    {
      supplier: suppliers.find(s => s.name === 'Bakery Bros')?._id,
      name: 'Pizza Dough',
      description: 'Fresh made pizza dough balls',
      category: 'Bakery',
      unit: 'piece',
      price_per_unit: 3.50,
      minimum_order_quantity: 4,
      product_code: 'BB-DOU-001',
      shelf_life_days: 3,
      storage_instructions: 'Keep refrigerated or freeze for longer storage'
    },
    {
      supplier: suppliers.find(s => s.name === 'Bakery Bros')?._id,
      name: 'Sourdough Bread',
      description: 'Artisan sourdough bread loaves',
      category: 'Bakery',
      unit: 'loaf',
      price_per_unit: 6.50,
      minimum_order_quantity: 1,
      product_code: 'BB-SOU-001',
      shelf_life_days: 5
    },
    {
      supplier: suppliers.find(s => s.name === 'Bakery Bros')?._id,
      name: 'Burger Buns',
      description: 'Sesame seed burger buns',
      category: 'Bakery',
      unit: 'pack',
      price_per_unit: 4.80,
      minimum_order_quantity: 2,
      product_code: 'BB-BUN-001',
      shelf_life_days: 4,
      notes: '8 buns per pack'
    }
  ];

  // Add common fields to all ingredients
  const ingredients = ingredientsData
    .filter(ing => ing.supplier) // Only add if supplier exists
    .map(ing => ({
      ...ing,
      user: owner._id,
      currency: 'USD',
      availability: true,
      seasonal: false
    }));

  await Ingredient.insertMany(ingredients);
  console.log(`Seeded ${ingredients.length} ingredients for:`, owner.email);
  
  // Show summary by category
  const categories = await Ingredient.distinct('category', { user: owner._id });
  for (const category of categories) {
    const count = await Ingredient.countDocuments({ user: owner._id, category });
    console.log(`- ${category}: ${count} items`);
  }
  
  process.exit(0);
}

seedIngredients().catch(console.error);