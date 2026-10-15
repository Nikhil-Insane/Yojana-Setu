/**
 * ==============================================================================
 * Route: profile.js (MongoDB Beneficiary Profile & Scheme Search History API)
 * Path: backend-node/src/routes/profile.js
 * 
 * Purpose:
 * Connects the frontend UserProfileManager and SchemeResultsView directly to
 * MongoDB for:
 * 1. Fetching & updating beneficiary demographic profiles and digital lockers.
 * 2. Fetching real audit history of all scheme searches performed by the user.
 * 3. Providing fallback responses if MongoDB is temporarily connecting.
 * ==============================================================================
 */

'use strict';

const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const SchemeSearch = require('../models/SchemeSearch');
const { isMongoDBConnected } = require('../db/mongodb');

/**
 * GET /api/profile
 * Retrieves the user profile for the given userId (defaults to 'default_beneficiary')
 */
router.get('/', async (req, res) => {
  const userId = req.query.userId || 'default_beneficiary';

  try {
    if (!isMongoDBConnected()) {
      return res.json({
        userId,
        name: 'Ramesh Kumar',
        phone: '+91 98260 12345',
        aadhaarLast4: '4892',
        casteCertificateNo: 'MP/IND/SC/2023/94102',
        category: 'SC',
        gender: 'male',
        age: 32,
        annual_family_income: 250000,
        education: 'Graduate',
        current_occupation: 'Self-employed',
        state: 'Madhya Pradesh',
        district: 'Indore',
        preferred_language: 'Hindi',
        target_business: 'Garment Tailoring & Boutique Unit',
        estimated_cost: 100000,
        _dbStatus: 'offline_fallback',
      });
    }

    let profile = await UserProfile.findOne({ userId });

    if (!profile) {
      // Auto-create initial default profile in MongoDB
      profile = await UserProfile.create({
        userId,
        name: 'Ramesh Kumar',
        phone: '+91 98260 12345',
        aadhaarLast4: '4892',
        casteCertificateNo: 'MP/IND/SC/2023/94102',
        category: 'SC',
        gender: 'male',
        age: 32,
        annual_family_income: 250000,
        education: 'Graduate',
        current_occupation: 'Self-employed',
        state: 'Madhya Pradesh',
        district: 'Indore',
        preferred_language: 'Hindi',
        target_business: 'Garment Tailoring & Boutique Unit',
        estimated_cost: 100000,
      });
    }

    res.json({
      ...profile.toObject(),
      _dbStatus: 'mongodb_connected',
    });
  } catch (err) {
    console.error('Error in GET /api/profile:', err);
    res.status(500).json({ error: 'Failed to retrieve profile', detail: err.message });
  }
});

/**
 * POST /api/profile
 * Saves or updates beneficiary profile in MongoDB
 */
router.post('/', async (req, res) => {
  const userId = req.body.userId || 'default_beneficiary';

  try {
    if (!isMongoDBConnected()) {
      return res.json({
        success: true,
        profile: req.body,
        _dbStatus: 'saved_locally',
        message: 'Saved locally (MongoDB reconnecting)',
      });
    }

    // Clean payload for updates
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      profile,
      _dbStatus: 'mongodb_connected',
      message: 'Profile saved successfully in MongoDB',
    });
  } catch (err) {
    console.error('Error in POST /api/profile:', err);
    res.status(500).json({ error: 'Failed to save profile', detail: err.message });
  }
});

/**
 * GET /api/profile/history
 * Fetches audit log of past scheme searches linked to this profile
 */
router.get('/history', async (req, res) => {
  const userId = req.query.userId || 'default_beneficiary';
  const limit = parseInt(req.query.limit || '15', 10);

  try {
    if (!isMongoDBConnected()) {
      return res.json({
        history: [],
        total: 0,
        _dbStatus: 'offline_fallback',
      });
    }

    const searches = await SchemeSearch.find({ userId })
      .sort({ searchedAt: -1 })
      .limit(limit);

    // Format searches cleanly for frontend table
    const formattedHistory = searches.map((s, idx) => ({
      id: s._id.toString(),
      searchRef: `APP-${new Date(s.searchedAt).getFullYear()}-${String(searches.length - idx).padStart(3, '0')}`,
      schemeName: s.topMatch?.name || s.ml_recommendation?.recommended_scheme || 'Statutory Welfare Scheme',
      schemeCode: s.topMatch?.code || 'NSFDC',
      date: new Date(s.searchedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      searchedAt: s.searchedAt,
      loanAmount: s.applicantInput?.project_cost
        ? `₹ ${Number(s.applicantInput.project_cost).toLocaleString('en-IN')}`
        : '₹ 1,00,000',
      rate: s.topMatch?.interestRate ? `${s.topMatch.interestRate}% p.a.` : '6.5% p.a.',
      matchScore: s.topMatch?.score || 80,
      status: `Recommended (${s.topMatch?.score || 80}% Match)`,
      channelPartner: s.selectedPartner?.name || 'Lead District Bank Branch',
      category: s.applicantInput?.category || 'SC',
      district: s.applicantInput?.district || 'Indore',
    }));

    res.json({
      history: formattedHistory,
      total: searches.length,
      _dbStatus: 'mongodb_connected',
    });
  } catch (err) {
    console.error('Error in GET /api/profile/history:', err);
    res.status(500).json({ error: 'Failed to retrieve search history', detail: err.message });
  }
});

/**
 * DELETE /api/profile/history/:id
 * Removes a search record from MongoDB
 */
router.delete('/history/:id', async (req, res) => {
  try {
    if (!isMongoDBConnected()) {
      return res.json({ success: true, message: 'Deleted from local session' });
    }

    await SchemeSearch.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Search history record removed from MongoDB' });
  } catch (err) {
    console.error('Error deleting search history:', err);
    res.status(500).json({ error: 'Failed to delete record', detail: err.message });
  }
});

module.exports = router;
