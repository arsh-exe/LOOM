// One-time script to populate the database with realistic demo data:
// categories, products (with real internet-sourced images), an admin
// user, and a regular test user. Run with: npm run seed
//
// Product photos come from LoremFlickr (loremflickr.com), which serves
// real, keyword-matched, Creative-Commons-licensed photos sourced from
// Flickr — no API key required. The `?lock=N` parameter pins a specific
// photo per product so images stay consistent between runs (otherwise
// each request would return a different random photo for that keyword).
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Review = require('./models/Review');

function img(keyword, lock, w = 600, h = 600) {
  return `https://loremflickr.com/${w}/${h}/${keyword}?lock=${lock}`;
}

const categoriesData = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Footwear', slug: 'footwear' },
  { name: 'Bags & Backpacks', slug: 'bags-backpacks' },
  { name: 'Watches', slug: 'watches' },
  { name: 'Home & Living', slug: 'home-living' },
];

async function seed() {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    Category.deleteMany(),
    Product.deleteMany(),
    User.deleteMany(),
    Cart.deleteMany(),
    Order.deleteMany(),
    Review.deleteMany(),
  ]);

  console.log('Creating categories...');
  const categories = await Category.insertMany(categoriesData);
  const catId = (slug) => categories.find((c) => c.slug === slug)._id;

  console.log('Creating products...');
  const productsData = [
    {
      name: 'AeroSound Wireless Headphones',
      description:
        'Over-ear wireless headphones with active noise cancellation, 30-hour battery life, and plush memory-foam ear cushions for all-day comfort.',
      price: 129.99,
      discount: 15,
      category: catId('electronics'),
      brand: 'AeroSound',
      images: [img('headphones', 1), img('headphones', 2)],
      stock: 40,
    },
    {
      name: 'PulseFit Wireless Earbuds',
      description:
        'Compact true-wireless earbuds with sweat resistance, touch controls, and a compact charging case good for 5 extra charges.',
      price: 59.99,
      discount: 10,
      category: catId('electronics'),
      brand: 'PulseFit',
      images: [img('earbuds', 3)],
      stock: 65,
    },
    {
      name: 'ClearView 4K Action Camera',
      description:
        'Waterproof 4K action camera with image stabilization, wide-angle lens, and Wi-Fi transfer to your phone.',
      price: 189.99,
      discount: 0,
      category: catId('electronics'),
      brand: 'ClearView',
      images: [img('camera', 4)],
      stock: 20,
    },
    {
      name: 'BoomBox Portable Bluetooth Speaker',
      description:
        'Rugged, IPX7 waterproof Bluetooth speaker with 20 hours of playtime and deep bass output.',
      price: 74.99,
      discount: 20,
      category: catId('electronics'),
      brand: 'BoomBox',
      images: [img('speaker', 5)],
      stock: 50,
    },
    {
      name: 'StrideMax Running Shoes',
      description:
        'Lightweight running shoes with breathable mesh upper and responsive cushioned sole for daily training.',
      price: 89.99,
      discount: 10,
      category: catId('footwear'),
      brand: 'StrideMax',
      images: [img('running-shoes', 6), img('sneakers', 7)],
      stock: 55,
    },
    {
      name: 'UrbanStep Casual Sneakers',
      description:
        'Everyday minimalist sneakers with a clean silhouette, memory-foam insole, and durable rubber outsole.',
      price: 64.99,
      discount: 0,
      category: catId('footwear'),
      brand: 'UrbanStep',
      images: [img('sneakers', 8)],
      stock: 70,
    },
    {
      name: 'TrailBlaze Hiking Boots',
      description:
        'Waterproof hiking boots with reinforced ankle support and an aggressive grip sole for rough terrain.',
      price: 109.99,
      discount: 5,
      category: catId('footwear'),
      brand: 'TrailBlaze',
      images: [img('hiking-boots', 9)],
      stock: 30,
    },
    {
      name: 'CityPack 25L Backpack',
      description:
        'Water-resistant everyday backpack with a padded 15" laptop sleeve, USB charging port, and anti-theft zippers.',
      price: 54.99,
      discount: 15,
      category: catId('bags-backpacks'),
      brand: 'CityPack',
      images: [img('backpack', 10), img('backpack', 11)],
      stock: 60,
    },
    {
      name: 'VoyagerPro Travel Duffel',
      description:
        'Spacious 45L duffel bag with a separate shoe compartment, built from tear-resistant water-repellent fabric.',
      price: 69.99,
      discount: 0,
      category: catId('bags-backpacks'),
      brand: 'VoyagerPro',
      images: [img('duffel-bag', 12)],
      stock: 25,
    },
    {
      name: 'MetroSling Crossbody Bag',
      description:
        'Compact crossbody sling bag with quick-access front pocket, ideal for commuting or light travel.',
      price: 34.99,
      discount: 10,
      category: catId('bags-backpacks'),
      brand: 'MetroSling',
      images: [img('sling-bag', 13)],
      stock: 45,
    },
    {
      name: 'ChronoFit Smartwatch',
      description:
        'Fitness smartwatch with heart-rate monitoring, sleep tracking, GPS, and a 7-day battery life.',
      price: 149.99,
      discount: 20,
      category: catId('watches'),
      brand: 'ChronoFit',
      images: [img('smartwatch', 14), img('smartwatch', 15)],
      stock: 35,
    },
    {
      name: 'Heritage Classic Leather Watch',
      description:
        'Minimalist analog watch with genuine leather strap, stainless steel case, and scratch-resistant glass.',
      price: 99.99,
      discount: 0,
      category: catId('watches'),
      brand: 'Heritage',
      images: [img('leather-watch', 16)],
      stock: 28,
    },
    {
      name: 'PulseGuard Sport Watch',
      description:
        'Rugged sport watch with stopwatch, water resistance to 50m, and a bright backlit display.',
      price: 44.99,
      discount: 10,
      category: catId('watches'),
      brand: 'PulseGuard',
      images: [img('sport-watch', 17)],
      stock: 50,
    },
    {
      name: 'LumaGlow LED Desk Lamp',
      description:
        'Adjustable LED desk lamp with 5 brightness levels, touch controls, and a built-in USB charging port.',
      price: 29.99,
      discount: 5,
      category: catId('home-living'),
      brand: 'LumaGlow',
      images: [img('desk-lamp', 18)],
      stock: 80,
    },
    {
      name: 'HydraFlask Insulated Bottle',
      description:
        'Double-wall vacuum insulated stainless steel bottle, keeps drinks cold for 24 hours or hot for 12.',
      price: 24.99,
      discount: 0,
      category: catId('home-living'),
      brand: 'HydraFlask',
      images: [img('water-bottle', 19)],
      stock: 100,
    },
    {
      name: 'CozyNest Throw Blanket',
      description:
        'Ultra-soft microfiber throw blanket, machine washable, perfect for the couch or bedroom.',
      price: 32.99,
      discount: 10,
      category: catId('home-living'),
      brand: 'CozyNest',
      images: [img('blanket', 20)],
      stock: 40,
    },
  ];

  const products = await Product.insertMany(productsData);

  console.log('Creating users...');
  // Passwords are hashed automatically by the User model's pre-save hook.
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
  });

  const testUser = await User.create({
    name: 'Test User',
    email: 'user@example.com',
    password: 'user1234',
    role: 'user',
  });

  console.log('Creating a sample delivered order for the test user (so they can leave reviews)...');
  const sampleItems = products.slice(0, 3).map((p) => ({
    product: p._id,
    name: p.name,
    image: p.images[0],
    price: p.finalPrice,
    quantity: 1,
  }));
  const itemsPrice = sampleItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  await Order.create({
    user: testUser._id,
    items: sampleItems,
    shippingAddress: {
      street: '221B Baker Street',
      city: 'Ludhiana',
      state: 'Punjab',
      postalCode: '141001',
      country: 'India',
    },
    paymentMethod: 'Cash on Delivery',
    itemsPrice: +itemsPrice.toFixed(2),
    shippingPrice: 0,
    totalPrice: +itemsPrice.toFixed(2),
    status: 'Delivered',
    deliveredAt: new Date(),
  });

  console.log('Creating sample reviews (with AI sentiment analysis applied)...');
  const analyzeSentiment = require('./utils/sentiment');
  const sampleReviews = [
    { comment: 'Absolutely love this product, sound quality is amazing and battery lasts forever!', rating: 5 },
    { comment: 'Decent for the price but not the best I have used.', rating: 3 },
    { comment: 'Terrible experience, stopped working within a week.', rating: 1 },
  ];

  for (let i = 0; i < sampleItems.length; i++) {
    const { score, label } = analyzeSentiment(sampleReviews[i].comment);
    await Review.create({
      user: testUser._id,
      product: sampleItems[i].product,
      rating: sampleReviews[i].rating,
      comment: sampleReviews[i].comment,
      sentimentScore: score,
      sentimentLabel: label,
    });

    const stats = await Review.aggregate([
      { $match: { product: sampleItems[i].product } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    await Product.findByIdAndUpdate(sampleItems[i].product, {
      rating: +stats[0].avgRating.toFixed(1),
      numReviews: stats[0].count,
    });
  }

  console.log('\n✅ Seed complete!');
  console.log(`   ${categories.length} categories, ${products.length} products created.`);
  console.log('\n   Admin login  -> email: admin@example.com | password: admin123');
  console.log('   Test  login  -> email: user@example.com  | password: user1234');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
