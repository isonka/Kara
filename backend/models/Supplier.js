const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order_type: { type: String },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  website: { type: String },
  products_url: { type: String },
  currency: { type: String },
  timezone: { type: String },
  language: { type: String },
  comment: { type: String },
  logo: { type: String },
  categories: [{ type: String }],
  order_example: { type: String }
});

module.exports = mongoose.model('Supplier', SupplierSchema);
