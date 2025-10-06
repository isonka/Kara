const mongoose = require('mongoose');

const RecipeIngredientSchema = new mongoose.Schema({
  ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }, // Should match ingredient's unit or be convertible
  notes: { type: String } // e.g., "finely chopped", "room temperature"
}, { _id: false });

const RecipeStepSchema = new mongoose.Schema({
  step_number: { type: Number, required: true },
  instruction: { type: String, required: true },
  time_minutes: { type: Number }, // Optional cooking/prep time for this step
  temperature: { type: String }, // e.g., "350°F", "medium heat"
  equipment: [{ type: String }] // e.g., ["oven", "mixing bowl"]
}, { _id: false });

const RecipeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String }, // e.g., 'Appetizer', 'Main Course', 'Dessert'
  cuisine_type: { type: String }, // e.g., 'Italian', 'Asian', 'American'
  difficulty_level: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  prep_time_minutes: { type: Number },
  cook_time_minutes: { type: Number },
  total_time_minutes: { type: Number },
  servings: { type: Number, default: 4 },
  
  // Ingredients with quantities
  ingredients: [RecipeIngredientSchema],
  
  // Step-by-step instructions
  steps: [RecipeStepSchema],
  
  // Additional metadata
  tags: [{ type: String }], // e.g., ['vegetarian', 'gluten-free', 'spicy']
  image_url: { type: String },
  video_url: { type: String },
  source: { type: String }, // Where the recipe came from
  
  // Nutritional info (optional)
  calories_per_serving: { type: Number },
  protein_grams: { type: Number },
  carbs_grams: { type: Number },
  fat_grams: { type: Number },
  
  // Business info
  cost_per_serving: { type: Number }, // Calculated from ingredient costs
  selling_price: { type: Number },
  profit_margin: { type: Number },
  
  // Status
  is_active: { type: Boolean, default: true },
  is_featured: { type: Boolean, default: false },
  notes: { type: String }
}, {
  timestamps: true
});

// Indexes for efficient queries
RecipeSchema.index({ user: 1, category: 1 });
RecipeSchema.index({ user: 1, is_active: 1 });
RecipeSchema.index({ user: 1, tags: 1 });

module.exports = mongoose.model('Recipe', RecipeSchema);