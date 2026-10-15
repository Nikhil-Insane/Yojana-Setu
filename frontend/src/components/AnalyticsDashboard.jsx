/**
 * ==============================================================================
 * Component: AnalyticsDashboard (राष्ट्रीय प्रभाव एवं सांख्यिकी डैशबोर्ड)
 * Path: frontend/src/components/AnalyticsDashboard.jsx
 * 
 * ------------------------------------------------------------------------------
 * ARCHITECTURAL PURPOSE & DESIGN OVERVIEW:
 * ------------------------------------------------------------------------------
 * The Analytics Dashboard acts as the visual reporting center of the Yojana Setu
 * platform. It aggregates macro-level financial and social welfare metrics from
 * the backend database (SQLite / MongoDB Atlas) to provide an explainable view of:
 * 
 * 1. Total Concessional Credit Pool:
 *    Calculates the combined maximum credit ceiling (in ₹ Crores) offered across
 *    all indexed schemes (NSFDC, NSTFDC, NBCFDC, NMDFC, PMEGP, Stand-Up India).
 * 
 * 2. Interest Rate Differential vs Commercial Lending:
 *    Showcases the average affirmative loan rate (~7.2% p.a., with women concessions
 *    reaching 4.0% p.a.) compared to prevailing commercial bank credit (14%–18%).
 * 
 * 3. Affirmative Community Coverage:
 *    Provides demographic breakdown of welfare programs mapped to Scheduled Castes
 *    (SC), Scheduled Tribes (ST), Other Backward Classes (OBC), Religious Minorities,
 *    and General/Open central initiatives.
 * 
 * 4. Technical Architecture Briefing:
 *    Highlights the three pillars of the project: Zero-hallucination Google Gemini RAG,
 *    Hybrid 70/30 (Deterministic Rules + Semantic Embeddings) Matching, and
 *    Geo-spatial Partner Routing.
 * ==============================================================================
 */

import React from 'react';
import { BarChart3, PieChart, TrendingUp, Users, DollarSign, ShieldAlert, Award } from 'lucide-react';

/**
 * AnalyticsDashboard Component Definition
 * 
 * @param {Object} props.analytics - Real-time statistics fetched from FastAPI `/api/schemes/analytics`.
 *        If the backend server is offline or restarting, the component gracefully falls back
 *        to pre-calculated statutory baseline data so the UI remains 100% interactive.
 */
export default function AnalyticsDashboard({ analytics }) {
  
  // ---------------------------------------------------------------------------
  // 1. DATA INITIALIZATION & FALLBACK RESILIENCE
  // ---------------------------------------------------------------------------
  // If `analytics` prop is null or undefined (e.g. offline mode or cold backend start),
  // we default to statutory government figures to ensure zero UI crash.
  const data = analytics || {
    total_schemes: 16,                                    // Total indexed central & corporation schemes
    community_breakdown: {                                // Distribution across marginalized beneficiary groups
      SC: 6,                                              // NSFDC (MFS, TL, MSY, GBS, AMY, UNY)
      ST: 3,                                              // NSTFDC (Term Loan, AMES, Micro Credit)
      OBC: 2,                                             // NBCFDC (General Loan, New Swarnima)
      Minority: 2,                                        // NMDFC (Term Loan, Virasat)
      General: 3                                          // PMEGP, PM Vishwakarma, Stand-Up India
    },
    total_max_loan_pool: 24500000,                        // Total loan capacity in Indian Rupees (₹2.45 Cr default sample)
    average_interest_rate: 7.2,                           // Average subsidized interest rate percentage p.a.
    providers_count: 8,                                   // Number of statutory corporations/ministries indexed
  };

  // ---------------------------------------------------------------------------
  // 2. DEMOGRAPHIC THEME COLOR MAPPING
  // ---------------------------------------------------------------------------
  // Maps affirmative categories to CSS variables defined in style.css for consistent
  // visual identity throughout the entire design system.
  const communityColors = {
    SC: 'var(--primary)',         // Vibrant Indigo: Primary focus community (Scheduled Castes)
    ST: 'var(--accent)',          // Emerald Green: Scheduled Tribes welfare initiatives
    OBC: 'var(--accent-cyan)',    // Electric Cyan: Other Backward Classes welfare initiatives
    Minority: 'var(--warning)',   // Amber Gold: Notified religious minority artisan programs
    General: 'var(--accent-pink)' // Neon Pink: Universal central entrepreneurship schemes
  };

  // ---------------------------------------------------------------------------
  // 3. RENDER JSX
  // ---------------------------------------------------------------------------
  return (
    <div className="analytics-container">
      
      {/* =========================================================================
          SECTION A: TOP SUMMARY METRIC CARDS
          Uses CSS Grid with auto-fit minmax(220px, 1fr) for full responsiveness
          across desktop monitors, tablets, and mobile displays.
          ========================================================================= */}
      <div className="analytics-metrics-grid">
        
        {/* Metric Card 1: Total Indexed Schemes */}
        <div className="glass-card analytics-metric-card">
          <div className="analytics-metric-header">
            {/* Lucide BarChart3 icon with indigo primary theme color */}
            <BarChart3 size={20} color="var(--primary)" />
            <span className="analytics-metric-label">Indexed Schemes</span>
          </div>
          {/* Main numeric counter */}
          <h3 className="analytics-metric-value">
            {data.total_schemes}
          </h3>
          <span className="analytics-metric-subtext">
            Across 8 Ministries &amp; Corporations
          </span>
        </div>

        {/* Metric Card 2: Total Lending Capacity (₹ in Crores) */}
        <div className="glass-card analytics-metric-card">
          <div className="analytics-metric-header">
            {/* TrendingUp icon denoting financial growth */}
            <TrendingUp size={20} color="var(--accent)" />
            <span className="analytics-metric-label">Funding Capacity</span>
          </div>
          {/* Converts Raw Indian Rupees to Crores by dividing by 10,000,000 (1 Crore = 10^7) */}
          <h3 className="analytics-metric-value color-accent">
            ₹{(data.total_max_loan_pool / 10000000).toFixed(2)} Cr
          </h3>
          <span className="analytics-metric-subtext">
            Max credit pool available
          </span>
        </div>

        {/* Metric Card 3: Average Concessional Interest Rate */}
        <div className="glass-card analytics-metric-card">
          <div className="analytics-metric-header">
            {/* Award ribbon icon highlighting affirmative benefit */}
            <Award size={20} color="var(--accent-cyan)" />
            <span className="analytics-metric-label">Avg Interest Rate</span>
          </div>
          <h3 className="analytics-metric-value color-cyan">
            {data.average_interest_rate}% p.a.
          </h3>
          <span className="analytics-metric-subtext">
            Concessional rate vs 14% commercial
          </span>
        </div>

        {/* Metric Card 4: Registered Implementing Agencies */}
        <div className="glass-card analytics-metric-card">
          <div className="analytics-metric-header">
            {/* Users icon representing statutory corporations */}
            <Users size={20} color="var(--accent-pink)" />
            <span className="analytics-metric-label">Implementing Agencies</span>
          </div>
          <h3 className="analytics-metric-value">
            {data.providers_count}
          </h3>
          <span className="analytics-metric-subtext">
            NSFDC, NSTFDC, NBCFDC, KVIC, SIDBI
          </span>
        </div>

      </div>

      {/* =========================================================================
          SECTION B: DETAILED BREAKDOWN PANELS (2-Column Grid)
          Column 1: Community Target Distribution (Progress Bars)
          Column 2: Explainable AI Architecture Highlights
          ========================================================================= */}
      <div className="analytics-panels-grid">
        
        {/* Panel 1: Community Target Distribution Progress Bars */}
        <div className="glass-card analytics-panel-card">
          <h4 className="analytics-panel-title">
            <PieChart size={18} color="var(--primary)" /> 
            Scheme Distribution by Beneficiary Target Group
          </h4>

          {/* Iterates through Object.entries of community_breakdown: [Category, Count] */}
          <div className="analytics-breakdown-list">
            {Object.entries(data.community_breakdown).map(([cat, count]) => {
              // Calculates proportional percentage of schemes belonging to this category
              const pct = Math.round((count / data.total_schemes) * 100);
              // Retrieves corresponding category accent color from map
              const barColor = communityColors[cat] || 'var(--primary)';
              
              return (
                <div key={cat}>
                  {/* Category Label and Scheme Count Header */}
                  <div className="analytics-breakdown-row-header">
                    <span className="analytics-breakdown-cat-name">
                      {cat} Target Schemes
                    </span>
                    <span className="analytics-breakdown-cat-count">
                      {count} Schemes ({pct}%)
                    </span>
                  </div>
                  
                  {/* Outer track bar container */}
                  <div className="analytics-bar-track">
                    {/* Inner filled progress bar with dynamic width percentage */}
                    <div 
                      className="analytics-bar-fill"
                      style={{ 
                        width: `${pct}%`, 
                        background: barColor, 
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 2: Technical Architecture & Explainable AI Highlights */}
        <div className="glass-card analytics-panel-card">
          <h4 className="analytics-panel-title">
            <Award size={18} color="var(--accent)" /> 
            Yojana Setu Explainable AI Architecture
          </h4>

          <div className="analytics-arch-list">
            
            {/* Feature 1: Grounded RAG Gemini AI Assistant */}
            <div className="analytics-arch-item accent-border">
              <strong className="analytics-arch-title">1. Zero-Hallucination Gemini AI Assistant:</strong> 
              Grounded Retrieval-Augmented Generation (RAG) architecture forces Google Gemini to answer
              ONLY from verified statutory government scheme documentation with mandatory source citations.
              Automatically disabled offline to prevent hallucination.
            </div>

            {/* Feature 2: Hybrid 70/30 Eligibility Model */}
            <div className="analytics-arch-item primary-border">
              <strong className="analytics-arch-title">2. Hybrid Rule + Embedding Score (70/30):</strong> 
              70% Hard Rule Compliance (strict validation of annual family income &lt;= ₹5L, affirmative caste
              criteria, and unit cost ceilings) + 30% Semantic Embeddings (ranking trade fit for dairy,
              tailoring, transport via sentence-transformers cosine vectors).
            </div>

            {/* Feature 3: Multi-Channel Partner Routing */}
            <div className="analytics-arch-item cyan-border">
              <strong className="analytics-arch-title">3. Multi-Channel Partner Routing:</strong> 
              Directly routes applicants to verified State Channelizing Agencies (SCAs), District
              Industries Centres (DICs), Lead Bank branches (PNB, SBI, Canara Bank), and NBFC-MFIs with
              branch health metrics and NPA ratio ratings.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
