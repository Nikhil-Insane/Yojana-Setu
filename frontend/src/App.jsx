/**
 * ==============================================================================
 * Component: App (मुख्य अनुप्रयोग घटक)
 * Path: frontend/src/App.jsx
 *
 * Purpose:
 * Root component that orchestrates the entire Yojana Setu single-page application.
 *
 * Restructured Architecture (Oct 2026):
 * ─────────────────────────────────────
 * The app is now a single scrollable page with clear sections instead of tabs:
 *
 *  1. Navbar        — Logo | Profile Button | Language Switcher | Theme Toggle
 *  2. LandingHeader — Rich hero section: mission, who-we-help, how-it-works, about
 *  3. SchemeFinder  — The 4-step intake wizard + results view (inline, no tab)
 *  4. Analytics     — Platform impact metrics (inline section, not a tab)
 *  5. SiteFooter    — 4-column footer with links, schemes, contact, disclaimer
 *
 * Removed from Navigation:
 * ─────────────────────────
 *  ✕ Gemini AI Assistant tab    (Gemini still used internally in results view)
 *  ✕ Scheme Directory tab       (Redundant; schemes shown after matching)
 *  ✕ Admin Portal tab           (Managed by developers on the backend)
 *  ✕ Doc Checklist tab          (Now embedded inline in SchemeResultsView)
 *  ✕ Analytics tab              (Now shown as inline section on main page)
 *
 * New Features:
 * ─────────────
 *  ✓ Dark / Light theme toggle stored in localStorage
 *  ✓ User profile shown as a slide-in modal from the navbar profile button
 *  ✓ DocumentChecklist shown inline inside SchemeResultsView after scheme selection
 * ==============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';

// Core Layout Components
import Navbar      from './components/Navbar';
import LandingHeader from './components/LandingHeader';
import SiteFooter  from './components/SiteFooter';

// Feature Components
import SchemeMatcher       from './components/SchemeMatcher';
import UserProfileManager  from './components/UserProfileManager';
import AnalyticsDashboard  from './components/AnalyticsDashboard';

// Icons
import { X, BarChart3, Sparkles } from 'lucide-react';

export default function App() {
  // ---------------------------------------------------------------------------
  // Theme State — persisted to localStorage so preference survives page refresh
  // 'dark' (default) | 'light'
  // ---------------------------------------------------------------------------
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ys_theme') || 'light';
  });

  // Persist theme and apply CSS class to <html> element for full-page theming
  useEffect(() => {
    localStorage.setItem('ys_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ---------------------------------------------------------------------------
  // Language State
  // Currently selected Indic language code ('en', 'hi', 'mr', 'ta', 'te', 'bn')
  // ---------------------------------------------------------------------------
  const [currentLang, setCurrentLang] = useState('en');

  // ---------------------------------------------------------------------------
  // Analytics State
  // High-level platform statistics fetched from backend on mount
  // ---------------------------------------------------------------------------
  const [analytics, setAnalytics] = useState(null);

  // ---------------------------------------------------------------------------
  // Profile Modal State
  // Controls visibility of the UserProfileManager slide-in panel
  // ---------------------------------------------------------------------------
  const [profileOpen, setProfileOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Profile Prefill State
  // Holds extracted profile data when user clicks "Start Matching" in profile
  // ---------------------------------------------------------------------------
  const [activeProfileForMatcher, setActiveProfileForMatcher] = useState(null);

  // ---------------------------------------------------------------------------
  // Scheme Finder Section Reference
  // Used to scroll the page to the intake form when CTA buttons are clicked
  // ---------------------------------------------------------------------------
  const schemeFinderRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Lifecycle: Fetch analytics on initial page load
  // ---------------------------------------------------------------------------
  useEffect(() => {
    fetchAnalytics();
  }, []);

  /**
   * fetchAnalytics
   * Calls backend /api/schemes/analytics endpoint.
   * Falls back silently if backend is offline (kiosk/offline demo mode).
   */
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/schemes/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.warn('Analytics endpoint offline. Using default platform metrics.');
    }
  };

  /**
   * handleStartFinder
   * Smoothly scrolls the page to the Scheme Finder (SchemeMatcher) section.
   * Called from landing CTAs and footer links.
   */
  const handleStartFinder = () => {
    schemeFinderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /**
   * handleStartMatchingWithProfile
   * Extracts stored profile data and pre-fills the intake form,
   * then scrolls to the Scheme Finder section automatically.
   *
   * @param {Object} profile - User profile data saved in UserProfileManager
   */
  const handleStartMatchingWithProfile = (profile) => {
    setActiveProfileForMatcher({
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      category: profile.category,
      annual_family_income: profile.annual_family_income,
      education: profile.education,
      current_occupation: profile.current_occupation,
      loan_purpose: 'Start or expand a business',
      project_type: profile.target_business || 'Tailoring unit',
      estimated_cost: profile.estimated_cost || 100000,
      state: profile.state,
      district: profile.district,
      preferred_language: profile.preferred_language,
    });
    setProfileOpen(false); // Close profile modal
    handleStartFinder();   // Scroll to scheme finder
  };

  // ---------------------------------------------------------------------------
  // Render JSX
  // ---------------------------------------------------------------------------
  return (
    /* data-theme attribute drives CSS variable overrides for light/dark mode */
    <div className="app-root" data-theme={theme}>

      {/* ── 1. Sticky Top Navbar ──
          Contains: Logo | Profile Button | Language Selector | Theme Toggle ── */}
      <Navbar
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        theme={theme}
        setTheme={setTheme}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {/* ── 2. User Profile Modal Overlay ──
          Slide-in side panel containing UserProfileManager.
          Opened via "My Profile" button in Navbar.
          Closed via the ✕ button or clicking the dark backdrop. ── */}
      {profileOpen && (
        <div className="profile-modal-overlay" onClick={() => setProfileOpen(false)}>
          <div
            className="profile-modal-panel glass-card"
            onClick={(e) => e.stopPropagation()} /* Prevent close on inner click */
          >
            {/* Close button */}
            <button
              className="profile-modal-close-btn"
              onClick={() => setProfileOpen(false)}
              aria-label="Close profile"
            >
              <X size={20} />
            </button>

            {/* Profile Manager component renders full profile + digital locker */}
            <UserProfileManager
              onStartMatchingWithProfile={handleStartMatchingWithProfile}
              currentLang={currentLang}
            />
          </div>
        </div>
      )}

      {/* ── 3. Main Scrollable Page Content ── */}
      <main className="app-main">

        {/* ── Section A: Landing Header ──
            Rich hero section with: mission, how-it-works, about, stats grid.
            The primary above-the-fold impression of the platform. ── */}
        <section id="landing" className="app-section">
          <LandingHeader analytics={analytics} onStartFinder={handleStartFinder} />
        </section>

        {/* ── Section B: Scheme Finder ──
            The core intake wizard (4-step form → AI match results).
            Shown inline on the main page — no tab navigation needed. ── */}
        <section id="scheme-finder" ref={schemeFinderRef} className="app-section">
          {/* Scheme Finder Section Header */}
          <div className="section-header-block">
            <div className="section-header-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Sparkles size={22} color="var(--primary)" />
            </div>
            <div>
              <h2 className="section-header-title">Scheme Finder</h2>
              <p className="section-header-subtitle">
                Fill in your details below and our AI will match you with the best government schemes.
              </p>
            </div>
          </div>

          {/* SchemeMatcher: Handles 4-step stepper + results view internally */}
          <SchemeMatcher
            profileData={activeProfileForMatcher}
            /* DocumentChecklist is now embedded inside SchemeResultsView itself */
          />
        </section>

        {/* ── Section C: Analytics Dashboard ──
            Displays national program impact metrics inline below scheme finder.
            Previously was a separate "Analytics" tab. ── */}
        <section id="analytics" className="app-section">
          {/* Analytics Section Header */}
          <div className="section-header-block">
            <div className="section-header-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <BarChart3 size={22} color="var(--accent)" />
            </div>
            <div>
              <h2 className="section-header-title">Platform Impact & Analytics</h2>
              <p className="section-header-subtitle">
                Live national program reach, scheme distribution, and beneficiary metrics.
              </p>
            </div>
          </div>

          {/* AnalyticsDashboard: Renders charts and impact stat cards */}
          <AnalyticsDashboard analytics={analytics} />
        </section>

      </main>

      {/* ── 4. Site Footer ──
          Full-width 4-column footer with brand, links, schemes, contact. ── */}
      <SiteFooter onStartFinder={handleStartFinder} />

    </div>
  );
}
