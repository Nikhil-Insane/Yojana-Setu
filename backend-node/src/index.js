/**
 * index.js
 * Main server file for Yojana Setu Node.js Express backend.
 * Unified on MongoDB for database storage and Google Gemini for plain-language explanation.
 */

'use strict';

// Load environment variables from .env file into process.env at startup
require('dotenv').config();

// Import Express web application framework
const express = require('express');

// Import CORS (Cross-Origin Resource Sharing) middleware to allow frontend requests
const cors = require('cors');

// Import MongoDB database connection and models
const { connectMongoDB, isMongoDBConnected } = require('./db/mongodb');
const Scheme = require('./models/Scheme');

// Import the database seeding function that inserts all 16 statutory schemes into MongoDB
const { seed } = require('./db/seed');

// Import the schemes route handler module
const schemesRouter = require('./routes/schemes');

// Import the multi-criteria matching route handler module
const matchingRouter = require('./routes/matching');

// Import beneficiary profile route handler module
const profileRouter = require('./routes/profile');

// Import direct Google Gemini explanation service
const { explainTopic } = require('./services/gemini');

// Initialize MongoDB connection and seed schemes if collection is empty
connectMongoDB().then(async () => {
  try {
    const count = await Scheme.countDocuments();
    if (count === 0) {
      console.log('📦 MongoDB is empty. Seeding initial 16 statutory schemes...');
      await seed();
    } else {
      console.log(`📦 MongoDB loaded with ${count} statutory schemes.`);
    }
  } catch (err) {
    console.warn('⚠️ MongoDB scheme check error:', err.message);
  }
});

// Initialize the main Express application instance
const app = express();

// Parse the port number from process.env.PORT, defaulting to 8000 if not specified
const PORT = parseInt(process.env.PORT || '8000', 10);

// ==============================================================================
// CORS Configuration: Permit frontend requests from Vite dev server and production
// ==============================================================================
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable automatic JSON body parsing
app.use(express.json());

// ==============================================================================
// HTTP Request Logger Middleware
// ==============================================================================
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl !== '/health') {
      console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ==============================================================================
// Root & Health Check Endpoints
// ==============================================================================
app.get('/', (req, res) => {
  res.json({
    name: 'Yojana Setu API',
    description: 'AI-Driven Scheme Matching for Marginalized Entrepreneurs (Node.js & MongoDB & Gemini)',
    version: '1.0.0',
    database: 'mongodb',
    ai_provider: 'google-gemini',
    endpoints: {
      health: '/health',
      schemes: '/api/schemes',
      analytics: '/api/schemes/analytics',
      matching: '/api/match',
      profile: '/api/profile',
      explain: '/api/explain',
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'yojana-setu-backend',
    version: '1.0.0',
    database: 'mongodb',
    ai_provider: 'google-gemini',
    gemini_configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    mongodb_connected: isMongoDBConnected(),
  });
});

// ==============================================================================
// API Route Registration
// ==============================================================================
// Mount statutory schemes router under /api/schemes (CRUD & analytics)
app.use('/api/schemes', schemesRouter);

// Mount hybrid scheme matching router under /api/match
app.use('/api/match', matchingRouter);

// Mount beneficiary profile and search audit history under /api/profile
app.use('/api/profile', profileRouter);

// Direct Gemini explanation endpoint: Explains any welfare topic or scheme query
app.post('/api/explain', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim().length < 2) {
      return res.status(422).json({ detail: 'topic is required and must be at least 2 characters.' });
    }
    const explanation = await explainTopic(topic.trim());
    res.json({
      topic: topic.trim(),
      explanation,
      provider: 'google-gemini',
    });
  } catch (err) {
    res.status(500).json({ detail: err.message || 'Gemini explanation failed.' });
  }
});

// ==============================================================================
// Error Handling Middleware
// ==============================================================================
app.use((req, res) => {
  res.status(404).json({ detail: `Endpoint not found: ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ detail: err.message || 'Internal server error.' });
});

// ==============================================================================
// Server Listen Execution
// ==============================================================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Yojana Setu Backend running on http://localhost:${PORT}`);
    console.log(`🍃 Database: MongoDB (yojana_setu)`);
    console.log(`🤖 AI Explanation: Google Gemini (${process.env.GEMINI_MODEL || 'gemini-1.5-flash'})`);
    console.log(`📡 Ready for frontend requests from http://localhost:5173`);
    console.log(`====================================================`);
  });
}

module.exports = app;
