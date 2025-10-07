const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  role: { 
    type: String, 
    enum: ['root-admin', 'team-member', 'admin', 'user', 'owner'], 
    default: 'user' 
  },
  // Reference to the membership/organization this user belongs to
  membershipId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Membership',
    required: function() { return this.role === 'root-admin' || this.role === 'team-member'; }
  },
  // Reference to the root-admin who invited this user (for team-members)
  invitedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: function() { return this.role === 'team-member'; }
  },
  // User profile information
  firstName: { type: String },
  lastName: { type: String },
  // Status and permissions
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  // Team member specific fields
  permissions: {
    canViewRecipes: { type: Boolean, default: true },
    canViewIngredients: { type: Boolean, default: true },
    canRecommendChanges: { type: Boolean, default: true },
    canAddToOrders: { type: Boolean, default: true }
  },
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Method to check if user can invite more team members
UserSchema.methods.canInviteMoreUsers = async function() {
  if (this.role !== 'root-admin') return false;
  
  const Membership = mongoose.model('Membership');
  const membership = await Membership.findById(this.membershipId);
  if (!membership) return false;
  
  // Count current team members for this membership
  const currentTeamCount = await this.model('User').countDocuments({
    membershipId: this.membershipId,
    role: 'team-member',
    isActive: true
  });
  
  // Check limits based on subscription plan
  const limits = {
    'basic': 1,
    'premium': 5,
    'enterprise': Infinity
  };
  
  return currentTeamCount < limits[membership.subscription_plan];
};

module.exports = mongoose.model('User', UserSchema);
