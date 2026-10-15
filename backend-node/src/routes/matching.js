/**
 * routes/matching.js
 * Express route handler for POST /api/match.
 * Orchestrates deterministic statutory eligibility, TF-IDF semantic scoring,
 * and calls the Python FastAPI Random Forest ML recommendation engine.
 */

// Enable ECMAScript strict mode to enforce safer coding practices and prevent silent variable leaks
'use strict';

// Import Express framework to create HTTP route handlers
const express = require('express');

// Initialize a modular Express router instance for matching routes
const router  = express.Router();

// Import Scheme model for MongoDB database
const Scheme = require('../models/Scheme');

// Import Gemini direct explanation service
const { explainScheme } = require('../services/gemini');

// Import deterministic statutory rule engine that checks caste, age, income ceilings, and loan caps
const { evaluateScheme } = require('../services/eligibility');

// Import TF-IDF semantic scoring function to compute text similarity between applicant business and scheme goals
const { schemeSemanticScores } = require('../ai/retriever');

// Import Random Forest prediction client that connects via HTTP to the Python FastAPI microservice
const { predictRandomForest } = require('../services/randomForest');

// Import MongoDB Mongoose models and connection checker
const UserProfile = require('../models/UserProfile');
const SchemeSearch = require('../models/SchemeSearch');
const { isMongoDBConnected } = require('../db/mongodb');

// ==============================================================================
// Validation Helper Function: Ensures all statutory input parameters are present
// ==============================================================================
// Declare validation function that inspects the incoming JSON request body
function validateApplicant(body) {
  // Initialize an empty array to collect error messages
  const errors = [];
  // Define required fields without which eligibility cannot be assessed
  const required = ['name', 'age', 'gender', 'category', 'annual_family_income', 'project_cost', 'business_type'];

  // Iterate over each required attribute
  for (const f of required) {
    // Check if the property is undefined, null, or empty string
    if (body[f] === undefined || body[f] === null || body[f] === '') {
      // Append descriptive validation error message
      errors.push(`Missing required field: ${f}`);
    }
  }

  // If no missing fields exist, proceed to check data types for numerical values
  if (!errors.length) {
    // Ensure age can be converted to a valid number
    if (isNaN(Number(body.age))) errors.push('age must be a number');
    // Ensure annual family income can be converted to a valid number
    if (isNaN(Number(body.annual_family_income))) errors.push('annual_family_income must be a number');
    // Ensure project cost can be converted to a valid number
    if (isNaN(Number(body.project_cost))) errors.push('project_cost must be a number');
  }

  // Return the array of accumulated error messages (empty array means valid)
  return errors;
}

// ==============================================================================
// POST /api/match: Main Endpoint for Matching Beneficiaries to Schemes
// ==============================================================================
// Register POST route handler on root path of matching router
router.post('/', async (req, res) => {
  // Run validation on the incoming request body
  const errors = validateApplicant(req.body);
  // If validation failed, respond immediately with HTTP 422 Unprocessable Entity
  if (errors.length) {
    // Return structured JSON error listing all failed validations
    return res.status(422).json({ detail: errors.join('; ') });
  }

  // Normalize applicant input attributes into clean, typed object
  const applicant = {
    // Beneficiary full name
    name:                 req.body.name,
    // Cast age to JavaScript Number
    age:                  Number(req.body.age),
    // Beneficiary gender (Female, Male, Other)
    gender:               req.body.gender,
    // Social caste/community category (SC, ST, OBC, Minority, General)
    category:             req.body.category,
    // Annual household income in Indian Rupees (INR)
    annual_family_income: Number(req.body.annual_family_income),
    // Beneficiary state of residence (or empty string fallback)
    state:                req.body.state || '',
    // Beneficiary district of residence (or empty string fallback)
    district:             req.body.district || '',
    // Total capital investment required for the business
    project_cost:         Number(req.body.project_cost),
    // Sector or nature of commercial enterprise
    business_type:        req.body.business_type,
    // Detailed plain-language description of intended business
    business_description: req.body.business_description || '',
  };

  // Fetch all active statutory schemes from MongoDB
  const schemes = await Scheme.find({ active: true }).lean();

  // Concatenate business sector and narrative text for semantic matching
  const queryText = `${applicant.business_type} ${applicant.business_description}`.trim();
  // Compute TF-IDF semantic relevance scores for all schemes against the query text
  const semanticMap = schemeSemanticScores(queryText, schemes);

  // Initialize array to hold evaluated matching results for every scheme
  const matches = [];

  // Iterate through all schemes in the statutory database
  for (const scheme of schemes) {
    // Run deterministic hard qualification rules (checks caste, income ceiling, age, project limits)
    const ruleResult    = evaluateScheme(applicant, scheme);
    // Retrieve pre-computed TF-IDF semantic similarity score for this scheme code (0.0 to 1.0)
    const semanticScore = semanticMap[scheme.code] || 0.0;

    // Declare variable to store the final combined multi-criteria score
    let combined;
    // Check if applicant passed all statutory legal requirements for this scheme
    if (ruleResult.eligible) {
      // Calculate Hybrid Score: 70% deterministic rule fit + 30% semantic business alignment
      combined = parseFloat(((ruleResult.score * 0.70) + (semanticScore * 100 * 0.30)).toFixed(1));
    } else {
      // Ineligible schemes keep their penalized rule score without receiving semantic boost
      combined = parseFloat(ruleResult.score.toFixed(1));
    }

    // Append structured match evaluation object into matches collection
    matches.push({
      // Database primary key ID
      scheme_id:   scheme._id ? scheme._id.toString() : scheme.code,
      // Statutory scheme code identifier
      code:        scheme.code,
      // Full official name of the scheme
      name:        scheme.name,
      // Boolean qualification flag (true = qualified, false = disqualified)
      eligible:    ruleResult.eligible,
      // Combined hybrid score (0 to 100)
      score:       combined,
      // Array of affirmative audit reasons explaining why applicant qualified
      reasons:     [
        ...ruleResult.reasons,
        `Semantic relevance: ${(semanticScore * 100).toFixed(1)}%`,
      ],
      // Array of specific statutory rules failed by applicant (if any)
      failed_rules: ruleResult.failed_rules,
      // Deep scheme financial parameters and ranking metadata
      details: {
        ...ruleResult.details,
        // Semantic score formatted to 4 decimal points
        semantic_score:   parseFloat(semanticScore.toFixed(4)),
        // Explicit label of mathematical ranking method for complete transparency
        ranking_method:   '70% rule-fit + 30% semantic relevance for eligible schemes',
      },
    });
  }

  // Sort matching results: eligible schemes always first, then by combined score descending
  matches.sort((a, b) => {
    // Primary sort: if eligibility differs, place eligible (true = 1) before ineligible (false = 0)
    if (a.eligible !== b.eligible) return b.eligible - a.eligible;
    // Secondary sort: rank by numerical score descending
    return b.score - a.score;
  });

  // Call Google Gemini directly to explain why the top scheme fits this applicant
  let geminiExplanation = null;
  if (matches.length > 0) {
    try {
      const topSchemeDoc = schemes.find(s => s.code === matches[0].code) || schemes[0];
      geminiExplanation = await explainScheme(topSchemeDoc, applicant);
      matches[0].explanation_en = geminiExplanation.explanation_en;
      matches[0].explanation_hi = geminiExplanation.explanation_hi;
    } catch (gErr) {
      console.warn('Gemini explanation note:', gErr.message);
    }
  }

  // Call the Python FastAPI Random Forest microservice via HTTP to get Machine Learning recommendation
  const mlRecommendation = await predictRandomForest(applicant);

  // ---------------------------------------------------------------------------
  // MongoDB Persistence: Automatically save scheme search audit record & link to profile
  // ---------------------------------------------------------------------------
  let savedSearchId = null;
  if (isMongoDBConnected()) {
    try {
      const userId = req.body.userId || 'default_beneficiary';

      // 1. Find or update the beneficiary UserProfile in MongoDB
      const userProfile = await UserProfile.findOneAndUpdate(
        { userId },
        {
          $set: {
            name: applicant.name,
            age: applicant.age,
            gender: applicant.gender,
            category: applicant.category,
            annual_family_income: applicant.annual_family_income,
            state: applicant.state,
            district: applicant.district,
            latitude: req.body.latitude || null,
            longitude: req.body.longitude || null,
            target_business: applicant.business_type,
            estimated_cost: applicant.project_cost,
            business_description: applicant.business_description,
          }
        },
        { upsert: true, returnDocument: 'after' }
      );

      // 2. Extract top recommendation details
      const topMatch = matches[0];

      // 3. Insert linked SchemeSearch document
      const searchDoc = await SchemeSearch.create({
        userId,
        userProfile: userProfile?._id,
        applicantInput: {
          ...applicant,
          latitude: req.body.latitude || null,
          longitude: req.body.longitude || null,
        },
        ml_recommendation: {
          recommended_scheme: mlRecommendation?.prediction || mlRecommendation?.recommended_scheme || topMatch?.name,
          confidence_score: mlRecommendation?.confidence || topMatch?.score || 80,
          source: mlRecommendation?.source || 'random_forest_fastapi',
          features_used: mlRecommendation?.features_used || null,
        },
        topMatch: topMatch ? {
          code: topMatch.code,
          name: topMatch.name,
          score: topMatch.score,
          interestRate: topMatch.details?.beneficiary_interest_rate || 6.5,
          maxLoan: topMatch.details?.max_loan_amount || 140000,
          subsidyPercent: 33,
          reasons: topMatch.reasons || [],
          failed_rules: topMatch.failed_rules || [],
        } : null,
        matchesCount: matches.length,
        topMatchesSummary: matches.slice(0, 5).map(m => ({
          code: m.code,
          name: m.name,
          score: m.score,
          eligible: m.eligible,
        })),
        selectedPartner: {
          name: req.body.channel_partner || 'Punjab National Bank (Lead District Branch)',
          type: 'Lead Public Sector Bank',
          distance: 2.4,
          status: 'Eligible',
          address: `${applicant.district || 'Indore'}, ${applicant.state || 'Madhya Pradesh'}`,
        },
      });

      savedSearchId = searchDoc._id.toString();
    } catch (dbErr) {
      console.warn('⚠️ Could not save search record to MongoDB:', dbErr.message);
    }
  }

  // Send complete JSON response back to the React frontend
  res.json({
    // Echo normalized applicant profile
    applicant,
    // Attach Machine Learning Random Forest prediction, confidence, and driving factors
    ml_recommendation: mlRecommendation,
    // Attach plain-language Gemini explanation
    gemini_explanation: geminiExplanation,
    // Attach array of statutory scheme evaluations sorted by suitability
    matches,
    // MongoDB search audit reference
    search_id: savedSearchId,
    db_persisted: !!savedSearchId,
  });
});

// Export the router module to be mounted in the main Express application
module.exports = router;
