const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    // ---- AI Sentiment Analysis fields ----
    // Filled in automatically by reviewController using the `sentiment`
    // NLP library — not entered by the user. See NOTES.md for how this works.
    sentimentScore: { type: Number, default: 0 },
    sentimentLabel: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
  },
  { timestamps: true }
);

// A user can only leave ONE review per product (they can edit it later).
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
