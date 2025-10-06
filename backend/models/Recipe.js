const mongoose = require('mongoose');

const RecipeIngredientSchema = new mongoose.Schema({
  ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }, // Should match ingredient's unit or be convertible
  notes: { type: String } // e.g., "finely chopped", "room temperature"
}, { _id: false });

const RecipeStepSchema = new mongoose.Schema({
  step: { type: Number, required: true },
  description: { type: String, required: true },
  time_minutes: { type: Number } // Optional time for this step
}, { _id: false });

const RecipeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true }, // e.g., 'Appetizer', 'Main Course', 'Dessert'
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  
  // Ingredients with quantities
  ingredients: [RecipeIngredientSchema],
  
  // Step-by-step instructions  
  instructions: [RecipeStepSchema],
  
  // Additional metadata
  tags: [{ type: String }], // e.g., ['vegetarian', 'gluten-free', 'popular']
  allergens: [{ type: String }], // e.g., ['gluten', 'dairy', 'nuts']
  
  // Business info
  cost_per_serving: { type: Number }, // Calculated from ingredient costs
  total_cost: { type: Number }, // Total recipe cost
  cost_calculated: { type: Boolean, default: false },
  
  // Status
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
  notes: { type: String }
}, {
  timestamps: true
});

// Indexes for efficient queries
RecipeSchema.index({ user: 1, category: 1 });
RecipeSchema.index({ user: 1, is_active: 1 });
RecipeSchema.index({ user: 1, tags: 1 });

module.exports = mongoose.model('Recipe', RecipeSchema);