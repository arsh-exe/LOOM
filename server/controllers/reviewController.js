const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const analyzeSentiment = require('../utils/sentiment');

// Recalculates a product's average rating + review count.
// Called any time a review is created, edited, or deleted.
async function recalculateProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const rating = stats.length > 0 ? +stats[0].avgRating.toFixed(1) : 0;
  const numReviews = stats.length > 0 ? stats[0].count : 0;

  await Product.findByIdAndUpdate(productId, { rating, numReviews });
}

// @desc    Add a review to a product
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Verified-purchase check: only users who actually bought this
    // product may review it. This is a common e-commerce trust feature.
    const hasPurchased = await Order.exists({
      user: req.user._id,
      'items.product': productId,
    });

    if (!hasPurchased) {
      res.status(403);
      throw new Error('You can only review products you have purchased');
    }

    const alreadyReviewed = await Review.findOne({ user: req.user._id, product: productId });
    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You have already reviewed this product');
    }

    // ---- AI Sentiment Analysis runs here ----
    const { score, label } = analyzeSentiment(comment);

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
      sentimentScore: score,
      sentimentLabel: label,
    });

    await recalculateProductRating(productId);

    const populated = await review.populate('user', 'name');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a product (+ a sentiment summary)
// @route   GET /api/products/:id/reviews
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    // AI-powered summary: what % of reviews are positive/neutral/negative
    const summary = { positive: 0, neutral: 0, negative: 0 };
    reviews.forEach((r) => summary[r.sentimentLabel]++);

    res.json({ reviews, sentimentSummary: summary });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit your own review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    if (review.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to edit this review');
    }

    if (req.body.rating) review.rating = req.body.rating;
    if (req.body.comment) {
      review.comment = req.body.comment;
      const { score, label } = analyzeSentiment(req.body.comment);
      review.sentimentScore = score;
      review.sentimentLabel = label;
    }

    await review.save();
    await recalculateProductRating(review.product);

    res.json(review);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete your own review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this review');
    }

    const productId = review.product;
    await review.deleteOne();
    await recalculateProductRating(productId);

    res.json({ message: 'Review removed' });
  } catch (error) {
    next(error);
  }
};
