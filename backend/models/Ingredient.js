const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String }, // e.g., 'Vegetables', 'Meat', 'Dairy', 'Spices'
  unit: { type: String, required: true }, // e.g., 'kg', 'lb', 'piece', 'liter'
  price_per_unit: { type: Number },
  currency: { type: String, default: 'USD' },
  minimum_order_quantity: { type: Number, default: 1 },
  maximum_order_quantity: { type: Number },
  availability: { type: Boolean, default: true },
  seasonal: { type: Boolean, default: false },
  organic: { type: Boolean, default: false },
  product_code: { type: String }, // Supplier's product code/SKU
  storage_instructions: { type: String },
  shelf_life_days: { type: Number },
  notes: { type: String }
}, {
  timestamps: true
});

// Index for efficient queries
IngredientSchema.index({ user: 1, supplier: 1 });
IngredientSchema.index({ user: 1, category: 1 });
IngredientSchema.index({ user: 1, availability: 1 });

module.exports = mongoose.model('Ingredient', IngredientSchema);