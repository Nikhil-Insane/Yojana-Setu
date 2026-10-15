/**
 * ==============================================================================
 * Model: Scheme (MongoDB Mongoose Schema)
 * Path: backend-node/src/models/Scheme.js
 * 
 * Purpose:
 * Stores statutory government welfare and concessional credit schemes in MongoDB.
 * Native document arrays for channel partners, purposes, documents, and rules.
 * ==============================================================================
 */

'use strict';

const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    beneficiary_category: {
      type: String,
      required: true,
      index: true,
    },
    min_project_cost: {
      type: Number,
      default: null,
    },
    max_project_cost: {
      type: Number,
      default: null,
    },
    max_loan_amount: {
      type: Number,
      default: null,
    },
    beneficiary_interest_rate: {
      type: Number,
      default: null,
    },
    repayment_years: {
      type: Number,
      default: null,
    },
    moratorium_months: {
      type: Number,
      default: null,
    },
    channel_partners: {
      type: [String],
      default: [],
    },
    purposes: {
      type: [String],
      default: [],
    },
    required_documents: {
      type: [String],
      default: [],
    },
    eligibility_rules: {
      type: [String],
      default: [],
    },
    source_url: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Scheme', SchemeSchema);
