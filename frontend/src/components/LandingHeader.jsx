/**
 * ==============================================================================
 * Component: LandingHeader (लैंडिंग हेडर - वेबसाइट परिचय एवं मिशन सेक्शन)
 * Path: frontend/src/components/LandingHeader.jsx
 *
 * Purpose:
 * Renders the rich above-the-fold hero section on the main page of Yojana Setu.
 * This section replaces the old HeroBanner and provides full context about:
 *  1. What Yojana Setu is (platform purpose, mission statement).
 *  2. Who it helps (SC/ST, OBC, Women, PwD, Minorities, Artisans).
 *  3. How it works (3-step flow: Fill Form → AI Matches → Apply).
 *  4. Live platform metrics (indexed schemes, loan range, algorithm, languages).
 *  5. Offline awareness alert if browser has no internet.
 *
 * Key Features:
 * - Ambient glow blobs for a premium glassmorphism look.
 * - Animated "How It Works" 3-step flow diagram.
 * - Stats grid showing verified platform metrics.
 * - Offline detection via useOnlineStatus hook.
 * - "Check Eligibility" CTA scrolls directly to the Scheme Finder section.
 * ==============================================================================
 */

import React from 'react';
import {
  Target, Award, Zap, ShieldCheck, TrendingUp, WifiOff,
  ArrowRight, Users, FileCheck, CheckCircle2, BookOpen,
  IndianRupee,
} from 'lucide-react';
import useOnlineStatus from '../utils/useOnlineStatus';

export default function LandingHeader({ analytics, onStartFinder }) {
  // ---------------------------------------------------------------------------
  // Online/Offline Connectivity Detection
  // Used to gracefully warn about AI features requiring internet
  // ---------------------------------------------------------------------------
  const isOnline = useOnlineStatus();

  // ---------------------------------------------------------------------------
  // Platform Statistics Configuration
  // Values default to hardcoded fallback when backend analytics is unavailable
  // ---------------------------------------------------------------------------
  const stats = [
    {
      icon: ShieldCheck,
      label: 'Verified Schemes Indexed',
      value: analytics?.total_schemes || '16+',
      subtext: 'NSFDC, NSTFDC, NBCFDC, NMDFC, PMEGP & Central Schemes',
      color: 'var(--accent)',
    },
    {
      icon: IndianRupee,
      label: 'Max Loan Coverage',
      value: 'Up to ₹1 Crore',
      subtext: 'Concessional interest rates 4% – 8% & up to 35% capital subsidy',
      color: 'var(--accent-cyan)',
    },
    {
      icon: Award,
      label: 'Matching Algorithm',
      value: 'Random Forest ML',
      subtext: '70% Statutory Rule Verification + 30% Semantic Business Relevance',
      color: 'var(--primary)',
    },
    {
      icon: Zap,
      label: 'Languages Supported',
      value: '6 Indic Languages',
      subtext: 'English, Hindi, Marathi, Tamil, Telugu, Bengali',
      color: 'var(--accent-pink)',
    },
  ];

  // ---------------------------------------------------------------------------
  // Beneficiary Community Tags
  // Shows which communities this platform directly serves
  // ---------------------------------------------------------------------------
  const communities = [
    'Scheduled Caste (SC)',
    'Scheduled Tribe (ST)',
    'OBC Beneficiaries',
    'Women Entrepreneurs',
    'Persons with Disability (PwD)',
    'Minorities',
    'Artisans & Weavers',
    'Micro Enterprises',
  ];

  // ---------------------------------------------------------------------------
  // "How It Works" 3-Step Process Flow
  // ---------------------------------------------------------------------------
  const steps = [
    {
      number: '01',
      icon: FileCheck,
      title: 'Fill the Eligibility Form',
      desc: 'Answer a simple 4-step questionnaire about your background, income, and business plan.',
      color: 'var(--primary)',
    },
    {
      number: '02',
      icon: Target,
      title: 'AI Matches Your Schemes',
      desc: 'Our Random Forest ML engine evaluates 16+ government schemes and ranks them by suitability score.',
      color: 'var(--accent-cyan)',
    },
    {
      number: '03',
      icon: BookOpen,
      title: 'View & Apply for Scheme',
      desc: 'See required documents, EMI calculator, and nearest loan disbursement partners — all in one place.',
      color: 'var(--accent)',
    },
  ];

  // ---------------------------------------------------------------------------
  // Render JSX
  // ---------------------------------------------------------------------------
  return (
    <div className="landing-header-wrapper">

      {/* ── Offline Warning Banner ──
          Amber-colored notice displayed only when browser detects no internet.
          Scheme Finder continues to work offline via client-side fallback. ── */}
      {!isOnline && (
        <div className="hero-offline-banner">
          <WifiOff size={18} />
          <span>
            <strong>You are offline.</strong> The Scheme Finder form, EMI calculator,
            and Document Checklist remain fully functional. AI explanation (Google Gemini)
            will resume automatically when internet is restored.
          </span>
        </div>
      )}

      {/* ──────────────────────────────────────────
          SECTION 1: HERO HEADLINE & MISSION
          Full-width glass card with ambient glow blobs
      ────────────────────────────────────────── */}
      <div className="glass-card landing-hero-card">
        {/* Ambient Glow Backdrop — decorative positioned blobs */}
        <div className="hero-glow-blob-1" />
        <div className="hero-glow-blob-2" />

        <div className="hero-relative-content">
          {/* Platform Badge Pill */}
          <div className="hero-subtitle-badge">
            <Zap size={14} color="var(--primary)" />
            <span>AI-Driven SC Beneficiary Scheme Platform — Government Welfare Initiative</span>
          </div>

          {/* Main Hero Headline */}
          <h2 className="hero-main-title">
            Bridging the Gap Between{' '}
            <span className="gradient-text">Marginalized Communities</span>{' '}
            &amp; Government Financial Schemes
          </h2>

          {/* Mission Statement Paragraph */}
          <p className="hero-main-description">
            <strong>Yojana Setu (योजना सेतु)</strong> — meaning "Scheme Bridge" — is an
            AI-powered platform that connects India's most underserved communities with
            government-backed concessional loan schemes, capital subsidies, and financial
            inclusion programs. We use a <strong>Random Forest ML</strong> engine that
            evaluates your profile against 16+ verified schemes and delivers instant,
            ranked recommendations with precise loan limits, interest rates, and document
            checklists — in your own language.
          </p>

          {/* ── Who We Help: Community Tag Pills ── */}
          <div className="landing-communities-row">
            <span className="landing-section-label">
              <Users size={14} /> Who We Serve:
            </span>
            <div className="landing-tags-wrap">
              {communities.map((tag) => (
                <span key={tag} className="landing-community-tag">
                  <CheckCircle2 size={12} color="var(--accent)" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Button — scrolls/reveals the Scheme Finder section */}
          <div className="hero-cta-group">
            <button className="btn-primary landing-cta-btn" onClick={onStartFinder}>
              <Target size={18} />
              <span>Check Your Eligibility — Start Now</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* ── Platform Statistics Grid: 4 metric cards ── */}
          <div className="hero-stats-grid">
            {stats.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div key={idx} className="hero-stat-card">
                  <div className="hero-stat-header">
                    <div className="hero-stat-icon-wrapper">
                      <Icon size={20} color={st.color} />
                    </div>
                    <span className="hero-stat-label">{st.label}</span>
                  </div>
                  <div className="hero-stat-value">{st.value}</div>
                  <div className="hero-stat-subtext">{st.subtext}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────
          SECTION 2: HOW IT WORKS (3-step flow)
          Horizontal step diagram explaining the user journey
      ────────────────────────────────────────── */}
      <div className="landing-how-section">
        <h3 className="landing-section-title">How Yojana Setu Works</h3>
        <p className="landing-section-subtitle">
          From eligibility check to scheme match in under 3 minutes — no paperwork, no jargon.
        </p>

        <div className="landing-steps-grid">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="landing-step-card glass-card">
                {/* Step Number Badge */}
                <div className="landing-step-number" style={{ color: step.color }}>
                  {step.number}
                </div>

                {/* Icon Circle */}
                <div className="landing-step-icon-wrap" style={{ borderColor: step.color }}>
                  <Icon size={28} color={step.color} />
                </div>

                <h4 className="landing-step-title">{step.title}</h4>
                <p className="landing-step-desc">{step.desc}</p>

                {/* Connector arrow between steps (hidden on last) */}
                {idx < steps.length - 1 && (
                  <div className="landing-step-arrow">
                    <ArrowRight size={20} color="var(--text-subtle)" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────
          SECTION 3: ABOUT THE PLATFORM
          Rich narrative about the project's purpose and impact
      ────────────────────────────────────────── */}
      <div className="glass-card landing-about-card">
        <div className="landing-about-grid">
          {/* Left: About text */}
          <div className="landing-about-text">
            <h3 className="landing-section-title">About Yojana Setu</h3>
            <p>
              Yojana Setu was built to solve a critical last-mile delivery problem in India's
              financial inclusion ecosystem. Thousands of eligible beneficiaries — SC/ST
              communities, women micro-entrepreneurs, PwD individuals, artisans — remain
              unaware of or unable to access concessional government loan schemes due to
              language barriers, complex documentation, and lack of guidance.
            </p>
            <p style={{ marginTop: '1rem' }}>
              By combining <strong>Machine Learning (Random Forest)</strong> with{' '}
              <strong>rule-based statutory eligibility verification</strong>, this platform
              automatically maps a user's profile to the most suitable scheme from NSFDC,
              NSTFDC, NBCFDC, NMDFC, PMEGP, and other central welfare programs — and explains
              it in 6 Indian languages including Hindi, Marathi, Tamil, Telugu, and Bengali.
            </p>
            <p style={{ marginTop: '1rem' }}>
              The platform also routes users to the nearest channel partner banks and
              State Channelizing Agencies (SCAs) with live NPA ratios and distance estimates,
              making the application process as seamless as possible even for first-time applicants.
            </p>
          </div>

          {/* Right: Impact stats */}
          <div className="landing-about-impact">
            <div className="landing-impact-card">
              <TrendingUp size={32} color="var(--accent)" />
              <div className="landing-impact-num">₹1 Crore</div>
              <div className="landing-impact-label">Maximum Loan Coverage per Beneficiary</div>
            </div>
            <div className="landing-impact-card">
              <ShieldCheck size={32} color="var(--accent-cyan)" />
              <div className="landing-impact-num">16+</div>
              <div className="landing-impact-label">Verified Government Schemes Indexed</div>
            </div>
            <div className="landing-impact-card">
              <Users size={32} color="var(--accent-pink)" />
              <div className="landing-impact-num">8+</div>
              <div className="landing-impact-label">Marginalized Communities Served</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
