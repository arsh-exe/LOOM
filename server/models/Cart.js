const mongoose = require('mongoose');

// A cart has one document per user, containing an array of items.
// Each item stores a reference to the Product plus the quantity chosen.
// We deliberately do NOT copy the product's price into the cart item —
// we always read the live price from the Product document when
// calculating totals, so price changes are always reflected correctly.
const CartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one cart per user
    },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', CartSchema);
