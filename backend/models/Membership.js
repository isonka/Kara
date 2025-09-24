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
  notes: { type: String }
});

module.exports = mongoose.model('Membership', MembershipSchema);
