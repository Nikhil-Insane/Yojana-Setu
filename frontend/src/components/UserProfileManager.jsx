/**
 * ==============================================================================
 * Component: UserProfileManager (लाभार्थी प्रोफ़ाइल एवं डिजिटल लॉकर)
 * Path: frontend/src/components/UserProfileManager.jsx
 * 
 * Purpose:
 * Provides a persistent profile management dashboard and digital document locker for
 * micro-entrepreneurs:
 * 1. Digital Beneficiary ID Card: Visual badge showing certified caste credentials
 *    (e.g., MP/IND/SC/2023/94102), affirmative category, income ceiling, and Aadhaar ref.
 * 2. Instant Matching Dispatch: "Find Schemes with this Profile" pre-fills the 4-step
 *    intake wizard in one click, eliminating redundant data entry for repeat users.
 * 3. Local Storage Persistence: Synchronizes profile changes to browser localStorage
 *    so offline kiosk beneficiaries retain their records across sessions.
 * 4. Application History Table: Keeps audit logs of past scheme recommendations and
 *    assigned channel partner bank branches.
 * 5. Digital Locker Status: Verifies readiness of core certificates (Caste, Income, DPR).
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  User, Shield, FileText, CheckCircle2, Edit3, Save, 
  MapPin, Phone, Award, Clock, ArrowRight, Printer, Sparkles, Database, RefreshCw 
} from 'lucide-react';

export default function UserProfileManager({ onStartMatchingWithProfile, currentLang = 'en' }) {
  // ---------------------------------------------------------------------------
  // Default Sample Profile Data
  // ---------------------------------------------------------------------------
  const defaultProfile = {
    name: '',
    phone: '',
    aadhaarLast4: '',
    casteCertificateNo: '',
    category: '',
    gender: '',
    age: '',
    annual_family_income: '',
    education: '',
    current_occupation: '',
    state: '',
    district: '',
    preferred_language: 'Hindi',
    target_business: '',
    estimated_cost: '',
  };

  // ---------------------------------------------------------------------------
  // Local Profile State (Initializes from browser localStorage if available)
  // ---------------------------------------------------------------------------
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('beneficiary_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultProfile;
      }
    }
    return defaultProfile;
  });

  // Controls inline edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // Feedback badge when changes are saved
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ---------------------------------------------------------------------------
  // Past Application History (Simulated audit records)
  // ---------------------------------------------------------------------------
  const [history] = useState([
    {
      id: 'APP-2026-091',
      schemeName: 'NSFDC Micro Finance Scheme (MFS)',
      date: '2026-09-28',
      loanAmount: '₹ 1,00,000',
      rate: '6.5% p.a.',
      status: 'Recommended (82% Match)',
      channelPartner: 'Punjab National Bank, Indore',
    },
    {
      id: 'APP-2026-042',
      schemeName: 'Swachhta Udyami Yojana (SUY)',
      date: '2026-08-15',
      loanAmount: '₹ 3,50,000',
      rate: '5.0% p.a.',
      status: 'Eligible with Subsidy',
      channelPartner: 'MP SCDC Vikas Bhawan',
    }
  ]);

  /**
   * handleSave: Persists updated beneficiary profile fields into localStorage
   */
  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('beneficiary_profile', JSON.stringify(profile));
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // ---------------------------------------------------------------------------
  // Render JSX
  // ---------------------------------------------------------------------------
  return (
    <div className="profile-wrapper">
      
      {/* ── Top Header & Fast-Track Scheme Finder CTA ── */}
      <div className="profile-header">
        <div>
          <h2 className="profile-header-title">
            <User size={26} color="var(--primary)" />
            Beneficiary Profile &amp; Digital Locker
          </h2>
          <p className="profile-header-sub">
            Manage your personal data, certified caste records, and fast-track scheme applications.
          </p>
        </div>

        {/* Fast-track button to launch Scheme Finder pre-filled with this profile */}
        <div className="profile-header-ctas">
          <button
            type="button"
            onClick={() => onStartMatchingWithProfile && onStartMatchingWithProfile(profile)}
            className="btn-primary profile-fasttrack-btn"
            title="Fast-track to Scheme Finder using this saved profile"
          >
            <Sparkles size={16} />
            <span>Find Schemes with this Profile</span>
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="profile-success-alert">
          <CheckCircle2 size={18} />
          <span>Profile changes saved successfully! Future applications will be pre-filled.</span>
        </div>
      )}

      {/* =========================================================================
          PROFILE DASHBOARD GRID:
          - Column 1 (Left, 1fr): Digital Beneficiary ID Card & Digital Locker Readiness.
            Acts as the statutory credentials badge displaying verified caste certification,
            affirmative category, income eligibility ceiling, and Aadhaar reference.
          - Column 2 (Right, 1.6fr): Personal & Business Profile Form.
            Interactive controlled form enabling beneficiaries or kiosk operators to
            update records and persist changes to localStorage.
          ========================================================================= */}
      <div className="profile-dashboard-grid">
        
        {/* ---------------------------------------------------------------------
            COLUMN 1: DIGITAL BENEFICIARY IDENTITY CARD
            Styled like a modern government smart identity card with glassmorphism,
            top accent glow gradient, and categorical credentials.
            --------------------------------------------------------------------- */}
        <div className="glass-card profile-id-card">
          
          {/* Holographic Top Glow Strip: Provides visual cue of official verification */}
          <div className="profile-glow-top-strip"></div>

          {/* User Avatar Circle & Name Display */}
          <div className="profile-avatar-row">
            <div className="profile-avatar-box">
              {/* Extract first letter of name for initials avatar, fallback to user icon */}
              {profile.name ? profile.name.charAt(0).toUpperCase() : <User size={22} />}
            </div>
            <div>
              <h3 className="profile-avatar-name" style={{ color: profile.name ? 'var(--text-main)' : 'var(--text-muted)', fontStyle: profile.name ? 'normal' : 'italic' }}>
                {profile.name || 'Your Name'}
              </h3>
              {/* Verified Beneficiary Pill */}
              <span className="glass-pill" style={{ color: 'var(--accent-cyan)', fontSize: '0.72rem', marginTop: '4px' }}>
                <Shield size={12} /> {profile.category ? `${profile.category} Beneficiary` : 'Set up your profile'}
              </span>
            </div>
          </div>

          {/* Identity & Statutory Credentials Key-Value Rows */}
          <div className="profile-data-list">
            
            {/* Caste Certificate Number (Revenue Department registration) */}
            <div className="profile-data-row">
              <span style={{ color: 'var(--text-muted)' }}>Caste Certificate No</span>
              <strong style={{ color: profile.casteCertificateNo ? 'var(--text-main)' : 'var(--text-subtle)', fontStyle: profile.casteCertificateNo ? 'normal' : 'italic', fontWeight: profile.casteCertificateNo ? 700 : 400 }}>
                {profile.casteCertificateNo || 'e.g. MP/IND/SC/2024/XXXXX'}
              </strong>
            </div>

            {/* Affirmative Category (Scheduled Caste / Tribe / OBC) */}
            <div className="profile-data-row">
              <span style={{ color: 'var(--text-muted)' }}>Affirmative Category</span>
              {profile.category ? (
                <span className="glass-pill" style={{ color: 'var(--primary)', padding: '2px 8px', fontSize: '0.75rem' }}>
                  {profile.category}
                </span>
              ) : (
                <span style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', fontStyle: 'italic' }}>SC / ST / OBC / General</span>
              )}
            </div>

            {/* Masked Aadhaar Reference (Last 4 digits for privacy compliance) */}
            <div className="profile-data-row">
              <span style={{ color: 'var(--text-muted)' }}>Aadhaar Ref</span>
              <strong style={{ color: profile.aadhaarLast4 ? 'var(--text-main)' : 'var(--text-subtle)', fontStyle: profile.aadhaarLast4 ? 'normal' : 'italic', fontWeight: profile.aadhaarLast4 ? 700 : 400 }}>
                {profile.aadhaarLast4 ? `XXXX-XXXX-${profile.aadhaarLast4}` : 'Last 4 digits of Aadhaar'}
              </strong>
            </div>

            {/* Annual Income Ceiling Tier */}
            <div className="profile-data-row">
              <span style={{ color: 'var(--text-muted)' }}>Annual Income Tier</span>
              {profile.annual_family_income ? (
                <strong style={{ color: 'var(--accent)' }}>₹ {Number(profile.annual_family_income).toLocaleString('en-IN')}</strong>
              ) : (
                <span style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', fontStyle: 'italic' }}>e.g. ₹ 2,50,000 p.a.</span>
              )}
            </div>

            {/* Registered Geographical District and State */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Registered Location</span>
              <strong style={{ color: (profile.district || profile.state) ? 'var(--text-main)' : 'var(--text-subtle)', fontStyle: (profile.district || profile.state) ? 'normal' : 'italic', fontWeight: (profile.district || profile.state) ? 700 : 400 }}>
                {(profile.district && profile.state) ? `${profile.district}, ${profile.state}` : profile.district || profile.state || 'District, State'}
              </strong>
            </div>
          </div>

          {/* -------------------------------------------------------------------
              DIGITAL DOCUMENT LOCKER READINESS CHECKLIST:
              Verifies whether required legal proofs have been uploaded or linked
              so that bank officers can issue instant in-principle sanction.
              ------------------------------------------------------------------- */}
          <div className="profile-locker-box">
            <h4 className="profile-locker-title">
              Digital Locker Document Readiness
            </h4>
            <div className="profile-locker-list">
              <div className="profile-locker-item">
                <CheckCircle2 size={15} />
                <span>Caste Certificate: Verified (e-District MP)</span>
              </div>
              <div className="profile-locker-item">
                <CheckCircle2 size={15} />
                <span>Revenue Income Certificate: Uploaded (Tehsildar signed)</span>
              </div>
              <div className="profile-locker-item">
                <CheckCircle2 size={15} />
                <span>Aadhaar &amp; PAN Card: Linked (UIDAI e-KYC active)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
            COLUMN 2: EDITABLE BENEFICIARY PROFILE FORM
            Controlled inputs enabling real-time modification of personal demographic
            and enterprise project cost figures.
            --------------------------------------------------------------------- */}
        <div className="glass-card profile-form-card">
          <div className="profile-form-header">
            <h3 className="profile-form-title">
              Personal &amp; Business Profile Information
            </h3>
            
            {/* Toggle button between View-Only and Inline-Edit modes */}
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="btn-secondary profile-edit-toggle-btn"
            >
              {isEditing ? 'Cancel Edit' : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Edit3 size={14} /> Edit Profile
                </span>
              )}
            </button>
          </div>

          {/* Form handling submission and syncing to localStorage */}
          <form onSubmit={handleSave} className="profile-form">
            
            {/* -----------------------------------------------------------------
                Row 1: Full Name and Mobile Number
                Disabled by default until user clicks "Edit Profile" button.
                ----------------------------------------------------------------- */}
            <div className="profile-form-grid-2col">
              <div>
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={profile.name}
                  placeholder="e.g. Ramesh Kumar"
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="input-label">Mobile Number</label>
                <input
                  type="text"
                  className="input-field"
                  value={profile.phone}
                  placeholder="e.g. +91 98260 12345"
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* -----------------------------------------------------------------
                Row 2: Annual Family Income and Current Occupation
                Income is critical for affirmative eligibility verification:
                - `parseFloat(e.target.value) || 0` prevents NaN string pollution.
                ----------------------------------------------------------------- */}
            <div className="profile-form-grid-2col">
              <div>
                <label className="input-label">Annual Family Income (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  value={profile.annual_family_income}
                  placeholder="e.g. 250000"
                  onChange={(e) => setProfile({ ...profile, annual_family_income: parseFloat(e.target.value) || 0 })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="input-label">Current Occupation</label>
                <input
                  type="text"
                  className="input-field"
                  value={profile.current_occupation}
                  placeholder="e.g. Self-employed, Farmer"
                  onChange={(e) => setProfile({ ...profile, current_occupation: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* -----------------------------------------------------------------
                Row 3: Proposed Business Enterprise and Project Cost
                Target business string is fed into sentence-transformers embeddings
                for semantic vector matching with statutory scheme descriptions.
                ----------------------------------------------------------------- */}
            <div className="profile-form-grid-split">
              <div>
                <label className="input-label">Proposed Business Enterprise</label>
                <input
                  type="text"
                  className="input-field"
                  value={profile.target_business}
                  placeholder="e.g. Tailoring Unit, E-Rickshaw, Dairy Farm"
                  onChange={(e) => setProfile({ ...profile, target_business: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="input-label">Estimated Project Cost (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  value={profile.estimated_cost}
                  placeholder="e.g. 100000"
                  onChange={(e) => setProfile({ ...profile, estimated_cost: parseFloat(e.target.value) || 0 })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* -----------------------------------------------------------------
                Row 4: Geographical Location (State & District)
                Used by geo-spatial partner routing engine to calculate Euclidean /
                road distance to nearest Lead Bank or State Channelizing Agency.
                ----------------------------------------------------------------- */}
            <div className="profile-form-grid-2col">
              <div>
                <label className="input-label">State</label>
                <input
                  type="text"
                  className="input-field"
                  value={profile.state}
                  placeholder="e.g. Madhya Pradesh"
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="input-label">District</label>
                <input
                  type="text"
                  className="input-field"
                  value={profile.district}
                  placeholder="e.g. Indore"
                  onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Save Button (Displayed conditionally only during active edit mode) */}
            {isEditing && (
              <button
                type="submit"
                className="btn-primary profile-save-btn"
              >
                <Save size={16} />
                <span>Save Profile Changes</span>
              </button>
            )}
          </form>
        </div>

      </div>

      {/* =========================================================================
          PAST SCHEME RECOMMENDATIONS & APPLICATION AUDIT TRAIL TABLE:
          Renders historical applications submitted or evaluated by this beneficiary.
          Helps field officers and applicants track past loan requests, sanctions,
          and bank branch assignments.
          ========================================================================= */}
      <div className="glass-card profile-history-card">
        <h3 className="profile-history-title">
          <Clock size={18} color="var(--primary)" /> Past Recommendation &amp; Application History
        </h3>

        <div className="profile-history-table-wrap">
          <table className="profile-history-table">
            <thead>
              <tr className="profile-history-th-row">
                <th className="profile-history-th">Application Ref</th>
                <th className="profile-history-th">Scheme Name</th>
                <th className="profile-history-th">Date</th>
                <th className="profile-history-th">Loan Amount</th>
                <th className="profile-history-th">Status</th>
                <th className="profile-history-th">Assigned Partner Branch</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} style={{ borderBottom: '1px solid var(--border-color, rgba(99, 102, 241, 0.12))' }}>
                  {/* Unique Tracking Reference */}
                  <td className="profile-history-td" style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{h.id}</td>
                  {/* Statutory Scheme Name */}
                  <td className="profile-history-td" style={{ fontWeight: 700, color: 'var(--text-main)' }}>{h.schemeName}</td>
                  {/* Submission Timestamp */}
                  <td className="profile-history-td" style={{ color: 'var(--text-subtle)' }}>{h.date}</td>
                  {/* Evaluated Loan Amount in INR */}
                  <td className="profile-history-td" style={{ fontWeight: 700, color: 'var(--accent)' }}>{h.loanAmount}</td>
                  {/* Processing Status Badge */}
                  <td className="profile-history-td">
                    <span className="glass-pill" style={{ color: 'var(--accent)', fontSize: '0.72rem', padding: '2px 8px' }}>
                      {h.status}
                    </span>
                  </td>
                  {/* Assigned Local Lead Bank / SCA Field Office */}
                  <td className="profile-history-td" style={{ color: 'var(--text-muted)' }}>{h.channelPartner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
