const mongoose = require('mongoose');

const OrderRequestSchema = new mongoose.Schema({
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
  // Order details
  title: { type: String, required: true },
  description: { type: String },
  // Items to order
  items: [{
    ingredientId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Ingredient',
      required: true 
    },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    estimatedCost: { type: Number },
    notes: { type: String }
  }],
  // Supplier preference
  preferredSupplierId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Supplier'
  },
  // Urgency and timing
  urgency: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium' 
  },
  requestedDeliveryDate: { type: Date },
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'ordered', 'delivered'],
    default: 'pending' 
  },
  // Admin response
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  reviewedAt: { type: Date },
  adminNotes: { type: String },
  // Order tracking
  orderNumber: { type: String },
  actualCost: { type: Number },
  orderedAt: { type: Date },
  deliveredAt: { type: Date },
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
OrderRequestSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending') {
    this.reviewedAt = Date.now();
  }
  this.updatedAt = Date.now();
  next();
});

// Calculate total estimated cost
OrderRequestSchema.virtual('totalEstimatedCost').get(function() {
  return this.items.reduce((total, item) => total + (item.estimatedCost || 0), 0);
});

module.exports = mongoose.model('OrderRequest', OrderRequestSchema);