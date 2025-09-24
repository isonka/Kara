const express = require('express');
const router = express.Router();
const Membership = require('../models/Membership');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Protect all membership routes (admin only)
router.use(requireAuth, requireAdmin);

// Create a new membership
router.post('/', async (req, res) => {
  try {
    const membership = new Membership(req.body);
    await membership.save();
    res.status(201).json(membership);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all memberships
router.get('/', async (req, res) => {
  try {
    const memberships = await Membership.find();
    res.json(memberships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a membership by ID
router.get('/:id', async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) return res.status(404).json({ error: 'Membership not found' });
    res.json(membership);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a membership
router.put('/:id', async (req, res) => {
  try {
    const membership = await Membership.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!membership) return res.status(404).json({ error: 'Membership not found' });
    res.json(membership);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a membership
router.delete('/:id', async (req, res) => {
  try {
    const membership = await Membership.findByIdAndDelete(req.params.id);
    if (!membership) return res.status(404).json({ error: 'Membership not found' });
    res.json({ message: 'Membership deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
