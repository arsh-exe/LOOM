const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discount: {
      // Percentage off, e.g. 20 means 20% off. Defaults to 0 (no discount).
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    category: {
      // Reference to a Category document, not a plain string.
      // This is how relationships work in MongoDB/Mongoose —
      // we store the Category's _id here, and can "populate" the
      // full category details later when we query products.
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    images: {
      // Array of image URLs. Empty array by default.
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    rating: {
      // Average rating, recalculated whenever a review is added/edited/deleted.
      // We store it directly on the product (instead of always calculating
      // it live from all reviews) so product listing pages can sort/filter
      // by rating without an expensive join every time.
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt automatically — this is our "Created date"
  }
);

// A "virtual" field: computed on the fly, not stored in the database.
// Lets the frontend just read product.finalPrice instead of doing the
// price/discount math itself every time.
ProductSchema.virtual('finalPrice').get(function () {
  return +(this.price - (this.price * this.discount) / 100).toFixed(2);
});

// Include virtuals when converting documents to JSON (e.g. in API responses)
ProductSchema.set('toJSON', { virtuals: true });

// Index commonly searched/filtered fields for faster queries as the
// product catalog grows. 'text' index enables MongoDB's built-in search.
ProductSchema.index({ name: 'text', brand: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });

module.exports = mongoose.model('Product', ProductSchema);
