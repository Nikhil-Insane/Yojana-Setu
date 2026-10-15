/**
 * ==============================================================================
 * Component: Navbar (मुख्य नेविगेशन बार)
 * Path: frontend/src/components/Navbar.jsx
 *
 * Purpose:
 * Renders the top sticky glassmorphism navigation header for Yojana Setu.
 *
 * Restructured Design (Oct 2026):
 * - Removed tabs: Gemini AI Assistant, Scheme Directory, Doc Checklist,
 *   Analytics, Admin Portal (all moved to main-page inline sections).
 * - Profile icon now sits immediately to the right of the brand logo.
 * - Right side holds Language Selector + Dark/Light Theme Toggle.
 * - Minimal, clean one-page navigation feel.
 * ==============================================================================
 */

import React from 'react';
import { Sparkles, Globe, Sun, Moon, User } from 'lucide-react';

export default function Navbar({
  currentLang,
  setCurrentLang,
  theme,
  setTheme,
  onOpenProfile,
}) {
  // ---------------------------------------------------------------------------
  // Supported Indic Languages Configuration
  // Covers 6 major Indian languages for inclusive accessibility
  // ---------------------------------------------------------------------------
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
  ];

  // Toggle between 'dark' and 'light' theme modes
  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  // ---------------------------------------------------------------------------
  // Render JSX
  // ---------------------------------------------------------------------------
  return (
    <header className="ys-navbar glass-card">
      <div className="container navbar-inner">

        {/* ── Left: Brand Logo + Portal Title ── */}
        <div className="navbar-brand">
          {/* Vibrant Gradient Icon Emblem */}
          <div className="navbar-logo-icon">
            <Sparkles size={22} color="#FFF" />
          </div>

          {/* Brand Name & Subtitle text block */}
          <div>
            <div className="navbar-brand-header">
              <h1 className="ys-brand-title">Yojana Setu</h1>
              <span className="glass-pill navbar-brand-badge">SC Welfare</span>
            </div>
            <p className="navbar-brand-tagline">
              AI Scheme Recommender &amp; Concessional Credit Platform
            </p>
          </div>
        </div>

        {/* ── Right: Language Selector + Profile Icon + Theme Toggle ── */}
        <div className="navbar-right">
          {/* Indic Language Dropdown */}
          <div className="navbar-lang-box">
            <Globe size={14} color="var(--accent-cyan)" />
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              className="navbar-lang-select"
              title="Select portal language"
              aria-label="Select language"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="navbar-lang-option">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Round Profile Icon Button — positioned right of language dropdown */}
          <button
            className="navbar-profile-icon-btn"
            onClick={onOpenProfile}
            title="My Profile — View saved information & documents"
            aria-label="Open user profile"
          >
            <User size={17} />
          </button>

          {/* Dark / Light Theme Toggle Button */}
          <button
            className="navbar-theme-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

      </div>
    </header>
  );
}
