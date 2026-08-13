const mongoose = require('mongoose');

// Connects to MongoDB using the URI from environment variables.
// Called once when the server starts (see server.js).
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    // Exit the process if we can't connect to the DB —
    // there's no point running an API that can't reach its database.
    process.exit(1);
  }
}

module.exports = connectDB;
