/**
 * services/eligibility.js
 * Deterministic hard eligibility evaluation engine.
 * Auditable rule logic without ML hallucination risk.
 *
 * Returns:
 *   { eligible: boolean, score: number, reasons: string[], failed_rules: string[], details: object }
 */

// Enable strict mode in JavaScript for secure variable scoping and catching runtime bugs
'use strict';

/**
 * Normalizes input string by trimming whitespace and converting to lowercase.
 *
 * @param {string} value - Raw string input
 * @returns {string} - Clean lowercase string
 */
function norm(value) {
  // Return trimmed lowercase string, or empty string if input is falsy
  return (value || '').trim().toLowerCase();
}

/**
 * Formats a numerical value as Indian Rupee currency (INR) with commas.
 *
 * @param {number} n - Number to format
 * @returns {string} - Formatted currency string (e.g. ₹1,40,000)
 */
function fmt(n) {
  // Convert number to locale string conforming to Indian numbering system
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

/**
 * Evaluates an applicant profile against a single statutory scheme row.
 *
 * @param {Object} applicant - Validated applicant profile object
 * @param {Object} scheme - Scheme record from SQLite database
 * @returns {Object} - Evaluation result containing eligibility flag, score, audit reasons, and failed rules
 */
function evaluateScheme(applicant, scheme) {
  // Initialize array collecting affirmative audit reasons explaining why rules passed
  const reasons = [];
  // Initialize array collecting failed statutory rules explaining why applicant was disqualified
  const failed  = [];

  // Extract and normalize applicant community category (sc, st, obc, minority, general)
  const appCat     = norm(applicant.category);
  // Extract and normalize scheme beneficiary target group
  const schemeCat  = norm(scheme.beneficiary_category);
  // Extract and normalize applicant gender, defaulting to male if unspecified
  const appGender  = norm(applicant.gender || 'male');
  // Coerce applicant annual family income to numeric value
  const appIncome  = Number(applicant.annual_family_income);
  // Coerce applicant project cost to numeric value
  const appCost    = Number(applicant.project_cost);
  // Extract and normalize applicant business trade sector
  const appBiz     = norm(applicant.business_type);
  // Extract and normalize applicant plain-language business description
  const appDesc    = norm(applicant.business_description || '');
  // Extract scheme statutory identifier code
  const schemeCode = scheme.code || '';
  // Extract official scheme title
  const schemeName = scheme.name || '';
  // Extract scheme description narrative
  const schemeDesc = scheme.description || '';

  // ==============================================================================
  // 1. Category & Gender Target Rule (Affirmative Action Verification)
  // ==============================================================================
  // Initialize boolean flag tracking demographic alignment
  let isCategoryMatch = false;

  // Check if scheme is open to general public (universal schemes with special provisions)
  if (schemeCat === 'general') {
    // Specific check for Stand-Up India Scheme (mandates SC, ST, or Woman entrepreneur)
    if (schemeCode === 'STANDUP-INDIA') {
      // Check if applicant is from SC/ST community or identifies as female
      if (['sc', 'st'].includes(appCat) || ['female', 'woman'].includes(appGender)) {
        // Record affirmative qualification reason for Stand-Up India
        reasons.push('Eligible: Stand-Up India targets SC/ST individuals or Women entrepreneurs.');
        // Set category match flag to true
        isCategoryMatch = true;
      } else {
        // Record failed rule: Stand-Up India excludes non-SC/ST males
        failed.push('Stand-Up India requires the applicant to be SC, ST, or a Woman entrepreneur.');
      }
    // Specific check for Prime Minister's Employment Generation Programme (PMEGP)
    } else if (schemeCode === 'PMEGP') {
      // Check if applicant qualifies for higher Special Category 35% capital subsidy
      if (['sc', 'st', 'obc', 'minority'].includes(appCat) || ['female', 'woman'].includes(appGender)) {
        // Record qualification for maximum 35% subsidy tier
        reasons.push('Eligible: Qualified for PMEGP Special Category 35% maximum subsidy (SC/ST/OBC/Minority/Women).');
      } else {
        // Record qualification for standard General Category 25% subsidy tier
        reasons.push('Eligible: Qualified for PMEGP General Category 25% subsidy.');
      }
      // Set category match flag to true
      isCategoryMatch = true;
    } else {
      // Generic open central scheme (e.g. MUDRA Yojana)
      reasons.push('Scheme is open to all categories and micro-entrepreneurs.');
      // Set category match flag to true
      isCategoryMatch = true;
    }
  // Check direct equality between scheme target community and applicant's category
  } else if (schemeCat === appCat) {
    // Record direct match between applicant community and scheme mandate
    reasons.push(`Applicant category (${applicant.category.toUpperCase()}) matches target group (${scheme.beneficiary_category.toUpperCase()}).`);
    // Set category match flag to true
    isCategoryMatch = true;
  } else {
    // Check specific women empowerment schemes that cross general or community lines
    const womenSchemes = ['NSFDC-MSY', 'NSTFDC-AMES', 'NBCFDC-SWARNIMA'];
    // Check if scheme name/description or code indicates female reservation
    if (norm(schemeName).includes('women') || norm(schemeDesc).includes('female') || womenSchemes.includes(schemeCode)) {
      // Verify applicant is a woman and community matches or scheme is universal
      if (['female', 'woman'].includes(appGender) && (schemeCat === appCat || schemeCat === 'general')) {
        // Record affirmative female qualification reason
        reasons.push(`Applicant qualifies as a Female entrepreneur for ${schemeName}.`);
        // Set category match flag to true
        isCategoryMatch = true;
      } else {
        // Record disqualification reason for gender mismatch
        failed.push(`Scheme is specifically reserved for ${scheme.beneficiary_category.toUpperCase()} female entrepreneurs.`);
      }
    } else {
      // Record disqualification reason for community category mismatch
      failed.push(`Applicant category (${applicant.category.toUpperCase()}) does not match scheme target group (${scheme.beneficiary_category.toUpperCase()}).`);
    }
  }

  // ==============================================================================
  // 2. Household Income Ceiling Rule
  // ==============================================================================
  // Initialize income ceiling variable to null (no ceiling by default)
  let incomeCeiling = null;
  // NSFDC schemes enforce maximum annual family income of Rs. 5,00,000
  if (schemeCode.startsWith('NSFDC')) {
    incomeCeiling = 500000;
  // NSTFDC, NBCFDC, and NMDFC schemes enforce income ceiling of Rs. 3,00,000 (or 8L for minority Virasat)
  } else if (['NSTFDC', 'NBCFDC', 'NMDFC'].some(prefix => schemeCode.startsWith(prefix))) {
    incomeCeiling = 300000;
  }

  // Track if household income condition is satisfied
  let isIncomeOk = true;
  // If scheme enforces a statutory income ceiling
  if (incomeCeiling !== null) {
    // Check if applicant household income is less than or equal to ceiling
    if (appIncome <= incomeCeiling) {
      // Record affirmative audit reason
      reasons.push(`Annual family income (${fmt(appIncome)}) is within the scheme ceiling of ${fmt(incomeCeiling)}.`);
    } else {
      // Record statutory disqualification for exceeding household income limit
      failed.push(`Annual family income (${fmt(appIncome)}) exceeds the scheme ceiling of ${fmt(incomeCeiling)}.`);
      // Mark income check as failed
      isIncomeOk = false;
    }
  } else {
    // Scheme does not enforce an income cap (e.g. MUDRA, Stand-Up India)
    reasons.push('No strict household income ceiling for this central scheme.');
  }

  // ==============================================================================
  // 3. Minimum Project Cost Rule
  // ==============================================================================
  // Extract minimum project cost threshold from scheme row
  const minCost = scheme.min_project_cost;
  // Check if minimum cost threshold is defined in database
  if (minCost !== null && minCost !== undefined) {
    // Check if applicant project cost meets or exceeds the required minimum
    if (appCost >= minCost) {
      // Record affirmative audit reason
      reasons.push(`Project cost (${fmt(appCost)}) meets the minimum required cost of ${fmt(minCost)}.`);
    } else {
      // Record failure: project investment too small for this scheme
      failed.push(`Project cost (${fmt(appCost)}) is below the scheme minimum threshold of ${fmt(minCost)}.`);
    }
  }

  // ==============================================================================
  // 4. Maximum Project Cost Rule
  // ==============================================================================
  // Extract maximum project cost ceiling from scheme row
  const maxCost = scheme.max_project_cost;
  // Check if maximum cost ceiling is defined in database
  if (maxCost !== null && maxCost !== undefined) {
    // Check if applicant project cost is within the allowable ceiling
    if (appCost <= maxCost) {
      // Record affirmative audit reason
      reasons.push(`Project cost (${fmt(appCost)}) is within the maximum limit of ${fmt(maxCost)}.`);
    } else {
      // Record failure: project scale exceeds the statutory ceiling
      failed.push(`Project cost (${fmt(appCost)}) exceeds the maximum scheme ceiling of ${fmt(maxCost)}.`);
    }
  }

  // ==============================================================================
  // 5. Age Eligibility (Legal Adult Borrowing Age >= 18)
  // ==============================================================================
  // Coerce applicant age to number
  const age = Number(applicant.age);
  // Check if applicant is at least 18 years old
  if (age >= 18) {
    // Record affirmative audit reason
    reasons.push('Applicant age (>= 18 years) fulfills legal adult borrowing criteria.');
  } else {
    // Record failure: applicant is underage for commercial credit
    failed.push('Applicant must be at least 18 years of age.');
  }

  // Beneficiary is eligible if zero statutory rules were failed
  const eligible = failed.length === 0;

  // ==============================================================================
  // 6. Multi-Criteria Scoring Algorithm (0 to 100)
  // ==============================================================================
  // Initialize score accumulator
  let score = 0.0;
  // If all statutory conditions passed
  if (eligible) {
    // Award 70 base points for passing all statutory eligibility criteria
    score += 70.0;

    // Sector and business purpose alignment bonus (up to +15 points)
    const purposes = Array.isArray(scheme.purposes) ? scheme.purposes : [];
    // Concatenate eligible scheme activities into lowercase string
    const purposesText = purposes.join(' ').toLowerCase();
    // Split applicant business sector into words
    const bizWords = appBiz.split(/\s+/).filter(w => w.length > 0);
    // Split applicant description into keywords
    const descWords = appDesc.split(/\s+/).filter(w => w.length > 3);
    // Determine whether business sector matches scheme target activities
    const hasAlignment =
      appBiz && purposesText.includes(appBiz) ||
      bizWords.some(w => purposesText.includes(w)) ||
      descWords.some(w => purposesText.includes(w));

    // Award full +15 bonus points for high sector alignment
    if (hasAlignment) {
      score += 15.0;
      reasons.push('High sector alignment: Business type matches scheme target activities.');
    } else {
      // Award partial +5 bonus points for general commercial activities
      score += 5.0;
    }

    // Financing optimal utilization bonus (up to +15 points)
    if (maxCost && maxCost > 0) {
      // Compute ratio of requested cost relative to maximum allowable scheme ceiling
      const ratio = Math.min(appCost / maxCost, 1.0);
      // Award maximum points when project utilizes ~70% of scheme capacity
      score += parseFloat((15.0 * (1.0 - Math.abs(0.70 - ratio))).toFixed(1));
    } else {
      // Award standard +10 bonus points when scheme has no fixed ceiling
      score += 10.0;
    }
  } else {
    // Ineligible schemes receive penalized score: 50 minus 15 points per failed rule
    score = Math.max(0.0, 50.0 - 15.0 * failed.length);
  }

  // Clamp final score to maximum 100.0 and format to 1 decimal place
  score = parseFloat(Math.min(score, 100.0).toFixed(1));

  // Return complete statutory evaluation result dictionary
  return {
    // Boolean eligibility flag
    eligible,
    // Deterministic suitability score (0-100)
    score,
    // List of affirmative reasons
    reasons,
    // List of failed criteria
    failed_rules: failed,
    // Comprehensive scheme financial and contact metadata
    details: {
      max_loan_amount:           scheme.max_loan_amount,
      beneficiary_interest_rate: scheme.beneficiary_interest_rate,
      repayment_years:           scheme.repayment_years,
      moratorium_months:         scheme.moratorium_months,
      channel_partners:          scheme.channel_partners || [],
      required_documents:        scheme.required_documents || [],
      source_url:                scheme.source_url || '',
      provider:                  scheme.provider || 'N/A',
      description:               schemeDesc,
      beneficiary_category:      scheme.beneficiary_category || 'N/A',
    },
  };
}

// Export the deterministic evaluateScheme function for consumption by the matching router
module.exports = { evaluateScheme };
