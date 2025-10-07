const mongoose = require('mongoose');

const ChangeRequestSchema = new mongoose.Schema({
  // Reference to the user who submitted the request
  submittedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  // Reference to the membership/organization
  membershipId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Membership',
    required: true 
  },
  // Type of change request
  type: { 
    type: String, 
    enum: ['recipe-change', 'ingredient-change', 'new-recipe', 'new-ingredient'],
    required: true 
  },
  // Target resource (recipe/ingredient ID)
  targetId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true 
  },
  targetType: { 
    type: String, 
    enum: ['Recipe', 'Ingredient'],
    required: true 
  },
  // Change details
  title: { type: String, required: true },
  description: { type: String, required: true },
  // Proposed changes (JSON object with the changes)
  proposedChanges: { type: mongoose.Schema.Types.Mixed },
  // Current data (for comparison)
  currentData: { type: mongoose.Schema.Types.Mixed },
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'implemented'],
    default: 'pending' 
  },
  // Admin response
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  reviewedAt: { type: Date },
  adminNotes: { type: String },
  // Priority
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium' 
  },
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
ChangeRequestSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending') {
    this.reviewedAt = Date.now();
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ChangeRequest', ChangeRequestSchema);