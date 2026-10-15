/**
 * ==============================================================================
 * Component: SiteFooter (साइट फुटर)
 * Path: frontend/src/components/SiteFooter.jsx
 *
 * Purpose:
 * Renders the full-width application footer for Yojana Setu.
 * Contains:
 *  1. Brand identity block with mission tagline.
 *  2. Quick-links column (scrolls to relevant page sections).
 *  3. Supported schemes column (lists key indexed programs).
 *  4. Tech stack & contact column.
 *  5. Copyright bar with disclaimer.
 *
 * Design:
 * Uses dark glassmorphism styling, consistent with the rest of the app.
 * Adapts from 4-column layout on desktop to stacked layout on mobile.
 * ==============================================================================
 */

import React from 'react';
import {
  Sparkles, Heart, Shield, Phone, Mail, MapPin,
  ExternalLink, ArrowRight,
} from 'lucide-react';

export default function SiteFooter({ onStartFinder }) {
  // ---------------------------------------------------------------------------
  // Quick Links configuration
  // These scroll the user to named anchor sections on the single-page app
  // ---------------------------------------------------------------------------
  const quickLinks = [
    { label: 'Check Eligibility', action: onStartFinder },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'About Yojana Setu', href: '#about' },
    { label: 'Analytics Dashboard', href: '#analytics' },
  ];

  // ---------------------------------------------------------------------------
  // Government Schemes listed in the platform's index
  // ---------------------------------------------------------------------------
  const schemes = [
    'NSFDC Micro Finance Scheme',
    'Mahila Samriddhi Yojana',
    'NSFDC Term Loan Scheme',
    'Green Business Scheme',
    'PMEGP (MSME Ministry)',
    'NSTFDC Tribal Schemes',
    'NBCFDC OBC Schemes',
    'NMDFC Minority Schemes',
  ];

  // ---------------------------------------------------------------------------
  // Render JSX
  // ---------------------------------------------------------------------------
  return (
    <footer className="site-footer">
      <div className="container">

        {/* ── Main Footer Grid (4 columns on desktop) ── */}
        <div className="footer-grid">

          {/* Column 1: Brand & Mission */}
          <div className="footer-col footer-brand-col">
            <div className="footer-brand-row">
              <div className="footer-logo-icon">
                <Sparkles size={20} color="#FFF" />
              </div>
              <span className="footer-brand-name">Yojana Setu</span>
            </div>
            <p className="footer-tagline">
              योजना सेतु — Bridging marginalized communities with
              Government-backed concessional loan schemes &amp; financial inclusion programs.
            </p>
            {/* Tech stack badges */}
            <div className="footer-badges">
              <span className="glass-pill footer-badge">Random Forest ML</span>
              <span className="glass-pill footer-badge">FastAPI Backend</span>
              <span className="glass-pill footer-badge">React Frontend</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-link-list">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  {link.action ? (
                    /* Clickable function (scroll to scheme finder) */
                    <button className="footer-link-btn" onClick={link.action}>
                      <ArrowRight size={12} />
                      {link.label}
                    </button>
                  ) : (
                    /* Anchor link for section navigation */
                    <a className="footer-link-btn" href={link.href}>
                      <ArrowRight size={12} />
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Covered Schemes */}
          <div className="footer-col">
            <h4 className="footer-col-title">Covered Schemes</h4>
            <ul className="footer-link-list">
              {schemes.map((scheme) => (
                <li key={scheme}>
                  <span className="footer-scheme-item">
                    <Shield size={11} color="var(--accent)" />
                    {scheme}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Disclaimer */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact & Info</h4>
            <div className="footer-contact-list">
              {/* Official helpline reference */}
              <div className="footer-contact-item">
                <Phone size={14} color="var(--accent-cyan)" />
                <span>NSFDC Helpline: 1800-11-2211 (Toll Free)</span>
              </div>
              {/* Email reference */}
              <div className="footer-contact-item">
                <Mail size={14} color="var(--accent-cyan)" />
                <a href="mailto:info@nsfdc.nic.in" className="footer-contact-link">
                  info@nsfdc.nic.in
                </a>
              </div>
              {/* Nodal office */}
              <div className="footer-contact-item">
                <MapPin size={14} color="var(--accent-cyan)" />
                <span>NSFDC, Delhi — Ministry of Social Justice &amp; Empowerment</span>
              </div>
              {/* External official portal */}
              <a
                href="https://www.nsfdc.nic.in"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-external-link"
              >
                <ExternalLink size={13} />
                Official NSFDC Portal
              </a>
            </div>
          </div>

        </div>

        {/* ── Footer Bottom Bar: Copyright & Disclaimer ── */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            © 2026 Yojana Setu — 3rd Year Minor Project &nbsp;|&nbsp;
            Made with <Heart size={13} color="var(--accent-pink)" style={{ display: 'inline', verticalAlign: 'middle' }} /> for
            marginalized communities of India
          </p>
          <p className="footer-disclaimer">
            <strong>Disclaimer:</strong> This platform is an academic Minor Project tool.
            Scheme data is based on published government circulars. Always verify eligibility
            with the official nodal agency before applying. Loan approval is subject to bank
            norms and documentary verification.
          </p>
        </div>

      </div>
    </footer>
  );
}
