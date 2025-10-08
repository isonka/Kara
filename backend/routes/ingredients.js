const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');
const Supplier = require('../models/Supplier');
const auth = require('../middleware/auth');

// Get all ingredients for the logged-in user
router.get('/', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const ingredients = await Ingredient.find({ user: userId })
      .populate('supplier', 'name email order_type')
      .sort({ category: 1, name: 1 });
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get ingredients by supplier
router.get('/supplier/:supplierId', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const ingredients = await Ingredient.find({ 
      user: userId, 
      supplier: req.params.supplierId 
    }).populate('supplier', 'name email');
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get ingredients by category
router.get('/category/:category', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const ingredients = await Ingredient.find({ 
      user: userId, 
      category: req.params.category 
    }).populate('supplier', 'name email');
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new ingredient
router.post('/', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    
    // Verify supplier belongs to the user
    const supplier = await Supplier.findOne({ _id: req.body.supplier, user: userId });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found or not accessible' });
    }

    const ingredient = new Ingredient({
      ...req.body,
      user: userId
    });
    
    await ingredient.save();
    await ingredient.populate('supplier', 'name email order_type');
    res.status(201).json(ingredient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a single ingredient
router.get('/:id', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const ingredient = await Ingredient.findOne({ 
      _id: req.params.id, 
      user: userId 
    }).populate('supplier', 'name email order_type');
    
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    res.json(ingredient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an ingredient
router.put('/:id', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    
    // If updating supplier, verify it belongs to the user
    if (req.body.supplier) {
      const supplier = await Supplier.findOne({ _id: req.body.supplier, user: userId });
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found or not accessible' });
      }
    }

    const ingredient = await Ingredient.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      req.body,
      { new: true }
    ).populate('supplier', 'name email order_type');
    
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    res.json(ingredient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an ingredient
router.delete('/:id', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const ingredient = await Ingredient.findOneAndDelete({ 
      _id: req.params.id, 
      user: userId 
    });
    
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available categories
router.get('/meta/categories', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const categories = await Ingredient.distinct('category', { user: userId });
    res.json(categories.filter(cat => cat)); // Remove null/empty categories
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available units
router.get('/meta/units', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const units = await Ingredient.distinct('unit', { user: userId });
    res.json(units.filter(unit => unit)); // Remove null/empty units
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;