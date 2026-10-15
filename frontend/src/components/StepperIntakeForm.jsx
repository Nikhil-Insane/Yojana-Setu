/**
 * ==============================================================================
 * Component: StepperIntakeForm (4-चरणीय लाभार्थी पात्रता फॉर्म)
 * Path: frontend/src/components/StepperIntakeForm.jsx
 * 
 * Purpose:
 * Renders an accessible, 4-step wizard intake questionnaire for marginalized beneficiaries:
 * - Step 1: Personal Profile & Affirmative Category (Income, education, occupation, caste, gender, age)
 * - Step 2: Project & Credit Specifications (Loan purpose, trade sector, project cost, description)
 * - Step 3: Geographic Location & Language (State, district, GPS browser location, preferred language)
 * - Step 4: Verification Review (Final summary table before ML recommendation dispatch)
 * 
 * Accessibility Inclusions:
 * 1. Web Speech Synthesis TTS (Listen button narrating instructions in English or Hindi).
 * 2. Real-time English / Hindi multilingual language switcher toggle.
 * 3. Browser GPS Geolocation API to auto-pin latitude and longitude coordinates.
 * ==============================================================================
 */

import React, { useState } from 'react';
import { Volume2, MapPin, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, User, Briefcase, Globe, Check } from 'lucide-react';
import { speakText } from '../utils/speech';

export default function StepperIntakeForm({ onSubmit, initialData = null, onPrefillProfile }) {
  // ---------------------------------------------------------------------------
  // Wizard Navigation & Language State
  // ---------------------------------------------------------------------------
  // Current active step index (1, 2, 3, or 4)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Intake form language toggle ('en' for English, 'hi' for Hindi)
  const [formLang, setFormLang] = useState('en');
  
  // Geolocation detector loading state
  const [locating, setLocating] = useState(false);
  
  // Geolocation error feedback message
  const [locError, setLocError] = useState(null);

  // ---------------------------------------------------------------------------
  // Form Values (Initialized clean with placeholders instead of hardcoded defaults)
  // ---------------------------------------------------------------------------
  const [formData, setFormData] = useState(initialData || {
    name: '',
    age: '',
    gender: '',
    category: '',
    annual_family_income: '',
    education: '',
    current_occupation: '',
    loan_purpose: '',
    project_type: '',
    estimated_cost: '',
    business_experience_years: '',
    business_description: '',
    state: '',
    district: '',
    preferred_language: 'Hindi',
    latitude: null,
    longitude: null,
  });

  // ---------------------------------------------------------------------------
  // Multilingual UI Translation Dictionary
  // ---------------------------------------------------------------------------
  const t = {
    en: {
      schemeFinder: 'Scheme finder',
      step: 'Step',
      aboutYou: 'About you',
      yourProject: 'Your project',
      locationAndLang: 'Location and language',
      review: 'Review',
      nameLabel: 'Full Name',
      namePlaceholder: 'e.g. Ramesh Kumar',
      incomeLabel: 'Annual family income (₹)',
      incomePlaceholder: 'e.g. 250000',
      incomeLimit: 'Eligibility limit: up to ₹ 5 lakh a year.',
      educationLabel: 'Education status',
      occupationLabel: 'Current occupation',
      categoryLabel: 'Social Category',
      genderLabel: 'Gender',
      ageLabel: 'Age (Years)',
      agePlaceholder: 'e.g. 32',
      purposeLabel: 'What do you need the loan for',
      projectTypeLabel: 'Project type / Sector',
      costLabel: 'Estimated cost (₹)',
      costPlaceholder: 'e.g. 100000',
      experienceLabel: 'Trade Experience (Years)',
      expPlaceholder: 'e.g. 2',
      descLabel: 'Project Description / Notes',
      descPlaceholder: 'Briefly describe what machines, equipment, or goods you will buy...',
      stateLabel: 'State',
      districtLabel: 'District',
      districtPlaceholder: 'e.g. Indore, Bhopal, Varanasi, Pune...',
      useLocationBtn: 'Use my current location',
      locatingText: 'Detecting GPS location...',
      preferredLangLabel: 'Preferred language for explanation',
      backBtn: 'Back',
      nextBtn: 'Next',
      submitBtn: 'Get Recommendations',
      selectOne: 'Select one',
      summaryName: 'Applicant Name',
      summaryPurpose: 'Purpose',
      summaryCost: 'Estimated cost',
      summaryLocation: 'Location',
      summaryLang: 'Language',
      prefillBtn: 'Pre-fill from Profile',
    },
    hi: {
      schemeFinder: 'योजना खोजें',
      step: 'चरण',
      aboutYou: 'आपके बारे में',
      yourProject: 'आपका प्रोजेक्ट',
      locationAndLang: 'स्थान और भाषा',
      review: 'समीक्षा',
      nameLabel: 'पूरा नाम',
      namePlaceholder: 'उदा. रमेश कुमार',
      incomeLabel: 'वार्षिक पारिवारिक आय (₹)',
      incomePlaceholder: 'उदा. 250000',
      incomeLimit: 'पात्रता सीमा: प्रति वर्ष ₹ 5 लाख तक।',
      educationLabel: 'शैक्षणिक योग्यता',
      occupationLabel: 'वर्तमान व्यवसाय',
      categoryLabel: 'सामाजिक श्रेणी',
      genderLabel: 'लिंग',
      ageLabel: 'आयु (वर्ष)',
      agePlaceholder: 'उदा. 32',
      purposeLabel: 'आपको ऋण किस उद्देश्य के लिए चाहिए?',
      projectTypeLabel: 'प्रोजेक्ट का प्रकार / व्यवसाय',
      costLabel: 'अनुमानित लागत (₹)',
      costPlaceholder: 'उदा. 100000',
      experienceLabel: 'व्यवसाय में अनुभव (वर्ष)',
      expPlaceholder: 'उदा. 2',
      descLabel: 'प्रोजेक्ट का संक्षिप्त विवरण',
      descPlaceholder: 'उदा. सिलाई मशीन व कपड़ा सामग्री खरीदने हेतु...',
      stateLabel: 'राज्य',
      districtLabel: 'जिला',
      districtPlaceholder: 'उदा. इंदौर, भोपाल, वाराणसी, पुणे...',
      useLocationBtn: 'मेरे वर्तमान स्थान का उपयोग करें',
      locatingText: 'स्थान खोजा जा रहा है...',
      preferredLangLabel: 'योजना समझने हेतु पसंदीदा भाषा',
      backBtn: 'पीछे',
      nextBtn: 'आगे',
      submitBtn: 'सिफारिश पाएं',
      selectOne: 'एक चुनें',
      summaryName: 'आवेदक का नाम',
      summaryPurpose: 'उद्देश्य',
      summaryCost: 'अनुमानित लागत',
      summaryLocation: 'स्थान',
      summaryLang: 'भाषा',
      prefillBtn: 'प्रोफ़ाइल से विवरण भरें',
    }
  };

  const currT = t[formLang];

  /**
   * handleListenStep: Voice Narration using Web Speech Synthesis API.
   * Reads instructions out loud in the chosen language to assist semi-literate users.
   */
  const handleListenStep = () => {
    let textToSpeak = '';
    if (formLang === 'en') {
      if (currentStep === 1) {
        textToSpeak = `Step 1 of 4: About you. Please enter your name, annual family income, education status, and current occupation. Eligibility limit is up to five lakh rupees a year.`;
      } else if (currentStep === 2) {
        textToSpeak = `Step 2 of 4: Your project. Please select what you need the loan for, your project type such as tailoring or transport, and estimated project cost.`;
      } else if (currentStep === 3) {
        textToSpeak = `Step 3 of 4: Location and language. Please choose your state, district, or click use my current location, and select your preferred language.`;
      } else {
        textToSpeak = `Step 4 of 4: Review your application details. Family income: rupees ${formData.annual_family_income || 'not set'}, project cost: rupees ${formData.estimated_cost || 'not set'}, district: ${formData.district || 'not set'}. Click Get Recommendations to proceed.`;
      }
    } else {
      if (currentStep === 1) {
        textToSpeak = `चरण एक: आपके बारे में। कृपया अपना नाम, वार्षिक पारिवारिक आय, शिक्षा और वर्तमान व्यवसाय दर्ज करें। अनुसूचित जाति योजना की पात्रता सीमा 5 लाख रुपये प्रति वर्ष तक है।`;
      } else if (currentStep === 2) {
        textToSpeak = `चरण दो: आपका प्रोजेक्ट। कृपया बताएं आपको लोन किस कार्य के लिए चाहिए, प्रोजेक्ट का प्रकार क्या है और अनुमानित लागत कितनी है।`;
      } else if (currentStep === 3) {
        textToSpeak = `चरण तीन: स्थान और भाषा। कृपया अपना राज्य और जिला चुनें या जीपीएस से स्थान जोड़ें।`;
      } else {
        textToSpeak = `चरण चार: समीक्षा। आपके द्वारा भरे गए विवरण की जांच करें और सिफारिश पाएं बटन पर क्लिक करें।`;
      }
    }
    speakText(textToSpeak, formLang);
  };

  /**
   * handleGetLocation: HTML5 Geolocation API trigger + Reverse Geocoding via OSM Nominatim.
   * Fetches accurate GPS latitude and longitude coordinates and auto-detects district/state.
   */
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let detectedDistrict = '';
        let detectedState = '';

        try {
          // Reverse geocode via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            detectedDistrict = addr.state_district || addr.district || addr.city || addr.town || addr.county || '';
            detectedState = addr.state || '';
          }
        } catch (err) {
          console.warn('Reverse geocoding error:', err);
        }

        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
          district: detectedDistrict || prev.district || 'Local Area',
          state: detectedState || prev.state || 'Madhya Pradesh',
        }));
        setLocating(false);
      },
      (err) => {
        setLocError('Location access was denied or timed out. Please enter district manually.');
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  // Step advancement handlers
  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Final submission dispatch
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  // ---------------------------------------------------------------------------
  // Render JSX
  // ---------------------------------------------------------------------------
  return (
    <div className="stepper-card-wrapper">
      <div className="glass-card stepper-form-card" style={{ position: 'relative' }}>
        
        {/* ── Top Header: Title, Language Toggle & Voice Narration ── */}
        <div className="stepper-top-header">
          <div>
            <h2 className="stepper-title">
              <Sparkles size={20} color="var(--primary)" />
              {currT.schemeFinder}
            </h2>
          </div>

          <div className="stepper-header-right">
            {/* Language Switcher Button Group */}
            <div className="stepper-lang-group">
              <button
                type="button"
                onClick={() => setFormLang('en')}
                className={`stepper-lang-btn ${formLang === 'en' ? 'active' : ''}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setFormLang('hi')}
                className={`stepper-lang-btn ${formLang === 'hi' ? 'active' : ''}`}
              >
                हिन्दी
              </button>
            </div>

            {/* Audio Speech Narration Button */}
            <button
              type="button"
              onClick={handleListenStep}
              title="Listen to questions in current language"
              className="stepper-listen-btn"
            >
              <Volume2 size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Listen</span>
            </button>
          </div>
        </div>

        {/* ── 4-Step Stepper Progress Bar ── */}
        <div className="stepper-progress-track-row">
          {[1, 2, 3, 4].map((stepIdx) => {
            const isFilled = stepIdx <= currentStep;
            return (
              <div
                key={stepIdx}
                className={`stepper-progress-bar-segment ${isFilled ? 'filled' : ''}`}
              />
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          
          {/* ================= STEP 1: ABOUT YOU ================= */}
          {currentStep === 1 && (
            <div className="stepper-fields-stack">
              <div>
                <span className="stepper-step-badge">
                  {currT.step} 1 / 4
                </span>
                <h3 className="stepper-step-title">
                  {currT.aboutYou}
                </h3>
              </div>

              {/* Applicant Full Name */}
              <div>
                <label className="input-label">{currT.nameLabel}</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={currT.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Annual Family Income */}
              <div>
                <label className="input-label">{currT.incomeLabel}</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder={currT.incomePlaceholder}
                  value={formData.annual_family_income}
                  onChange={(e) => setFormData({ ...formData, annual_family_income: e.target.value })}
                  required
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                  {currT.incomeLimit}
                </p>
              </div>

              {/* Education Status */}
              <div>
                <label className="input-label">{currT.educationLabel}</label>
                <select
                  className="input-field"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                >
                  <option value="">-- Select Education Status --</option>
                  <option value="Graduate">Graduate (स्नातक)</option>
                  <option value="12th Pass">12th Pass (उच्चतर माध्यमिक)</option>
                  <option value="10th Pass">10th Pass (मैट्रिक)</option>
                  <option value="8th Pass">8th Pass (आठवीं पास)</option>
                  <option value="Technical / ITI">Technical / ITI / Diploma (तकनीकी)</option>
                  <option value="Post Graduate">Post Graduate (स्नातकोत्तर)</option>
                  <option value="No formal schooling">No formal schooling (कोई औपचारिक शिक्षा नहीं)</option>
                </select>
              </div>

              {/* Current Occupation */}
              <div>
                <label className="input-label">{currT.occupationLabel}</label>
                <select
                  className="input-field"
                  value={formData.current_occupation}
                  onChange={(e) => setFormData({ ...formData, current_occupation: e.target.value })}
                >
                  <option value="">-- Select Current Occupation --</option>
                  <option value="Self-employed">Self-employed (स्वरोजगार)</option>
                  <option value="Artisan / Craftsman">Artisan / Craftsman (कारीगर / दस्तकार)</option>
                  <option value="Daily wage worker">Daily wage worker (दैनिक वेतन भोगी)</option>
                  <option value="Agriculture / Farming">Agriculture / Farming (कृषि / डेयरी)</option>
                  <option value="Unemployed">Unemployed seeking business loan (बेरोजगार)</option>
                  <option value="Student">Student (विद्यार्थी)</option>
                </select>
              </div>

              {/* Category, Gender, Age Grid */}
              <div className="stepper-grid-3col">
                <div>
                  <label className="input-label">{currT.categoryLabel}</label>
                  <select
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">-- Select Category --</option>
                    <option value="SC">Scheduled Caste (SC)</option>
                    <option value="ST">Scheduled Tribe (ST)</option>
                    <option value="OBC">Other Backward Class (OBC)</option>
                    <option value="Minority">Notified Minority</option>
                    <option value="General">General / Other</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">{currT.genderLabel}</label>
                  <select
                    className="input-field"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">-- Select Gender --</option>
                    <option value="male">Male (पुरुष)</option>
                    <option value="female">Female (महिला - Special 4% Interest)</option>
                    <option value="other">Other / Transgender</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">{currT.ageLabel}</label>
                  <input
                    type="number"
                    min="18"
                    max="90"
                    placeholder={currT.agePlaceholder}
                    className="input-field"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: YOUR PROJECT ================= */}
          {currentStep === 2 && (
            <div className="stepper-fields-stack">
              <div>
                <span className="stepper-step-badge">
                  {currT.step} 2 / 4
                </span>
                <h3 className="stepper-step-title">
                  {currT.yourProject}
                </h3>
              </div>

              {/* Purpose of Loan */}
              <div>
                <label className="input-label">{currT.purposeLabel}</label>
                <select
                  className="input-field"
                  value={formData.loan_purpose}
                  onChange={(e) => setFormData({ ...formData, loan_purpose: e.target.value })}
                >
                  <option value="">-- Select Loan Purpose --</option>
                  <option value="Start or expand a business">Start or expand a business (नया व्यवसाय / विस्तार)</option>
                  <option value="Purchase commercial vehicle / E-rickshaw">Commercial Vehicle / E-Rickshaw (व्यावसायिक वाहन / ई-रिक्शा)</option>
                  <option value="Purchase machinery or equipment">Purchase machinery &amp; equipment (मशीनरी / उपकरण खरीद)</option>
                  <option value="Working capital">Working capital &amp; raw materials (कार्यशील पूंजी)</option>
                  <option value="Skill training & micro unit">Micro-Enterprise / Skill trade (सूक्ष्म उद्यम)</option>
                </select>
              </div>

              {/* Project Type / Industry Trade Sector */}
              <div>
                <label className="input-label">{currT.projectTypeLabel}</label>
                <select
                  className="input-field"
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                >
                  <option value="">-- Select Project Type / Trade Sector --</option>
                  <option value="Tailoring unit">Tailoring unit &amp; Boutique (सिलाई / बुटीक)</option>
                  <option value="Transport / E-Rickshaw">Transport &amp; E-Rickshaw (परिवहन / ई-रिक्शा)</option>
                  <option value="Kirana / Retail shop">Kirana &amp; Retail Store (किराना व खुदरा दुकान)</option>
                  <option value="Dairy / Animal Husbandry">Dairy &amp; Animal Husbandry (डेयरी व पशुपालन)</option>
                  <option value="Handloom & Handicrafts">Handloom, Weaving &amp; Artisans (हथकरघा व दस्तकारी)</option>
                  <option value="Mobile repair / Electronics">Mobile Repair &amp; Services (मरम्मत व सेवा)</option>
                  <option value="Food processing unit">Food Processing &amp; Catering (खाद्य प्रसंस्करण)</option>
                  <option value="Green / Solar business">Green Business &amp; Solar (सौर ऊर्जा व हरित व्यवसाय)</option>
                </select>
              </div>

              {/* Estimated Budget / Unit Cost */}
              <div>
                <label className="input-label">{currT.costLabel}</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder={currT.costPlaceholder}
                  step="10000"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                  required
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                  Micro finance up to ₹1.4 Lakh | Term loan up to ₹50 Lakh.
                </p>
              </div>

              {/* Trade Experience (Years) */}
              <div>
                <label className="input-label">{currT.experienceLabel}</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  placeholder={currT.expPlaceholder}
                  className="input-field"
                  value={formData.business_experience_years}
                  onChange={(e) => setFormData({ ...formData, business_experience_years: e.target.value })}
                />
              </div>

              {/* Project Description & Trade Notes */}
              <div>
                <label className="input-label">{currT.descLabel}</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={formData.business_description}
                  onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                  placeholder={currT.descPlaceholder}
                />
              </div>
            </div>
          )}

          {/* ================= STEP 3: LOCATION AND LANGUAGE ================= */}
          {currentStep === 3 && (
            <div className="stepper-fields-stack">
              <div>
                <span className="stepper-step-badge">
                  {currT.step} 3 / 4
                </span>
                <h3 className="stepper-step-title">
                  {currT.locationAndLang}
                </h3>
              </div>

              {/* State Selection */}
              <div>
                <label className="input-label">{currT.stateLabel}</label>
                <select
                  className="input-field"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                >
                  <option value="">-- Select State --</option>
                  <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
                  <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                  <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                  <option value="Rajasthan">Rajasthan (राजस्थान)</option>
                  <option value="Bihar">Bihar (बिहार)</option>
                  <option value="Gujarat">Gujarat (गुजरात)</option>
                  <option value="Tamil Nadu">Tamil Nadu (तमिलनाडु)</option>
                  <option value="Karnataka">Karnataka (कर्नाटक)</option>
                  <option value="Delhi">Delhi (दिल्ली)</option>
                  <option value="West Bengal">West Bengal (पश्चिम बंगाल)</option>
                  <option value="Odisha">Odisha (ओडिशा)</option>
                  <option value="Punjab">Punjab (पंजाब)</option>
                  <option value="Haryana">Haryana (हरियाणा)</option>
                  <option value="Telangana">Telangana (तेलंगाना)</option>
                  <option value="Andhra Pradesh">Andhra Pradesh (आंध्र प्रदेश)</option>
                  <option value="Kerala">Kerala (केरल)</option>
                  <option value="Jharkhand">Jharkhand (झारखंड)</option>
                  <option value="Chhattisgarh">Chhattisgarh (छत्तीसगढ़)</option>
                  <option value="Assam">Assam (असम)</option>
                </select>
              </div>

              {/* District Name */}
              <div>
                <label className="input-label">{currT.districtLabel}</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={currT.districtPlaceholder}
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                />
              </div>

              {/* Use My Current Location (GPS Geolocation Button) */}
              <div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  className="stepper-location-btn"
                  style={{ cursor: locating ? 'wait' : 'pointer' }}
                >
                  <MapPin size={18} />
                  <span>{locating ? currT.locatingText : currT.useLocationBtn}</span>
                </button>
                {locError && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '6px' }}>{locError}</p>
                )}
                {formData.latitude && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--accent)', marginTop: '4px' }}>
                    GPS Coordinates pinned: {formData.latitude.toFixed(4)}° N, {formData.longitude.toFixed(4)}° E
                    {formData.district ? ` (${formData.district}${formData.state ? `, ${formData.state}` : ''})` : ''}
                  </p>
                )}
              </div>

              {/* Preferred Multilingual Explanation Language */}
              <div>
                <label className="input-label">{currT.preferredLangLabel}</label>
                <select
                  className="input-field"
                  value={formData.preferred_language}
                  onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिन्दी (Hindi)</option>
                  <option value="Marathi">मराठी (Marathi)</option>
                  <option value="Tamil">தமிழ் (Tamil)</option>
                  <option value="Telugu">తెలుగు (Telugu)</option>
                  <option value="Bengali">বাংলা (Bengali)</option>
                </select>
              </div>
            </div>
          )}

          {/* ================= STEP 4: REVIEW / समीक्षा ================= */}
          {currentStep === 4 && (
            <div className="stepper-fields-stack">
              <div>
                <span className="stepper-step-badge">
                  {currT.step} 4 / 4
                </span>
                <h3 className="stepper-step-title">
                  {currT.review}
                </h3>
              </div>

              {/* Review Summary Confirmation Table */}
              <div className="stepper-review-table-box">
                <table className="stepper-review-table">
                  <tbody>
                    {formData.name && (
                      <tr className="stepper-review-row">
                        <td className="stepper-review-td-label">{currT.summaryName}</td>
                        <td className="stepper-review-td-val" style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                          {formData.name}
                        </td>
                      </tr>
                    )}
                    <tr className="stepper-review-row">
                      <td className="stepper-review-td-label">{currT.incomeLabel}</td>
                      <td className="stepper-review-td-val">
                        {formData.annual_family_income ? `₹ ${Number(formData.annual_family_income).toLocaleString('en-IN')}` : 'Not specified'}
                      </td>
                    </tr>
                    <tr className="stepper-review-row">
                      <td className="stepper-review-td-label">{currT.educationLabel}</td>
                      <td className="stepper-review-td-val">
                        {formData.education || 'Not specified'}
                      </td>
                    </tr>
                    <tr className="stepper-review-row">
                      <td className="stepper-review-td-label">{currT.occupationLabel}</td>
                      <td className="stepper-review-td-val">
                        {formData.current_occupation || 'Not specified'}
                      </td>
                    </tr>
                    <tr className="stepper-review-row">
                      <td className="stepper-review-td-label">{currT.summaryPurpose}</td>
                      <td className="stepper-review-td-val" style={{ color: 'var(--accent-cyan)' }}>
                        {formData.loan_purpose || 'Not specified'}
                      </td>
                    </tr>
                    <tr className="stepper-review-row">
                      <td className="stepper-review-td-label">{currT.projectTypeLabel}</td>
                      <td className="stepper-review-td-val">
                        {formData.project_type || 'Not specified'}
                      </td>
                    </tr>
                    <tr className="stepper-review-row">
                      <td className="stepper-review-td-label">{currT.summaryCost}</td>
                      <td className="stepper-review-td-val" style={{ color: 'var(--accent)' }}>
                        {formData.estimated_cost ? `₹ ${Number(formData.estimated_cost).toLocaleString('en-IN')}` : 'Not specified'}
                      </td>
                    </tr>
                    <tr className="stepper-review-row">
                      <td className="stepper-review-td-label">{currT.summaryLocation}</td>
                      <td className="stepper-review-td-val">
                        {formData.district || 'District not set'}{formData.state ? `, ${formData.state}` : ''}
                      </td>
                    </tr>
                    <tr>
                      <td className="stepper-review-td-label">{currT.summaryLang}</td>
                      <td className="stepper-review-td-val" style={{ color: 'var(--primary)' }}>
                        {formData.preferred_language || 'Hindi'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Stepper Navigation Buttons (Back, Next, Submit) ── */}
          <div className="stepper-footer-actions">
            {/* Back Button */}
            {currentStep > 1 ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleBack}
                style={{ padding: '10px 20px', borderRadius: '10px' }}
              >
                <ArrowLeft size={16} />
                <span>{currT.backBtn}</span>
              </button>
            ) : (
              <div></div>
            )}

            {/* Next or Submit Action */}
            {currentStep < 4 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
                style={{ padding: '10px 26px', borderRadius: '10px' }}
              >
                <span>{currT.nextBtn}</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary stepper-submit-btn"
              >
                <Sparkles size={18} />
                <span>{currT.submitBtn}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );

}
