/**
 * routes/schemes.js
 * Express router handling statutory scheme CRUD operations, search filtering, and analytics
 * backed 100% by MongoDB (Mongoose Scheme model).
 */

'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Scheme = require('../models/Scheme');

// ==============================================================================
// GET /api/schemes: Lists all active schemes with optional query filtering
// ==============================================================================
router.get('/', async (req, res) => {
  try {
    const { category, sector, search } = req.query;

    let schemes = await Scheme.find({ active: true }).lean();

    // Filter by beneficiary category
    if (category) {
      const c = category.trim().toLowerCase();
      schemes = schemes.filter(s =>
        (s.beneficiary_category || '').toLowerCase() === c ||
        (s.beneficiary_category || '').toLowerCase() === 'general'
      );
    }

    // Filter by business sector / purpose
    if (sector) {
      const sec = sector.trim().toLowerCase();
      schemes = schemes.filter(s =>
        (s.purposes || []).some(p => p.toLowerCase().includes(sec))
      );
    }

    // Filter by search keyword across name, code, description, and provider
    if (search) {
      const kw = search.trim().toLowerCase();
      schemes = schemes.filter(s =>
        (s.name || '').toLowerCase().includes(kw) ||
        (s.code || '').toLowerCase().includes(kw) ||
        (s.description || '').toLowerCase().includes(kw) ||
        (s.provider || '').toLowerCase().includes(kw)
      );
    }

    res.json(schemes);
  } catch (err) {
    console.error('Error fetching schemes:', err);
    res.status(500).json({ detail: 'Failed to retrieve schemes from database.' });
  }
});

// ==============================================================================
// GET /api/schemes/analytics: Aggregates dashboard statistics across schemes
// ==============================================================================
router.get('/analytics', async (req, res) => {
  try {
    const schemes = await Scheme.find({ active: true }).lean();

    const communityBreakdown = {};
    let totalFundingCapacity = 0.0;

    for (const s of schemes) {
      const cat = s.beneficiary_category || 'General';
      communityBreakdown[cat] = (communityBreakdown[cat] || 0) + 1;
      totalFundingCapacity += (s.max_loan_amount || 0);
    }

    const ratesOnly = schemes.filter(s => s.beneficiary_interest_rate != null);
    const avgInterest = ratesOnly.length
      ? parseFloat((ratesOnly.reduce((sum, s) => sum + s.beneficiary_interest_rate, 0) / ratesOnly.length).toFixed(2))
      : 0;

    const uniqueProviders = new Set(schemes.map(s => s.provider).filter(Boolean));

    res.json({
      total_schemes:         schemes.length,
      community_breakdown:   communityBreakdown,
      total_max_loan_pool:   totalFundingCapacity,
      average_interest_rate: avgInterest,
      providers_count:       uniqueProviders.size,
    });
  } catch (err) {
    console.error('Error computing schemes analytics:', err);
    res.status(500).json({ detail: 'Failed to compute analytics.' });
  }
});

// ==============================================================================
// GET /api/schemes/:id: Retrieves a single statutory scheme by ID or Code
// ==============================================================================
router.get('/:id', async (req, res) => {
  try {
    const param = req.params.id;
    let scheme = null;

    if (mongoose.Types.ObjectId.isValid(param)) {
      scheme = await Scheme.findById(param).lean();
    }
    if (!scheme) {
      scheme = await Scheme.findOne({ code: param, active: true }).lean();
    }

    if (!scheme) {
      return res.status(404).json({ detail: 'Scheme not found.' });
    }

    res.json(scheme);
  } catch (err) {
    console.error('Error retrieving scheme:', err);
    res.status(500).json({ detail: 'Failed to retrieve scheme.' });
  }
});

// ==============================================================================
// POST /api/schemes: Creates a new statutory scheme in MongoDB (Admin)
// ==============================================================================
router.post('/', async (req, res) => {
  try {
    const required = ['code', 'name', 'provider', 'description', 'beneficiary_category'];
    for (const field of required) {
      if (!req.body[field]) {
        return res.status(422).json({ detail: `Missing required field: ${field}` });
      }
    }

    const existing = await Scheme.findOne({ code: req.body.code });
    if (existing) {
      return res.status(400).json({ detail: 'Scheme code already exists.' });
    }

    const created = await Scheme.create({
      code: req.body.code,
      name: req.body.name,
      provider: req.body.provider,
      description: req.body.description,
      beneficiary_category: req.body.beneficiary_category,
      min_project_cost: req.body.min_project_cost ?? null,
      max_project_cost: req.body.max_project_cost ?? null,
      max_loan_amount: req.body.max_loan_amount ?? null,
      beneficiary_interest_rate: req.body.beneficiary_interest_rate ?? null,
      repayment_years: req.body.repayment_years ?? null,
      moratorium_months: req.body.moratorium_months ?? null,
      channel_partners: req.body.channel_partners || [],
      purposes: req.body.purposes || [],
      required_documents: req.body.required_documents || [],
      eligibility_rules: req.body.eligibility_rules || [],
      source_url: req.body.source_url || '',
      active: true,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating scheme:', err);
    res.status(500).json({ detail: err.message || 'Failed to create scheme.' });
  }
});

module.exports = router;
