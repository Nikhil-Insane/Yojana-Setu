/**
 * ==============================================================================
 * Module: mongodb.js (MongoDB Mongoose Database Connection)
 * Path: backend-node/src/db/mongodb.js
 * 
 * Purpose:
 * Connects to MongoDB Server via Mongoose ODM for:
 * 1. Beneficiary User Profiles (Identity, certificates, digital locker, demographics)
 * 2. Scheme Searches & Recommendation Audit History (Linked to user profiles)
 * ==============================================================================
 */

'use strict';

const mongoose = require('mongoose');

// MongoDB URI from environment or local default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/yojana_setu';

let isConnected = false;

/**
 * connectMongoDB: Establishes connection to MongoDB database
 */
async function connectMongoDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`⚠️ MongoDB Connection Error (${MONGODB_URI}):`, err.message);
    console.warn('   The application will continue operating with fallback storage.');
    return null;
  }
}

// Connection event listeners
mongoose.connection.on('connected', () => {
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.warn('⚠️ MongoDB Runtime Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('ℹ️ MongoDB Disconnected.');
});

module.exports = {
  connectMongoDB,
  mongoose,
  isMongoDBConnected: () => isConnected,
};
