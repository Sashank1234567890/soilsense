const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/soilsense_pro_db?replicaSet=rs0';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log(`[SoilSense-Pro DB] Connected to: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`[SoilSense-Pro DB Error] Connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
