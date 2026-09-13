// One-time script to populate the database with realistic demo data:
// categories, products, an admin user, and a regular test user.
// Run with: npm run seed
//
// Product photos are served straight from the client's static assets
// folder (client/public/assets/products-images/p_img1.png ... p_img52.png),
// so every seeded product simply points at one of those pre-bundled
// images by number — no external image host or upload step required.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Review = require('./models/Review');

function assetImage(imageNumberOrName) {
  const fileName = typeof imageNumberOrName === 'number' ? `p_img${imageNumberOrName}` : imageNumberOrName;
  return `/assets/products-images/${fileName}.png`;
}

function inrPrice(amount) {
  return Number((Number(amount) * 83).toFixed(2));
}

const categoriesData = [
  { name: 'Women', slug: 'women' },
  { name: 'Men', slug: 'men' },
  { name: 'Kids', slug: 'kids' },
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
      name: 'Women Round Neck Cotton Top',
      description: 'A lightweight cotton top with a classic round neckline, soft feel, and easy everyday fit.',
      price: 100,
      discount: 5,
      category: catId('women'),
      brand: 'LOOM',
      images: [assetImage('p_img1')],
      stock: 40,
    },
    {
      name: 'Men Round Neck Pure Cotton T-shirt',
      description: 'Premium cotton tee with a relaxed fit, soft texture, and everyday comfort for casual wear.',
      price: 200,
      discount: 10,
      category: catId('men'),
      brand: 'LOOM',
      images: [
        assetImage('p_img2_1'),
        assetImage('p_img2_2'),
        assetImage('p_img2_3'),
        assetImage('p_img2_4'),
      ],
      stock: 60,
    },
    {
      name: 'Girls Round Neck Cotton Top',
      description: 'Soft and breathable cotton top designed for all-day comfort and easy movement.',
      price: 220,
      discount: 8,
      category: catId('kids'),
      brand: 'LOOM',
      images: [assetImage('p_img3')],
      stock: 35,
    },
    {
      name: 'Men Tapered Fit Flat-Front Trousers',
      description: 'Tailored trousers with a tapered fit, soft touch, and refined look for smart casual wear.',
      price: 190,
      discount: 12,
      category: catId('men'),
      brand: 'LOOM',
      images: [assetImage('p_img7')],
      stock: 30,
    },
    {
      name: 'Boy Round Neck Pure Cotton T-shirt',
      description: 'A soft and comfortable boy’s tee with a classic casual fit and easy wear.',
      price: 160,
      discount: 6,
      category: catId('kids'),
      brand: 'LOOM',
      images: [assetImage('p_img14')],
      stock: 39,
    },
    {
      name: 'Women Palazzo Pants with Waist Belt',
      description: 'Relaxed fit palazzo pants with a waist belt and an easy-flowing silhouette for comfort.',
      price: 190,
      discount: 12,
      category: catId('women'),
      brand: 'LOOM',
      images: [assetImage('p_img20')],
      stock: 27,
    },
    {
      name: 'Women Zip-Front Relaxed Fit Jacket',
      description: 'A relaxed zip-front jacket designed for layering with a polished casual finish.',
      price: 170,
      discount: 15,
      category: catId('women'),
      brand: 'LOOM',
      images: [assetImage('p_img21')],
      stock: 24,
    },
    {
      name: 'Men Round Neck Pure Cotton T-shirt',
      description: 'Everyday cotton t-shirt with a clean finish, breathable fabric, and a polished casual feel.',
      price: 140,
      discount: 5,
      category: catId('men'),
      brand: 'LOOM',
      images: [assetImage('p_img8')],
      stock: 50,
    },
    {
      name: 'Girls Round Neck Cotton Top',
      description: 'Lightweight girls top with a comfortable cotton feel and a flattering everyday fit.',
      price: 140,
      discount: 0,
      category: catId('kids'),
      brand: 'LOOM',
      images: [assetImage('p_img6')],
      stock: 42,
    },
    {
      name: 'Men Round Neck Pure Cotton T-shirt',
      description: 'Classic tee in pure cotton for a clean silhouette and a comfortable casual everyday look.',
      price: 110,
      discount: 5,
      category: catId('men'),
      brand: 'LOOM',
      images: [assetImage('p_img4')],
      stock: 55,
    },
    {
      name: 'Women Round Neck Cotton Top',
      description: 'A soft, breathable cotton top made for daily wear with a modern, easy fit.',
      price: 130,
      discount: 10,
      category: catId('women'),
      brand: 'LOOM',
      images: [assetImage('p_img5')],
      stock: 48,
    },
    {
      name: 'Boy Round Neck Pure Cotton T-shirt',
      description: 'Simple cotton essentials with breathable comfort and a neat, everyday silhouette.',
      price: 120,
      discount: 0,
      category: catId('kids'),
      brand: 'LOOM',
      images: [assetImage('p_img11')],
      stock: 62,
    },
    {
      name: 'Girls Round Neck Cotton Top',
      description: 'Cute and lightweight cotton top built for comfort, movement, and easy styling.',
      price: 100,
      discount: 0,
      category: catId('kids'),
      brand: 'LOOM',
      images: [assetImage('p_img9')],
      stock: 58,
    },
    {
      name: 'Men Tapered Fit Flat-Front Trousers',
      description: 'Minimal, versatile trousers that pair effortlessly with basic tees and shirts.',
      price: 110,
      discount: 10,
      category: catId('men'),
      brand: 'LOOM',
      images: [assetImage('p_img10')],
      stock: 44,
    },
    {
      name: 'Women Round Neck Cotton Top',
      description: 'Comfortable everyday top with a flattering fit and a breathable cotton feel.',
      price: 130,
      discount: 10,
      category: catId('women'),
      brand: 'LOOM',
      images: [assetImage('p_img13')],
      stock: 46,
    },
    {
      name: 'Men Round Neck Pure Cotton T-shirt',
      description: 'A staple casual tee made from breathable cotton for all-day comfort and simplicity.',
      price: 150,
      discount: 8,
      category: catId('men'),
      brand: 'Forever',
      images: [assetImage('p_img12')],
      stock: 51,
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
