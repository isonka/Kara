const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
  business_name: { type: String, required: true },
  business_type: { type: String, enum: ['restaurant', 'hotel', 'other'], required: true },
  contact_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  website: { type: String },
  subscription_status: { type: String, enum: ['active', 'trial', 'expired', 'cancelled'], default: 'trial' },
  subscription_plan: { type: String, enum: ['basic', 'premium', 'enterprise'], default: 'basic' },
  payment_token: { type: String }, // Store only tokenized payment info
  date_joined: { type: Date, default: Date.now },
  last_payment_date: { type: Date },
  trial_ends: { type: Date },
  subscription_expires: { type: Date },
  notes: { type: String },
  // User limits based on subscription
  userLimits: {
    basic: { type: Number, default: 1 },
    premium: { type: Number, default: 5 },
    enterprise: { type: Number, default: -1 } // -1 means unlimited
  },
  // Settings
  settings: {
    allowTeamChangeRequests: { type: Boolean, default: true },
    allowTeamOrderRequests: { type: Boolean, default: true },
    requireApprovalForOrders: { type: Boolean, default: true },
    requireApprovalForChanges: { type: Boolean, default: true }
  }
});

// Method to get current user limit
MembershipSchema.methods.getCurrentUserLimit = function() {
  return this.userLimits[this.subscription_plan] || 1;
};

// Method to check if subscription is active
MembershipSchema.methods.isSubscriptionActive = function() {
  if (this.subscription_status === 'cancelled' || this.subscription_status === 'expired') {
    return false;
  }
  
  if (this.subscription_status === 'trial') {
    return !this.trial_ends || this.trial_ends > new Date();
  }
  
  return !this.subscription_expires || this.subscription_expires > new Date();
};

module.exports = mongoose.model('Membership', MembershipSchema);
