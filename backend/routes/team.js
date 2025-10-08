const express = require('express');
const User = require('../models/User');
const ChangeRequest = require('../models/ChangeRequest');
const OrderRequest = require('../models/OrderRequest');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is team member
const requireTeamMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).populate('membershipId');
    if (!user || user.role !== 'team-member' || !user.isActive) {
      return res.status(403).json({ message: 'Access denied. Active team member required.' });
    }
    
    if (!user.membershipId || !user.membershipId.isSubscriptionActive()) {
      return res.status(403).json({ message: 'Access denied. Subscription not active.' });
    }
    
    req.teamMember = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recipes (read-only for team members)
router.get('/recipes', auth.requireAuth, requireTeamMember, async (req, res) => {
  try {
    if (!req.teamMember.permissions.canViewRecipes) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const recipes = await Recipe.find({ membershipId: req.teamMember.membershipId._id })
      .populate('ingredients.ingredientId')
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ingredients (read-only for team members)
router.get('/ingredients', auth.requireAuth, requireTeamMember, async (req, res) => {
  try {
    if (!req.teamMember.permissions.canViewIngredients) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const ingredients = await Ingredient.find({ membershipId: req.teamMember.membershipId._id })
      .sort({ name: 1 });

    res.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit change request for recipe
router.post('/change-requests/recipe', auth.requireAuth, requireTeamMember, async (req, res) => {
  try {
    if (!req.teamMember.permissions.canRecommendChanges) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const { recipeId, title, description, proposedChanges, priority } = req.body;

    // Verify recipe exists and belongs to the same membership
    const recipe = await Recipe.findOne({
      _id: recipeId,
      membershipId: req.teamMember.membershipId._id
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const changeRequest = new ChangeRequest({
      submittedBy: req.teamMember._id,
      membershipId: req.teamMember.membershipId._id,
      type: 'recipe-change',
      targetId: recipeId,
      targetType: 'Recipe',
      title,
      description,
      proposedChanges,
      currentData: recipe.toObject(),
      priority: priority || 'medium'
    });

    await changeRequest.save();

    res.status(201).json({
      message: 'Change request submitted successfully',
      changeRequest: {
        id: changeRequest._id,
        title: changeRequest.title,
        status: changeRequest.status,
        createdAt: changeRequest.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting change request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit change request for ingredient
router.post('/change-requests/ingredient', auth.requireAuth, requireTeamMember, async (req, res) => {
  try {
    if (!req.teamMember.permissions.canRecommendChanges) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const { ingredientId, title, description, proposedChanges, priority } = req.body;

    // Verify ingredient exists and belongs to the same membership
    const ingredient = await Ingredient.findOne({
      _id: ingredientId,
      membershipId: req.teamMember.membershipId._id
    });

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    const changeRequest = new ChangeRequest({
      submittedBy: req.teamMember._id,
      membershipId: req.teamMember.membershipId._id,
      type: 'ingredient-change',
      targetId: ingredientId,
      targetType: 'Ingredient',
      title,
      description,
      proposedChanges,
      currentData: ingredient.toObject(),
      priority: priority || 'medium'
    });

    await changeRequest.save();

    res.status(201).json({
      message: 'Change request submitted successfully',
      changeRequest: {
        id: changeRequest._id,
        title: changeRequest.title,
        status: changeRequest.status,
        createdAt: changeRequest.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting change request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit order request
router.post('/order-requests', auth.requireAuth, requireTeamMember, async (req, res) => {
  try {
    if (!req.teamMember.permissions.canAddToOrders) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const { 
      title, 
      description, 
      items, 
      preferredSupplierId, 
      urgency, 
      requestedDeliveryDate 
    } = req.body;

    // Validate that all ingredients belong to the same membership
    const ingredientIds = items.map(item => item.ingredientId);
    const ingredients = await Ingredient.find({
      _id: { $in: ingredientIds },
      membershipId: req.teamMember.membershipId._id
    });

    if (ingredients.length !== ingredientIds.length) {
      return res.status(400).json({ message: 'One or more ingredients not found' });
    }

    const orderRequest = new OrderRequest({
      submittedBy: req.teamMember._id,
      membershipId: req.teamMember.membershipId._id,
      title,
      description,
      items,
      preferredSupplierId,
      urgency: urgency || 'medium',
      requestedDeliveryDate: requestedDeliveryDate ? new Date(requestedDeliveryDate) : null
    });

    await orderRequest.save();

    res.status(201).json({
      message: 'Order request submitted successfully',
      orderRequest: {
        id: orderRequest._id,
        title: orderRequest.title,
        status: orderRequest.status,
        totalEstimatedCost: orderRequest.totalEstimatedCost,
        createdAt: orderRequest.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting order request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my change requests
router.get('/my-change-requests', auth.requireAuth, requireTeamMember, async (req, res) => {
  try {
    const changeRequests = await ChangeRequest.find({
      submittedBy: req.teamMember._id
    })
    .populate('targetId')
    .populate('reviewedBy', 'firstName lastName')
    .sort({ createdAt: -1 });

    res.json(changeRequests);
  } catch (error) {
    console.error('Error fetching change requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my order requests
router.get('/my-order-requests', auth.requireAuth, requireTeamMember, async (req, res) => {
  try {
    const orderRequests = await OrderRequest.find({
      submittedBy: req.teamMember._id
    })
    .populate('items.ingredientId')
    .populate('preferredSupplierId')
    .populate('reviewedBy', 'firstName lastName')
    .sort({ createdAt: -1 });

    res.json(orderRequests);
  } catch (error) {
    console.error('Error fetching order requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', auth.requireAuth, requireTeamMember, async (req, res) => {
  try {
    const user = await User.findById(req.teamMember._id)
      .select('-password')
      .populate('membershipId', 'business_name subscription_plan')
      .populate('invitedBy', 'firstName lastName email');

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth.requireAuth, requireTeamMember, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    const user = await User.findById(req.teamMember._id);
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;