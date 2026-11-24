const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = (process.env.MONGO_URI || '').trim();
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      throw new Error(
        'Invalid MONGO_URI scheme: expected connection string to start with "mongodb://" or "mongodb+srv://"'
      );
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
