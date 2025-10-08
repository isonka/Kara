const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Membership = require('../models/Membership');
const ChangeRequest = require('../models/ChangeRequest');
const OrderRequest = require('../models/OrderRequest');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is root-admin
const requireRootAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'root-admin') {
      return res.status(403).json({ message: 'Access denied. Root admin required.' });
    }
    req.rootAdmin = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all team members for the root admin's membership
router.get('/team', auth.requireAuth, requireRootAdmin, async (req, res) => {
  try {
    const teamMembers = await User.find({
      membershipId: req.rootAdmin.membershipId,
      role: 'team-member',
      isActive: true
    })
    .select('-password')
    .populate('invitedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });

    const membership = await Membership.findById(req.rootAdmin.membershipId);
    const canInviteMore = await req.rootAdmin.canInviteMoreUsers();

    res.json({
      teamMembers,
      canInviteMore,
      currentPlan: membership.subscription_plan,
      userLimit: membership.getCurrentUserLimit(),
      currentCount: teamMembers.length
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Invite a new team member
router.post('/invite', auth.requireAuth, requireRootAdmin, async (req, res) => {
  try {
    const { email, firstName, lastName, permissions } = req.body;

    // Check if can invite more users
    const canInvite = await req.rootAdmin.canInviteMoreUsers();
    if (!canInvite) {
      return res.status(400).json({ message: 'User limit reached for your subscription plan' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create new team member
    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'team-member',
      membershipId: req.rootAdmin.membershipId,
      invitedBy: req.rootAdmin._id,
      permissions: {
        canViewRecipes: permissions?.canViewRecipes ?? true,
        canViewIngredients: permissions?.canViewIngredients ?? true,
        canRecommendChanges: permissions?.canRecommendChanges ?? true,
        canAddToOrders: permissions?.canAddToOrders ?? true
      }
    });

    await newUser.save();

    // TODO: Send invitation email with temporary password
    // For now, return the temp password (in production, this should be emailed)
    
    res.status(201).json({
      message: 'Team member invited successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        permissions: newUser.permissions
      },
      tempPassword // Remove this in production
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update team member permissions
router.put('/team/:userId/permissions', auth.requireAuth, requireRootAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    const user = await User.findOne({
      _id: userId,
      membershipId: req.rootAdmin.membershipId,
      role: 'team-member'
    });

    if (!user) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    user.permissions = {
      canViewRecipes: permissions?.canViewRecipes ?? user.permissions.canViewRecipes,
      canViewIngredients: permissions?.canViewIngredients ?? user.permissions.canViewIngredients,
      canRecommendChanges: permissions?.canRecommendChanges ?? user.permissions.canRecommendChanges,
      canAddToOrders: permissions?.canAddToOrders ?? user.permissions.canAddToOrders
    };

    await user.save();

    res.json({
      message: 'Permissions updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate team member
router.put('/team/:userId/deactivate', auth.requireAuth, requireRootAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({
      _id: userId,
      membershipId: req.rootAdmin.membershipId,
      role: 'team-member'
    });

    if (!user) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'Team member deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get change requests (for root admin)
router.get('/change-requests', auth.requireAuth, requireRootAdmin, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    
    const changeRequests = await ChangeRequest.find({
      membershipId: req.rootAdmin.membershipId,
      ...(status !== 'all' && { status })
    })
    .populate('submittedBy', 'firstName lastName email')
    .populate('reviewedBy', 'firstName lastName email')
    .populate('targetId')
    .sort({ createdAt: -1 });

    res.json(changeRequests);
  } catch (error) {
    console.error('Error fetching change requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order requests (for root admin)
router.get('/order-requests', auth.requireAuth, requireRootAdmin, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    
    const orderRequests = await OrderRequest.find({
      membershipId: req.rootAdmin.membershipId,
      ...(status !== 'all' && { status })
    })
    .populate('submittedBy', 'firstName lastName email')
    .populate('reviewedBy', 'firstName lastName email')
    .populate('items.ingredientId')
    .populate('preferredSupplierId')
    .sort({ createdAt: -1 });

    res.json(orderRequests);
  } catch (error) {
    console.error('Error fetching order requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/reject change request
router.put('/change-requests/:requestId', auth.requireAuth, requireRootAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const changeRequest = await ChangeRequest.findOne({
      _id: requestId,
      membershipId: req.rootAdmin.membershipId
    });

    if (!changeRequest) {
      return res.status(404).json({ message: 'Change request not found' });
    }

    changeRequest.status = status;
    changeRequest.reviewedBy = req.rootAdmin._id;
    changeRequest.adminNotes = adminNotes;
    
    await changeRequest.save();

    res.json({ message: `Change request ${status} successfully` });
  } catch (error) {
    console.error('Error updating change request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/reject order request
router.put('/order-requests/:requestId', auth.requireAuth, requireRootAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const orderRequest = await OrderRequest.findOne({
      _id: requestId,
      membershipId: req.rootAdmin.membershipId
    });

    if (!orderRequest) {
      return res.status(404).json({ message: 'Order request not found' });
    }

    orderRequest.status = status;
    orderRequest.reviewedBy = req.rootAdmin._id;
    orderRequest.adminNotes = adminNotes;
    
    await orderRequest.save();

    res.json({ message: `Order request ${status} successfully` });
  } catch (error) {
    console.error('Error updating order request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;