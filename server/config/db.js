const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://pranavag1420_db_user:pranavag1420_db_user@ac-iyzh2hc-shard-00-00.y41frvu.mongodb.net:27017,ac-iyzh2hc-shard-00-01.y41frvu.mongodb.net:27017,ac-iyzh2hc-shard-00-02.y41frvu.mongodb.net:27017/?ssl=true&replicaSet=atlas-f8a2qf-shard-0&authSource=admin&appName=Cluster0";
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
