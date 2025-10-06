// Seed sample recipes for the conservatorium user
const mongoose = require('mongoose');
const Recipe = require('./models/Recipe');
const Ingredient = require('./models/Ingredient');
const User = require('./models/User');
require('dotenv').config();

async function seedRecipes() {
  console.log('Connecting to MongoDB URI:', process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Find the business owner user
  const owner = await User.findOne({ email: 'conservatorium@kara.com' });
  if (!owner) throw new Error('Owner user not found');
  console.log('Business owner ObjectId:', owner._id.toString());

  // Get all ingredients for this user
  const ingredients = await Ingredient.find({ user: owner._id });
  if (ingredients.length === 0) throw new Error('No ingredients found. Please seed ingredients first.');

  // Helper function to find ingredient by name
  const findIngredient = (name) => ingredients.find(ing => ing.name === name)?._id;

  // Delete all existing recipes for this user
  await Recipe.deleteMany({ user: owner._id });
  console.log('All existing recipes deleted.');

  // Sample recipes data
  const recipesData = [
    {
      name: 'Classic Margherita Pizza',
      description: 'Traditional Italian pizza with fresh basil and tomatoes',
      category: 'Main Course',
      cuisine: 'Italian',
      servings: 4,
      prep_time_minutes: 20,
      cook_time_minutes: 15,
      difficulty: 'Medium',
      ingredients: [
        { 
          ingredient: findIngredient('Pizza Dough'), 
          quantity: 2, 
          unit: 'piece',
          notes: 'Let come to room temperature before stretching'
        },
        { 
          ingredient: findIngredient('Organic Tomatoes'), 
          quantity: 0.5, 
          unit: 'kg',
          notes: 'Crush by hand for rustic texture'
        },
        { 
          ingredient: findIngredient('Fresh Basil'), 
          quantity: 1, 
          unit: 'bunch',
          notes: 'Add after baking for best flavor'
        }
      ].filter(ing => ing.ingredient), // Only include if ingredient exists
      instructions: [
        {
          step: 1,
          description: 'Preheat oven to 475°F (245°C). If using pizza stone, place in oven while preheating.',
          time_minutes: 5
        },
        {
          step: 2,
          description: 'Stretch pizza dough into 12-inch circles on floured surface.',
          time_minutes: 10
        },
        {
          step: 3,
          description: 'Crush tomatoes and spread evenly on dough, leaving 1-inch border for crust.',
          time_minutes: 3
        },
        {
          step: 4,
          description: 'Bake for 12-15 minutes until crust is golden brown.',
          time_minutes: 15
        },
        {
          step: 5,
          description: 'Remove from oven and immediately top with fresh basil leaves.',
          time_minutes: 2
        }
      ],
      tags: ['vegetarian', 'classic', 'popular'],
      allergens: ['gluten'],
      spice_level: 'None',
      nutritional_info: {
        calories_per_serving: 280,
        protein_grams: 12,
        carbs_grams: 35,
        fat_grams: 8
      }
    },
    {
      name: 'Italian Sausage Pasta',
      description: 'Hearty pasta with Italian sausage, peppers, and onions',
      category: 'Main Course',
      cuisine: 'Italian',
      servings: 6,
      prep_time_minutes: 15,
      cook_time_minutes: 25,
      difficulty: 'Easy',
      ingredients: [
        { 
          ingredient: findIngredient('Italian Sausage'), 
          quantity: 0.7, 
          unit: 'kg',
          notes: 'Remove from casings and crumble'
        },
        { 
          ingredient: findIngredient('Bell Peppers Mix'), 
          quantity: 0.5, 
          unit: 'kg',
          notes: 'Cut into strips'
        },
        { 
          ingredient: findIngredient('Yellow Onions'), 
          quantity: 0.3, 
          unit: 'kg',
          notes: 'Slice thin'
        },
        { 
          ingredient: findIngredient('Organic Tomatoes'), 
          quantity: 0.8, 
          unit: 'kg',
          notes: 'Diced'
        }
      ].filter(ing => ing.ingredient),
      instructions: [
        {
          step: 1,
          description: 'Cook sausage in large skillet over medium-high heat, breaking up with spoon.',
          time_minutes: 8
        },
        {
          step: 2,
          description: 'Add sliced onions and bell peppers to the sausage. Cook until softened.',
          time_minutes: 8
        },
        {
          step: 3,
          description: 'Add diced tomatoes and simmer for 10 minutes.',
          time_minutes: 10
        },
        {
          step: 4,
          description: 'Season with salt, pepper, and Italian herbs to taste.',
          time_minutes: 2
        },
        {
          step: 5,
          description: 'Serve over cooked pasta with grated Parmesan cheese.',
          time_minutes: 2
        }
      ],
      tags: ['hearty', 'comfort-food', 'popular'],
      allergens: ['gluten'],
      spice_level: 'Mild',
      nutritional_info: {
        calories_per_serving: 420,
        protein_grams: 22,
        carbs_grams: 28,
        fat_grams: 24
      }
    },
    {
      name: 'Classic Chicken Burger',
      description: 'Juicy grilled chicken breast burger with fresh vegetables',
      category: 'Main Course',
      cuisine: 'American',
      servings: 4,
      prep_time_minutes: 10,
      cook_time_minutes: 15,
      difficulty: 'Easy',
      ingredients: [
        { 
          ingredient: findIngredient('Chicken Breast'), 
          quantity: 0.6, 
          unit: 'kg',
          notes: 'Pound to even thickness for uniform cooking'
        },
        { 
          ingredient: findIngredient('Burger Buns'), 
          quantity: 1, 
          unit: 'pack',
          notes: 'Lightly toast before serving'
        },
        { 
          ingredient: findIngredient('Organic Tomatoes'), 
          quantity: 0.2, 
          unit: 'kg',
          notes: 'Slice thick'
        }
      ].filter(ing => ing.ingredient),
      instructions: [
        {
          step: 1,
          description: 'Season chicken breasts with salt, pepper, and garlic powder.',
          time_minutes: 3
        },
        {
          step: 2,
          description: 'Preheat grill or grill pan to medium-high heat.',
          time_minutes: 5
        },
        {
          step: 3,
          description: 'Grill chicken for 6-7 minutes per side until internal temperature reaches 165°F.',
          time_minutes: 14
        },
        {
          step: 4,
          description: 'Toast burger buns lightly on the grill.',
          time_minutes: 2
        },
        {
          step: 5,
          description: 'Assemble burgers with lettuce, tomato, and your choice of condiments.',
          time_minutes: 3
        }
      ],
      tags: ['grilled', 'healthy', 'popular'],
      allergens: ['gluten'],
      spice_level: 'None',
      nutritional_info: {
        calories_per_serving: 350,
        protein_grams: 35,
        carbs_grams: 25,
        fat_grams: 12
      }
    }
  ];

  // Add common fields and filter recipes with valid ingredients
  const recipes = recipesData
    .filter(recipe => recipe.ingredients.length > 0) // Only add recipes with at least one ingredient
    .map(recipe => ({
      ...recipe,
      user: owner._id,
      status: 'active',
      cost_calculated: false // Will be calculated via API endpoint
    }));

  await Recipe.insertMany(recipes);
  console.log(`Seeded ${recipes.length} recipes for:`, owner.email);
  
  // Show summary by category
  const categories = await Recipe.distinct('category', { user: owner._id });
  for (const category of categories) {
    const count = await Recipe.countDocuments({ user: owner._id, category });
    console.log(`- ${category}: ${count} recipes`);
  }

  console.log('\nTo calculate recipe costs, make POST requests to /api/recipes/:id/calculate-cost');
  
  process.exit(0);
}

seedRecipes().catch(console.error);