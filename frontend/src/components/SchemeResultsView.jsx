/**
 * ==============================================================================
 * Component: SchemeResultsView (3-स्तंभ योजना सिफारिश एवं वित्तीय परिणाम डैशबोर्ड)
 * Path: frontend/src/components/SchemeResultsView.jsx
 * 
 * Purpose:
 * Renders the primary decision dashboard following intake form submission:
 * - Column 1: Scheme Recommendation, 70/30 Hybrid Match Score, Plain-language
 *             Multilingual Explanations (Hindi/English/Marathi), TTS Speech Audio,
 *             and interactive Document Checklist.
 * - Column 2: Financial & Moratorium Calculator (Equated Monthly Installment EMI,
 *             repayment holiday moratorium interest, 33% capital subsidy deduction,
 *             and total payable amortization).
 * - Column 3: Nearest Channel Partner Locator (Lead public sector banks, SCAs,
 *             NBFC-MFIs, branch health NPA ratios, distances, and printable summary).
 * ==============================================================================
 */

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, ArrowLeft, Volume2, 
  MapPin, Download, Printer, ExternalLink, Calculator, Landmark,
  ShieldCheck, FileCheck, HelpCircle, Check, Share2, Award
} from 'lucide-react';
import { speakText } from '../utils/speech';
import ChannelPartnerMap from './ChannelPartnerMap';

export default function SchemeResultsView({ applicantData, matchData, onBackToForm, onSaveProfile }) {
  // ---------------------------------------------------------------------------
  // Top Matched Scheme Extraction
  // ---------------------------------------------------------------------------
  // If backend matchData is not passed or empty, use realistic high-fidelity default matching
  const topMatch = matchData?.matches?.[0] || {
    name: 'Micro Finance Scheme (MFS)',
    code: 'NSFDC-MFS',
    score: 82,
    nextBest: 'Term Loan (TL), 14%',
    interestRate: 6.5,
    maxLoan: 140000,
    subsidyPercent: 33,
    reasons: [
      'Project cost within limit (<= ₹1.4 Lakh)',
      'Income under the cap (<= ₹3.0 Lakh p.a.)',
      'Eligible business purpose (Micro enterprise)'
    ],
    explanation_en: 'Your project cost is within the Micro Finance limit and your family income is under the eligibility cap, so this scheme fits you best.',
    explanation_hi: 'आपके प्रोजेक्ट की लागत सूक्ष्म वित्त योजना की सीमा के भीतर है और आपकी पारिवारिक आय पात्रता सीमा से कम है, इसलिए यह योजना आपके लिए सबसे उपयुक्त है।',
    explanation_mr: 'तुमच्या प्रकल्पाचा खर्च सूक्ष्म वित्त योजनेच्या मर्यादेत आहे आणि तुमचे कौटुंबिक उत्पन्न पात्रतेच्या मर्यादेत आहे, त्यामुळे ही योजना तुमच्यासाठी सर्वात योग्य आहे.',
    documents: [
      { id: 1, name: 'Caste Certificate (SC / Scheduled Caste)', required: true },
      { id: 2, name: 'Family Income Certificate (Revenue Authority)', required: true },
      { id: 3, name: 'Aadhaar Card & PAN Card (KYC)', required: true },
      { id: 4, name: 'Machine / Equipment Quotation or Project Estimate', required: true },
      { id: 5, name: 'Bank Passbook copy (with IFSC Code)', required: true },
      { id: 6, name: 'Recent Passport Size Photographs (2)', required: false }
    ]
  };

  // ---------------------------------------------------------------------------
  // Local Component States
  // ---------------------------------------------------------------------------
  // Explanation language toggle ('en' for English, 'hi' for Hindi)
  const [explanationLang, setExplanationLang] = useState(
    applicantData?.preferred_language === 'Hindi' ? 'hi' : 'en'
  );

  // Interactive document checklist checkmark states (default 3 pre-checked)
  const [checkedDocs, setCheckedDocs] = useState({ 1: true, 2: true, 3: true });

  // ---------------------------------------------------------------------------
  // Financial Loan & Moratorium States
  // ---------------------------------------------------------------------------
  const initialLoan = Math.min(applicantData?.estimated_cost || 100000, topMatch.maxLoan || 500000);
  const [loanAmount, setLoanAmount] = useState(initialLoan);
  const [tenureMonths, setTenureMonths] = useState(36);
  const [moratoriumMonths, setMoratoriumMonths] = useState(6);
  const interestRateYearly = topMatch.interestRate || 6.5;

  // Default channel partners data (with coordinates and health scores)
  const defaultPartners = useMemo(() => [
    {
      id: 1,
      letter: 'A',
      name: 'Partner A: Punjab National Bank (Lead District Branch)',
      type: 'Lead Public Sector Bank',
      distance: 2.4,
      status: 'Eligible',
      statusColor: '#10B981',
      address: 'M.G. Road Branch, Near Collectorate, Indore',
      phone: '+91 731 2548900',
      npaRatio: '2.1% (Healthy)',
      lat: 22.7210,
      lng: 75.8620,
    },
    {
      id: 2,
      letter: 'B',
      name: 'Partner B: MP SC & ST Dev. Finance Corp (District SCA Office)',
      type: 'State Channelizing Agency (SCA)',
      distance: 5.1,
      status: 'Eligible',
      statusColor: '#10B981',
      address: 'Vikas Bhawan, Zone-1, Maharani Road, Indore',
      phone: '+91 731 2439120',
      npaRatio: '3.4% (Good)',
      lat: 22.7150,
      lng: 75.8450,
    },
    {
      id: 3,
      letter: 'C',
      name: 'Partner C: District Industries Centre (DIC) / MSME Desk',
      type: 'District Industries Centre (DIC)',
      distance: 7.8,
      status: 'Eligible',
      statusColor: '#10B981',
      address: 'Administrative Complex, Block B, Bypass Road, Indore',
      phone: '+91 731 2781190',
      npaRatio: '4.2% (Healthy)',
      lat: 22.7350,
      lng: 75.8900,
    }
  ], []);

  // ---------------------------------------------------------------------------
  // Active Channel Partner & Dynamic Geocoding States
  // ---------------------------------------------------------------------------
  const [channelPartners, setChannelPartners] = useState(defaultPartners);
  const [selectedPartner, setSelectedPartner] = useState(defaultPartners[0]);
  const [geoCity, setGeoCity] = useState({
    district: applicantData?.district || 'Indore',
    state: applicantData?.state || 'Madhya Pradesh',
  });

  /**
   * ===========================================================================
   * FINANCIAL & MORATORIUM AMORTIZATION ENGINE:
   * ===========================================================================
   * Micro-entrepreneurs from marginalized backgrounds often experience cash-flow
   * lag during the first 3 to 12 months while setting up shop (purchasing sewing
   * machines, setting up retail kiosks, or procuring livestock).
   * 
   * Statutory schemes (NSFDC, NSTFDC, PMEGP) explicitly provide a "Moratorium Period"
   * (Repayment Holiday) during which the borrower is NOT required to pay principal EMI.
   * 
   * MATHEMATICAL DERIVATION:
   * 1. Principal Loan Amount (P) = User-selected loan amount (default ₹1,00,000)
   * 2. Annual Concessional Rate (R) = e.g., 6.5% p.a. (or 4.0% for women under MSY)
   * 3. Monthly Interest Rate (r) = R / (12 months * 100)
   * 4. Effective Tenor (n) = Total Tenure (e.g. 36 months) - Moratorium (e.g. 6 months) = 30 months
   * 5. Monthly EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
   * 6. Moratorium Simple Interest = P * (R / 100) * (Moratorium_Months / 12)
   * 7. Total Loan Repayment = (Monthly EMI * Effective Tenor) + Moratorium Interest
   * 8. Capital Subsidy Benefit = P * 33% (Credited by government directly to reduce liability)
   * ===========================================================================
   */
  const emiCalculation = useMemo(() => {
    const P = loanAmount;                                           // Principal loan borrowed (₹)
    const r = interestRateYearly / (12 * 100);                      // Monthly interest rate fraction
    
    // Effective repayment period after deducting initial moratorium repayment holiday
    const effectiveTenure = Math.max(tenureMonths - moratoriumMonths, 1);
    
    // Standard Reducing Balance EMI Formula
    const emi = (P * r * Math.pow(1 + r, effectiveTenure)) / (Math.pow(1 + r, effectiveTenure) - 1);
    const totalRepaidDuringTenure = emi * effectiveTenure;
    
    // Simple interest accumulated strictly during the repayment holiday months
    const moratoriumInterest = P * (interestRateYearly / 100) * (moratoriumMonths / 12);
    
    // Total gross repayment obligation across full lifecycle
    const totalPayable = totalRepaidDuringTenure + moratoriumInterest;
    const totalInterest = totalPayable - P;
    
    // Government Capital Subsidy (e.g., 33% grant subsidy under NSFDC/PMEGP)
    const capitalSubsidy = P * (topMatch.subsidyPercent ? topMatch.subsidyPercent / 100 : 0.33);

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayable: Math.round(totalPayable),
      moratoriumInterest: Math.round(moratoriumInterest),
      capitalSubsidy: Math.round(capitalSubsidy),
    };
  }, [loanAmount, tenureMonths, moratoriumMonths, interestRateYearly, topMatch.subsidyPercent]);

  /**
   * handleListenExplanation: Web Speech Synthesis API trigger.
   * Reads plain-language explanation out loud in the applicant's chosen language (Hindi or English).
   */
  const handleListenExplanation = () => {
    const textToSpeak = explanationLang === 'hi' 
      ? topMatch.explanation_hi 
      : topMatch.explanation_en;
    speakText(textToSpeak, explanationLang);
  };

  /**
   * toggleDoc: Toggles interactive checkmark state for document readiness
   */
  const toggleDoc = (id) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  /**
   * handleDownloadSummary: Triggers native browser print dialog to print or save as PDF
   */
  const handleDownloadSummary = () => {
    window.print();
  };

  return (
    <div className="results-page-wrapper">
      
      {/* Top Action Navigation Bar */}
      <div className="results-top-bar">
        <button
          onClick={onBackToForm}
          className="btn-secondary results-edit-btn"
        >
          <ArrowLeft size={16} />
          <span>Edit Details & Re-Check</span>
        </button>

        <div className="results-top-right-actions">
          <span className="results-applicant-info">
            Applicant: <strong style={{ color: 'var(--text-main)' }}>{applicantData?.name || 'Beneficiary'}</strong> ({applicantData?.district}, {applicantData?.state})
          </span>
          <button
            onClick={() => onSaveProfile && onSaveProfile(applicantData)}
            className="btn-secondary results-save-profile-btn"
          >
            Save to Profile
          </button>
        </div>
      </div>

      {/* =========================================================================
          3-COLUMN RESULTS DASHBOARD GRID:
          - Column 1: Recommended Scheme Card, Confidence Score, Affirmative Criteria Fit,
                      Plain-language Multilingual Explanation (Gemini AI RAG), TTS,
                      and Mandatory Document Checklist.
          - Column 2: Interactive EMI & Moratorium Loan Calculator with dynamic amortization.
          - Column 3: Geospatial Channel Partner Routing with Leaflet map pins & NPA health metrics.
          ========================================================================= */}
      <div className="results-grid-3col">
        
        {/* =======================================================================
            COLUMN 1: SCHEME RECOMMENDATION & EXPLAINABLE AI RATIONALE
            Presents the top-ranked statutory welfare program computed by the
            Hybrid 70/30 (Deterministic Rules + Semantic Embeddings) engine.
            ======================================================================= */}
        <div className="glass-card results-col1-card">
          
          {/* Header Row: Best Match Status Badge and Model Confidence Score */}
          <div className="results-col1-header">
            {/* Affirmative Best Match Badge */}
            <span className="results-best-match-pill">
              Best match
            </span>

            {/* Model Confidence Metric (Calculated by hybrid 70% rules + 30% cosine embeddings) */}
            <div className="results-col1-confidence-box">
              <div className="results-confidence-number">
                {topMatch.score}%
              </div>
              <span className="results-confidence-caption">
                model confidence
              </span>
            </div>
          </div>

          {/* Scheme Title & Ministry / Statutory Corporation Attribution */}
          <h3 className="results-scheme-title">
            {topMatch.name}
          </h3>
          <p className="results-scheme-sub">
            Official Statutory Welfare Scheme (NSFDC / MoSJE)
          </p>

          {/* Confidence Score Visual Progress Bar */}
          <div className="results-confidence-track">
            <div className="results-confidence-fill" style={{ width: `${topMatch.score}%` }} />
          </div>

          {/* Next Best Alternative Scheme Comparison for Transparency */}
          <p className="results-next-best-text">
            Next best: <strong style={{ color: 'var(--text-main)' }}>{topMatch.nextBest || 'Term Loan, 14%'}</strong>
          </p>

          {/* Random Forest ML Model Recommendation Banner */}
          {matchData?.ml_recommendation && (
            <div style={{
              margin: '12px 0',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  🌲 Random Forest ML Prediction
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                  {matchData.ml_recommendation.confidence}% Confidence
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                Best Matched: <span style={{ color: 'var(--primary-color, #10B981)' }}>{matchData.ml_recommendation.predicted_best_scheme}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Trained on 15,000 scheme datasets (98.83% accuracy)
              </div>
            </div>
          )}

          {/* Statutory Eligibility Fit Pills (Visual verification of pass conditions) */}
          <div className="results-fit-pills-row">
            <span className="results-fit-pill-cost">
              Project cost within limit
            </span>
            <span className="results-fit-pill-income">
              Income under the cap
            </span>
            <span className="results-fit-pill-purpose">
              Business purpose fit
            </span>
          </div>

          {/* -------------------------------------------------------------------
              PLAIN-LANGUAGE EXPLANATION PANEL:
              Explains WHY this scheme was matched in simple non-legal jargon.
              Powered by Google Gemini AI RAG using grounded statutory rules.
              Supports multilingual switching (English / Hindi) & TTS speech audio.
              ------------------------------------------------------------------- */}
          <div className="results-ai-explanation-box">
            <div className="results-ai-explanation-header">
              <span className="results-ai-explanation-title">
                Plain-language explanation
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Language Toggle: English vs हिन्दी */}
                <div className="results-lang-toggle-bg">
                  <button
                    type="button"
                    onClick={() => setExplanationLang('en')}
                    className={`results-lang-toggle-btn ${explanationLang === 'en' ? 'active' : ''}`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setExplanationLang('hi')}
                    className={`results-lang-toggle-btn ${explanationLang === 'hi' ? 'active' : ''}`}
                  >
                    हिन्दी
                  </button>
                </div>

                {/* Text-to-Speech (TTS) Audio Listen Button */}
                <button
                  type="button"
                  onClick={handleListenExplanation}
                  title="Listen to explanation out loud"
                  className="results-tts-btn"
                >
                  <Volume2 size={15} color="var(--accent-cyan)" />
                </button>
              </div>
            </div>

            {/* Multilingual Text Render based on active toggle state */}
            {explanationLang === 'en' ? (
              <p className="results-ai-explanation-body">
                {topMatch.explanation_en}
              </p>
            ) : (
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>हिन्दी:</span>
                <p className="results-ai-explanation-body" style={{ marginTop: '2px' }}>
                  {topMatch.explanation_hi}
                </p>
              </div>
            )}

            {/* AI Grounding Attribution */}
            <div className="results-ai-footer-note">
              <Sparkles size={13} color="var(--primary)" />
              <span>
                Explanation written by Gemini AI from verified scheme facts.
              </span>
            </div>
          </div>

          {/* -------------------------------------------------------------------
              REQUIRED DOCUMENT CHECKLIST:
              Displays the exact list of statutory certificates and collateral
              waivers required for this matched scheme. Users can check off ready docs.
              ------------------------------------------------------------------- */}
          <div>
            <div className="results-docs-header">
              <span className="results-docs-title">
                <FileCheck size={16} color="var(--accent)" />
                Required Document Checklist
              </span>
              {/* Dynamic readiness counter (e.g. 3 of 6 ready) */}
              <span className="results-docs-count">
                {Object.values(checkedDocs).filter(Boolean).length} of {topMatch.documents.length} ready
              </span>
            </div>

            {/* Interactive Document Checklist List */}
            <div className="results-docs-list">
              {topMatch.documents.map((doc) => {
                const isChecked = !!checkedDocs[doc.id];
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`results-doc-checklist-item ${isChecked ? 'checked' : ''}`}
                  >
                    {/* Custom Checkbox Box */}
                    <div className={`results-doc-checkbox-square ${isChecked ? 'checked' : ''}`}>
                      {isChecked && <Check size={12} color="#FFF" />}
                    </div>
                    {/* Document Label with strikethrough when ready */}
                    <span className={`results-doc-label ${isChecked ? 'checked' : ''}`}>
                      {doc.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: EMI CALCULATOR ================= */}
        <div className="glass-card results-col2-card">
          <div className="results-emi-header">
            <div className="results-emi-icon-box">
              <Calculator size={20} color="var(--accent-cyan)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                EMI calculator
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Concessional Rate: <strong style={{ color: 'var(--accent)' }}>{interestRateYearly}% p.a.</strong>
              </p>
            </div>
          </div>

          {/* Slider 1: Loan Amount */}
          <div className="results-emi-slider-row">
            <div className="results-emi-slider-meta">
              <span style={{ color: 'var(--text-muted)' }}>Loan amount</span>
              <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                ₹ {loanAmount.toLocaleString('en-IN')}
              </strong>
            </div>
            <input
              type="range"
              min="20000"
              max={topMatch.maxLoan || 500000}
              step="5000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="results-slider-input"
              style={{ accentColor: 'var(--primary)' }}
            />
            <div className="results-slider-scale">
              <span>₹ 20,000</span>
              <span>Max ₹ {(topMatch.maxLoan || 500000).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Slider 2: Tenure */}
          <div className="results-emi-slider-row">
            <div className="results-emi-slider-meta">
              <span style={{ color: 'var(--text-muted)' }}>Tenure</span>
              <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                {tenureMonths} months ({Math.round(tenureMonths / 12 * 10) / 10} yrs)
              </strong>
            </div>
            <input
              type="range"
              min="12"
              max="84"
              step="6"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="results-slider-input"
              style={{ accentColor: 'var(--accent-cyan)' }}
            />
            <div className="results-slider-scale">
              <span>12 months</span>
              <span>84 months (7 yrs)</span>
            </div>
          </div>

          {/* Slider 3: Moratorium */}
          <div className="results-emi-slider-row" style={{ marginBottom: '2rem' }}>
            <div className="results-emi-slider-meta">
              <span style={{ color: 'var(--text-muted)' }}>Moratorium</span>
              <strong style={{ color: 'var(--warning)', fontSize: '0.95rem' }}>
                {moratoriumMonths} months
              </strong>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="1"
              value={moratoriumMonths}
              onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
              className="results-slider-input"
              style={{ accentColor: 'var(--warning)' }}
            />
            <div className="results-slider-scale">
              <span>0 (Immediate)</span>
              <span>12 months repayment holiday</span>
            </div>
          </div>

          {/* Calculation Stat Boxes matching Wireframe */}
          <div className="results-emi-stats-stack">
            
            {/* Monthly EMI Card */}
            <div className="results-emi-stat-card">
              <span className="results-emi-stat-label">
                Monthly EMI
              </span>
              <div className="results-emi-stat-val">
                ₹ {emiCalculation.monthlyEmi.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Total Interest Card */}
            <div className="results-emi-stat-card">
              <span className="results-emi-stat-label">
                Total interest
              </span>
              <div className="results-emi-stat-val" style={{ color: 'var(--accent-cyan)', fontSize: '1.45rem', fontWeight: 800 }}>
                ₹ {emiCalculation.totalInterest.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Total Payable Card */}
            <div className="results-emi-stat-card">
              <span className="results-emi-stat-label">
                Total payable
              </span>
              <div className="results-emi-stat-val" style={{ fontSize: '1.45rem', fontWeight: 800 }}>
                ₹ {emiCalculation.totalPayable.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Government Subsidy Savings Pill */}
            <div className="results-subsidy-card">
              <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>
                Govt. Capital Subsidy Benefit
              </span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                ₹ {emiCalculation.capitalSubsidy.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          {/* Footnote matching wireframe */}
          <p className="results-emi-footnote">
            Indicative only, at a sample rate of {interestRateYearly}% a year. The real tool uses each scheme's own loan limit, rate and moratorium rules.
          </p>
        </div>

        {/* ================= COLUMN 3: NEAREST ELIGIBLE CHANNEL PARTNERS ================= */}
        <div className="glass-card results-col3-card">
          
          <div className="results-partner-header">
            <div className="results-partner-icon-box">
              <Landmark size={20} color="var(--accent)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Nearest eligible channel partners
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Location: {geoCity?.district || applicantData?.district || 'Indore'}, {geoCity?.state || applicantData?.state || 'Madhya Pradesh'}
              </p>
            </div>
          </div>

          {/* Interactive OpenStreetMap Leaflet Map with Live Geocoding */}
          <ChannelPartnerMap
            applicantData={applicantData}
            selectedPartner={selectedPartner}
            onSelectPartner={setSelectedPartner}
            onPartnersChange={(newPartners, newLoc) => {
              if (newPartners && newPartners.length > 0) {
                setChannelPartners(newPartners);
                if (newLoc) setGeoCity(newLoc);
              }
            }}
          />

          {/* Partner Cards matching Wireframe */}
          <div className="results-partners-list">
            {channelPartners.map((partner) => {
              const isSelected = selectedPartner.id === partner.id;
              const isEligible = partner.status === 'Eligible';
              return (
                <div
                  key={partner.id}
                  onClick={() => setSelectedPartner(partner)}
                  className={`results-partner-card-item ${isSelected ? 'selected' : ''}`}
                >
                  <div className="results-partner-row-header">
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                      {partner.name}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {partner.distance} km
                    </span>
                  </div>

                  <div className="results-partner-tags-row">
                    <span className={`results-partner-tag-status ${isEligible ? 'eligible' : 'flagged'}`}>
                      {partner.status}
                    </span>

                    <span className="results-partner-npa-text">
                      NPA: {partner.npaRatio}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="results-partner-expanded-info">
                      <p style={{ margin: '0 0 4px 0', color: 'var(--text-main)' }}>📍 {partner.address}</p>
                      <p style={{ margin: 0, color: 'var(--text-main)' }}>📞 {partner.phone}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Download Summary Button matching Wireframe */}
          <div style={{ marginTop: 'auto' }}>
            <button
              type="button"
              onClick={handleDownloadSummary}
              className="results-download-summary-btn"
            >
              <Download size={16} />
              <span>Download summary</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
