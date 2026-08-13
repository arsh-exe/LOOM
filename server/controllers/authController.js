const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Small helper so we don't repeat this response shape 3 times below.
function sendAuthResponse(res, statusCode, user) {
  res.status(statusCode).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email and password');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error('An account with this email already exists');
    }

    // Password hashing happens automatically via the User model's
    // pre-save hook — we never touch the plaintext password here.
    const user = await User.create({ name, email, password });

    sendAuthResponse(res, 201, user);
  } catch (error) {
    next(error);
  }
};

// @desc    Login and receive a JWT
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // password has `select: false` in the schema, so we must explicitly
    // ask for it here with .select('+password') to be able to compare it.
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      // Deliberately vague — never reveal whether it was the email or
      // password that was wrong. That would help attackers enumerate
      // valid accounts.
      throw new Error('Invalid email or password');
    }

    sendAuthResponse(res, 200, user);
  } catch (error) {
    next(error);
  }
};

// @desc    Get the currently logged-in user's profile
// @route   GET /api/auth/me
// @access  Private (requires valid JWT — see authMiddleware)
exports.getMe = async (req, res, next) => {
  try {
    // req.user was already attached by the "protect" middleware
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile (name / shipping address)
// @route   PUT /api/auth/me
// @access  Private
exports.updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    if (req.body.shippingAddress) {
      user.shippingAddress = req.body.shippingAddress;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      shippingAddress: updatedUser.shippingAddress,
    });
  } catch (error) {
    next(error);
  }
};
