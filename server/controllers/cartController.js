const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Recalculates subtotal/total for a cart and returns a clean response
// shape. Always uses the LIVE product price (not a stored snapshot).
async function buildCartResponse(cart) {
  await cart.populate('items.product');

  let subtotal = 0;
  const items = cart.items.map((item) => {
    // A product referenced in the cart may have been deleted by an admin —
    // guard against that instead of crashing.
    if (!item.product) return null;

    const lineTotal = item.product.finalPrice * item.quantity;
    subtotal += lineTotal;

    return {
      product: item.product,
      quantity: item.quantity,
      lineTotal: +lineTotal.toFixed(2),
      outOfStock: item.product.stock < item.quantity,
    };
  }).filter(Boolean);

  return {
    _id: cart._id,
    items,
    subtotal: +subtotal.toFixed(2),
  };
}

// @desc    Get the logged-in user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(await buildCartResponse(cart));
  } catch (error) {
    next(error);
  }
};

// @desc    Add a product to the cart (or increase quantity if already in it)
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    res.status(201).json(await buildCartResponse(cart));
  } catch (error) {
    next(error);
  }
};

// @desc    Change the quantity of a specific product in the cart
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      res.status(400);
      throw new Error('Quantity must be at least 1');
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    const item = cart.items.find((item) => item.product.toString() === req.params.productId);
    if (!item) {
      res.status(404);
      throw new Error('Item not in cart');
    }

    item.quantity = Number(quantity);
    await cart.save();

    res.json(await buildCartResponse(cart));
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a product from the cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
    await cart.save();

    res.json(await buildCartResponse(cart));
  } catch (error) {
    next(error);
  }
};
