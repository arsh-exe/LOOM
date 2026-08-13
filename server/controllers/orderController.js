const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const FLAT_SHIPPING_RATE = 5.99;
const FREE_SHIPPING_THRESHOLD = 75;

// @desc    Create an order from the user's current cart
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress) {
      res.status(400);
      throw new Error('Shipping address is required');
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error('Cart is empty');
    }

    // Validate stock and build the order's item snapshots in one pass
    const orderItems = [];
    let itemsPrice = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;

      if (!product) continue; // product was deleted since being added to cart

      if (product.stock < cartItem.quantity) {
        res.status(400);
        throw new Error(`"${product.name}" only has ${product.stock} in stock`);
      }

      const lineTotal = product.finalPrice * cartItem.quantity;
      itemsPrice += lineTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || '',
        price: product.finalPrice,
        quantity: cartItem.quantity,
      });
    }

    const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
    const totalPrice = +(itemsPrice + shippingPrice).toFixed(2);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      itemsPrice: +itemsPrice.toFixed(2),
      shippingPrice,
      totalPrice,
    });

    // Decrease stock for each purchased product now that the order is placed
    await Promise.all(
      orderItems.map((item) =>
        Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
      )
    );

    // Empty the cart now that it's been converted into an order
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get the logged-in user's own orders
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single order by ID (only its owner, or an admin, may view it)
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};
