const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const auth = require('../middleware/auth');

// Get all recipes for the logged-in user
router.get('/', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const recipes = await Recipe.find({ user: userId })
      .populate({
        path: 'ingredients.ingredient',
        populate: { path: 'supplier', select: 'name' }
      })
      .sort({ name: 1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recipes by category
router.get('/category/:category', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const recipes = await Recipe.find({ 
      user: userId, 
      category: req.params.category 
    }).populate({
      path: 'ingredients.ingredient',
      populate: { path: 'supplier', select: 'name' }
    });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new recipe
router.post('/', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    
    // Verify all ingredients belong to the user
    if (req.body.ingredients && req.body.ingredients.length > 0) {
      const ingredientIds = req.body.ingredients.map(ing => ing.ingredient);
      const userIngredients = await Ingredient.find({ 
        _id: { $in: ingredientIds }, 
        user: userId 
      });
      
      if (userIngredients.length !== ingredientIds.length) {
        return res.status(400).json({ error: 'One or more ingredients not found or not accessible' });
      }
    }

    const recipe = new Recipe({
      ...req.body,
      user: userId
    });
    
    await recipe.save();
    await recipe.populate({
      path: 'ingredients.ingredient',
      populate: { path: 'supplier', select: 'name' }
    });
    
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a single recipe
router.get('/:id', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const recipe = await Recipe.findOne({ 
      _id: req.params.id, 
      user: userId 
    }).populate({
      path: 'ingredients.ingredient',
      populate: { path: 'supplier', select: 'name email' }
    });
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a recipe
router.put('/:id', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    
    // Verify all ingredients belong to the user
    if (req.body.ingredients && req.body.ingredients.length > 0) {
      const ingredientIds = req.body.ingredients.map(ing => ing.ingredient);
      const userIngredients = await Ingredient.find({ 
        _id: { $in: ingredientIds }, 
        user: userId 
      });
      
      if (userIngredients.length !== ingredientIds.length) {
        return res.status(400).json({ error: 'One or more ingredients not found or not accessible' });
      }
    }

    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      req.body,
      { new: true }
    ).populate({
      path: 'ingredients.ingredient',
      populate: { path: 'supplier', select: 'name email' }
    });
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a recipe
router.delete('/:id', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const recipe = await Recipe.findOneAndDelete({ 
      _id: req.params.id, 
      user: userId 
    });
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Calculate recipe cost
router.get('/:id/cost', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const recipe = await Recipe.findOne({ 
      _id: req.params.id, 
      user: userId 
    }).populate('ingredients.ingredient');
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    let totalCost = 0;
    const ingredientCosts = [];

    for (const recipeIngredient of recipe.ingredients) {
      const ingredient = recipeIngredient.ingredient;
      if (ingredient.price_per_unit) {
        const cost = ingredient.price_per_unit * recipeIngredient.quantity;
        totalCost += cost;
        ingredientCosts.push({
          ingredient: ingredient.name,
          quantity: recipeIngredient.quantity,
          unit: recipeIngredient.unit,
          pricePerUnit: ingredient.price_per_unit,
          totalCost: cost,
          currency: ingredient.currency
        });
      }
    }

    const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0;

    res.json({
      totalCost,
      costPerServing,
      servings: recipe.servings,
      ingredientCosts,
      currency: ingredientCosts.length > 0 ? ingredientCosts[0].currency : 'USD'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recipe categories
router.get('/meta/categories', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const categories = await Recipe.distinct('category', { user: userId });
    res.json(categories.filter(cat => cat)); // Remove null/empty categories
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;