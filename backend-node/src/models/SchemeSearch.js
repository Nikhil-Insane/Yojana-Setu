/**
 * ==============================================================================
 * Model: SchemeSearch (MongoDB Mongoose Schema)
 * Path: backend-node/src/models/SchemeSearch.js
 * 
 * Purpose:
 * Records every scheme recommendation search query performed by beneficiaries,
 * linked directly to their user profile (`userId`). Stores:
 * 1. Demographic & business search parameters.
 * 2. Top-ranked statutory scheme recommendation & match score.
 * 3. Machine Learning (Random Forest) prediction results.
 * 4. Channel partner bank routing details.
 * ==============================================================================
 */

'use strict';

const mongoose = require('mongoose');

const SchemeSearchSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    index: true, 
    default: 'default_beneficiary' 
  },
  userProfile: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UserProfile' 
  },
  applicantInput: {
    name: { type: String, default: 'Applicant' },
    age: { type: Number },
    gender: { type: String },
    category: { type: String },
    annual_family_income: { type: Number },
    state: { type: String },
    district: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    project_cost: { type: Number },
    business_type: { type: String },
    business_description: { type: String },
  },
  ml_recommendation: {
    recommended_scheme: { type: String },
    confidence_score: { type: Number },
    source: { type: String },
    features_used: { type: mongoose.Schema.Types.Mixed },
  },
  topMatch: {
    code: { type: String },
    name: { type: String },
    score: { type: Number },
    interestRate: { type: Number },
    maxLoan: { type: Number },
    subsidyPercent: { type: Number },
    reasons: [{ type: String }],
    failed_rules: [{ type: String }],
  },
  matchesCount: { type: Number, default: 0 },
  topMatchesSummary: [{
    code: String,
    name: String,
    score: Number,
    eligible: Boolean,
  }],
  selectedPartner: {
    name: { type: String },
    type: { type: String },
    distance: { type: Number },
    status: { type: String },
    address: { type: String },
    phone: { type: String },
  },
  searchedAt: { 
    type: Date, 
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
  collection: 'scheme_searches',
});

module.exports = mongoose.models.SchemeSearch || mongoose.model('SchemeSearch', SchemeSearchSchema);
