const Product = require('../models/Product');
const getRecommendations = require('../utils/recommendations');

// @desc    Get all products, with search / filter / sort / pagination
// @route   GET /api/products
// @access  Public
//
// Supported query params (all optional):
//   keyword   - text search on name/brand, e.g. ?keyword=shoes
//   category  - category ObjectId, e.g. ?category=64f...
//   brand     - exact brand match, e.g. ?brand=Nike
//   minPrice / maxPrice - price range, e.g. ?minPrice=10&maxPrice=100
//   minRating - e.g. ?minRating=4
//   inStock   - "true" to only show products with stock > 0
//   sort      - one of: price_asc, price_desc, newest, rating
//   page / limit - pagination, e.g. ?page=2&limit=12
exports.getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    // Build the MongoDB filter object step by step.
    const filter = {};

    if (keyword) {
      const searchText = keyword.trim();
      if (searchText.length >= 2) {
        const safeKeyword = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const keywordRegex = new RegExp(`(?:^|\\s)${safeKeyword}(?:\\s|$)`, 'i');

        // Match full words/phrases instead of broad partial matches, so a random
        // query doesn't return unrelated products from common letters or words.
        filter.$or = [
          { name: keywordRegex },
          { brand: keywordRegex },
          { description: keywordRegex },
        ];
      } else {
        filter._id = { $exists: false };
      }
    }

    if (category) filter.category = category;
    if (brand) filter.brand = brand;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // Map friendly sort names to actual Mongoose sort objects
    const sortOptions = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
      rating: { rating: -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 }; // default: newest first

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    // Run the query and count total matches (for pagination) in parallel
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug') // replace category ObjectId with { name, slug }
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalProducts: total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI-recommended related products for a given product
// @route   GET /api/products/:id/recommendations
// @access  Public
// See utils/recommendations.js for how the scoring algorithm works.
exports.getRecommendations = async (req, res, next) => {
  try {
    const baseProduct = await Product.findById(req.params.id);
    if (!baseProduct) {
      res.status(404);
      throw new Error('Product not found');
    }

    // In a small catalog, scoring every product is cheap. For a much
    // larger catalog you'd first narrow with a DB filter (e.g. same
    // category) before scoring, to avoid loading the entire collection.
    const candidates = await Product.find({ _id: { $ne: baseProduct._id } }).populate(
      'category',
      'name slug'
    );

    const recommendations = getRecommendations(baseProduct, candidates, 4);
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin (locked down once auth middleware exists — Phase 4)
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, discount, category, brand, images, stock } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      discount,
      category,
      brand,
      images,
      stock,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Only overwrite fields that were actually sent in the request body
    Object.assign(product, req.body);

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};
