# 🇮🇳 Yojana Setu (योजना सेतु)
### AI-Powered SC Welfare Scheme Recommender & Concessional Credit Platform

[![React](https://img.shields.io/badge/React-19.2+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2+-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/Python-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI%20Explanations-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-Random%20Forest-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Interactive%20Maps-199900?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 📌 Problem Statement

India's statutory welfare corporations — **NSFDC, NSTFDC, NBCFDC, NMDFC, KVIC, SIDBI, and MUDRA** — provide a rich set of concessional credit schemes and capital subsidies specifically for **Scheduled Caste (SC)**, **Scheduled Tribe (ST)**, **OBC**, **Minority**, and **Women entrepreneurs**. However, marginalized beneficiaries consistently face:

- **Information Asymmetry** — Scheme details scattered across multiple government portals
- **Complex Eligibility Rules** — Income ceilings, caste criteria, project cost caps, gender reservations
- **Documentation Confusion** — Unclear requirements for certificates, DPRs, KYC documents
- **No Personalized Guidance** — No system to tell a specific person *which* scheme fits *their* profile

**Yojana Setu** solves this by providing an intelligent, end-to-end platform that takes a beneficiary's profile and recommends the most suitable government welfare scheme with full AI explanations, EMI calculations, and nearest channel partner bank/SCA routing on an interactive map.

---

## ✨ Key Features

### 🎯 1. AI-Powered Scheme Matching (Random Forest ML)
- A **scikit-learn Random Forest Classifier** trained on 13,000+ statutory scheme records
- **Deterministic Eligibility Engine** evaluates income ceilings, caste category, gender, age, and project cost caps
- **TF-IDF Semantic Scoring** computes text similarity between the applicant's business description and scheme sector taxonomies
- **98.63% accuracy** on the scheme classification dataset

### 🤖 2. Google Gemini AI Plain-Language Explanations
- Integrates **Google Gemini API** (`gemini-3.8-flash`) to generate plain-language scheme explanations
- Supports **Hindi and English** with Text-to-Speech playback
- Explains *why* a scheme was recommended in simple, accessible language

### 📊 3. Interactive EMI & Moratorium Calculator
- Dynamic **loan amount slider** (₹20,000 – ₹1,00,00,000)
- **Tenure slider** (12 – 84 months) with live amortization calculations
- **Moratorium period** (0 – 12 months repayment holiday)
- Shows Monthly EMI, Total Interest, Total Payable, and Government Capital Subsidy benefit

### 🗺️ 4. Geospatial Channel Partner Routing (Leaflet Map)
- Interactive **Leaflet.js map** showing nearest eligible banks/SCAs to the applicant's location
- **GPS auto-detection** to find the user's current location
- **Geocoding** via OpenStreetMap Nominatim API to locate districts
- Color-coded map pins: Green (Eligible), Red (High NPA Risk)
- NPA Ratio health indicators for each partner branch

### 👤 5. Beneficiary Profile & Digital Locker
- Persistent beneficiary identity card with Aadhaar reference, caste certificate number, and income tier
- **localStorage-based profile** so repeat users skip data re-entry
- Application history audit trail
- One-click "Find Schemes with this Profile" pre-fills the entire intake form

### 📋 6. Interactive Document Checklist
- Generates a customized document checklist per scheme
- Interactive checkboxes to track readiness
- Covers Caste Certificate, Income Certificate, Aadhaar, PAN, Business Plan / DPR

### 📈 7. Analytics Dashboard
- Displays national program impact metrics
- Total schemes indexed, aggregate credit pool (₹ Crores)
- Beneficiary community breakdown charts
- Average interest rates and channel partner statistics

### 🌐 8. Multilingual & Accessible UI
- Supports **6 Indian languages**: English, Hindi, Marathi, Tamil, Telugu, Bengali
- **Dark/Light theme** toggle with glassmorphism design
- **Text-to-Speech** for AI explanations in Hindi and English

---

## 🏛️ Government Schemes Covered (16 Statutory Schemes)

| Corporation | Scheme Name | Target Beneficiary | Max Loan | Interest Rate |
| :--- | :--- | :--- | :--- | :--- |
| **NSFDC** | Micro Finance Scheme (MFS) | SC Entrepreneurs | ₹1.40 Lakh | 6.5% p.a. |
| **NSFDC** | Mahila Samriddhi Yojana (MSY) | SC Women | ₹1.40 Lakh | **4.0% p.a.** |
| **NSFDC** | Term Loan (TL) | SC Entrepreneurs | ₹50 Lakh | 8.0% p.a. |
| **NSFDC** | Udyam Nidhi Yojana (UNY) | SC Entrepreneurs | ₹5 Lakh | 13.0% p.a. |
| **NSFDC** | Green Business Scheme (GBS) | SC (E-vehicle/Solar) | ₹30 Lakh | 6.0% p.a. |
| **NSFDC** | Aajeevika Micro-Finance (AMY) | SC (NBFC-MFI) | ₹1.40 Lakh | 15.0% p.a. |
| **NSTFDC** | Term Loan Scheme | ST Entrepreneurs | ₹50 Lakh | 6.0% p.a. |
| **NSTFDC** | Adivasi Mahila Sashaktikaran (AMES) | ST Women | ₹2 Lakh | **4.0% p.a.** |
| **NBCFDC** | General Loan Scheme (GLS) | OBC (Non-Creamy Layer) | ₹15 Lakh | 7.0% p.a. |
| **NBCFDC** | New Swarnima Scheme | OBC Women | ₹2 Lakh | **5.0% p.a.** |
| **NMDFC** | Term Loan | Minority Entrepreneurs | ₹30 Lakh | 6.0% p.a. |
| **NMDFC** | Virasat Scheme | Minority Artisans | ₹10 Lakh | 4.5% p.a. |
| **MSME/KVIC** | PMEGP | All Categories (35% Subsidy) | ₹50 Lakh | 8.5% p.a. |
| **MSME** | PM Vishwakarma Scheme | 18 Artisan Trades | ₹3 Lakh | **5.0% (Collateral-Free)** |
| **SIDBI/DFS** | Stand-Up India | SC/ST/Women Greenfield | ₹1 Crore | 9.25% p.a. |
| **MUDRA** | Pradhan Mantri MUDRA (PMMY) | Micro Units | ₹10 Lakh | 9.5% p.a. |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER (Browser)                                   │
│         http://localhost:5173  (React + Vite Frontend)              │
│                                                                     │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ 4-Step   │  │ Scheme    │  │ Profile  │  │  Analytics       │  │
│  │ Intake   │  │ Results + │  │ Manager  │  │  Dashboard       │  │
│  │ Wizard   │  │ EMI Calc  │  │ & Locker │  │  & Landing       │  │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └──────────────────┘  │
└───────┼──────────────┼─────────────┼────────────────────────────────┘
        │  (Vite Proxy /api → :8000)  │
        ▼                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│               Node.js + Express Backend  (:8000)                    │
│                                                                     │
│  POST /api/match        →  Eligibility Engine + TF-IDF Scorer       │
│  GET  /api/schemes      →  Scheme CRUD & Analytics                  │
│  POST /api/explain      →  Google Gemini AI Explanation             │
│  GET/POST /api/profile  →  Beneficiary Profile & Search History     │
│                                                                     │
│  ┌────────────────────┐    ┌───────────────────────────────────┐   │
│  │ Eligibility Engine │    │  TF-IDF Semantic Scorer           │   │
│  │ (Statutory Rules:  │    │  (Business ↔ Scheme text match)   │   │
│  │  Income, Caste,    │    └───────────────┬───────────────────┘   │
│  │  Gender, Age, Cost)│                    │                        │
│  └────────────────────┘                    │ (optional)             │
│                                            ▼                        │
│                               ┌────────────────────────┐           │
│                               │ Python FastAPI ML       │           │
│                               │ Microservice (:5000)    │           │
│                               │ Random Forest Classifier│           │
│                               │ (scikit-learn + joblib) │           │
│                               └────────────────────────┘           │
│                                                                     │
│  ┌──────────────────────┐    ┌───────────────────────────────────┐ │
│  │ Google Gemini API    │    │ MongoDB (mongoose)                 │ │
│  │ (AI Explanations)    │    │ - schemes collection (16 schemes)  │ │
│  │ gemini-3.8-flash     │    │ - userprofiles collection          │ │
│  └──────────────────────┘    │ - schemesearches collection        │ │
│                               └───────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow (Step-by-Step):
1. **User fills the 4-step intake form** → Name, Category, Income, Business Type, State, District
2. **Frontend POSTs to `/api/match`** via Vite proxy (→ Node.js backend on port 8000)
3. **Node.js Eligibility Engine** runs deterministic checks (income ceiling, caste, gender, age, project cost)
4. **TF-IDF Scorer** computes semantic similarity between user's business description and each scheme
5. **Python Random Forest Microservice** (`:5000`) is called for ML-based ranking (Node.js falls back to built-in decision tree if Python is offline)
6. **Google Gemini API** generates a plain-language explanation in Hindi or English
7. **Results returned** with: top matched scheme, confidence score, EMI calculator data, document checklist, and nearest channel partners

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 19, Vite 8 | Single-page application, hot reload |
| **UI Components** | Lucide React, React Markdown | Icons, markdown rendering |
| **Styling** | Vanilla CSS, Glassmorphism | Dark/Light themes, animations |
| **Mapping** | Leaflet.js 1.9, OpenStreetMap | Interactive geospatial partner map |
| **Backend API** | Node.js, Express 5 | REST API server |
| **Database** | MongoDB, Mongoose | Scheme storage, user profiles, search logs |
| **AI Explanations** | Google Gemini API (`gemini-3.8-flash`) | Plain-language scheme explanations |
| **ML Matching** | Python, FastAPI, scikit-learn | Random Forest scheme classifier |
| **ML Data Processing** | pandas, joblib, NumPy | Model training, feature engineering |
| **Text Matching** | TF-IDF (Node.js implementation) | Business description to scheme semantic scoring |
| **Geocoding** | OpenStreetMap Nominatim API | District/city location lookup |
| **Speech** | Web Speech API (browser-native) | Hindi/English Text-to-Speech |
| **Environment** | dotenv | Secrets management |
| **Deployment** | Render (backend), Vercel/Render (frontend) | Cloud deployment |

---

## 📂 Project Structure

```
yojana-setu/
│
├── README.md                          # This documentation
├── start.sh                           # Unified startup script (Linux/macOS)
├── .gitignore                         # Git exclusions (node_modules, .env, __pycache__)
│
├── frontend/                          # React 19 + Vite Frontend
│   ├── package.json                   # Node.js dependencies
│   ├── vite.config.js                 # Vite config + /api proxy to :8000
│   ├── index.html                     # HTML entry point
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── main.jsx                   # React app entry point
│       ├── App.jsx                    # Root component, theme & routing
│       ├── index.css                  # Imports design system CSS
│       ├── components/
│       │   ├── Navbar.jsx             # Top navigation bar (language, theme, profile)
│       │   ├── LandingHeader.jsx      # Hero section + statistics + CTA
│       │   ├── SchemeMatcher.jsx      # Core intake form orchestrator
│       │   ├── StepperIntakeForm.jsx  # 4-step beneficiary data collection wizard
│       │   ├── SchemeResultsView.jsx  # 3-column results: scheme + EMI + map
│       │   ├── ChannelPartnerMap.jsx  # Leaflet map with geocoding & GPS
│       │   ├── UserProfileManager.jsx # Beneficiary profile card & digital locker
│       │   ├── AnalyticsDashboard.jsx # National scheme impact metrics
│       │   └── SiteFooter.jsx         # Footer with links
│       ├── css/
│       │   ├── style.css              # Main design system (tokens, glassmorphism)
│       │   └── leaflet-map.css        # Map-specific theme styles
│       └── utils/
│           ├── speech.js              # Web Speech API TTS wrapper
│           └── useOnlineStatus.js     # Online/offline detection hook
│
├── backend-node/                      # Node.js + Express Backend
│   ├── package.json                   # Node.js dependencies
│   ├── .env.example                   # Environment variables template
│   └── src/
│       ├── index.js                   # Express server entry point (port 8000)
│       ├── db/
│       │   ├── mongodb.js             # Mongoose connection manager
│       │   └── seed.js                # Seeds 16 statutory schemes into MongoDB
│       ├── models/
│       │   ├── Scheme.js              # MongoDB scheme schema
│       │   ├── UserProfile.js         # Beneficiary profile schema
│       │   └── SchemeSearch.js        # Search audit log schema
│       ├── routes/
│       │   ├── matching.js            # POST /api/match (eligibility + ML + Gemini)
│       │   ├── schemes.js             # GET /api/schemes (CRUD + analytics)
│       │   └── profile.js             # GET/POST /api/profile
│       ├── services/
│       │   ├── eligibility.js         # Deterministic statutory rule engine
│       │   ├── gemini.js              # Google Gemini API client
│       │   └── randomForest.js        # Python ML microservice HTTP client
│       ├── ai/
│       │   └── retriever.js           # TF-IDF semantic scorer
│       └── ml/
│           └── rf_model_export.json   # Exported Random Forest model (JSON fallback)
│
├── backend/                           # Python FastAPI ML Microservice
│   ├── main.py                        # FastAPI server (port 5000)
│   ├── train_rf.py                    # Random Forest model training script
│   ├── scraper_dataset.py             # Dataset scraping & preparation
│   ├── requirements.txt               # Python dependencies
│   └── .env.example
│
└── data/                              # Scheme Dataset Files
    ├── schemes_dataset.csv            # 13,000+ scheme training records
    ├── schemes_dataset.json           # JSON version of scheme dataset
    ├── schemes_training_dataset.csv   # Cleaned ML training data
    ├── rf_metrics.json                # Random Forest accuracy metrics
    └── documents/                     # Official scheme source documents
        ├── nsfdc.json
        ├── nstfdc.json
        ├── nbcfdc.json
        └── nmdfc.json
```

---

## 🚀 Running Locally

This project has **two servers** that must run simultaneously in separate terminals, plus MongoDB running as a service.

### Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org/)
- **Python** 3.9+ — [Download](https://www.python.org/)
- **MongoDB** — [Download Community Edition](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **Git** — [Download](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/yojana-setu.git
cd yojana-setu
```

### Step 2: Configure Environment Variables

```bash
# Copy the backend environment template
copy backend-node\.env.example backend-node\.env
```

Edit `backend-node/.env` and fill in your values:

```env
PORT=8000
CORS_ORIGINS=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/yojana_setu
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```

> Get a free Gemini API key from: https://aistudio.google.com/apikey

### Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 4: Install Backend Dependencies

```bash
cd ..\backend-node
npm install
```

---

### ▶️ Running the Application

#### Terminal 1 — Start the Node.js Backend

```bash
cd backend-node
npm run dev
```

Expected output:
```
🚀 Yojana Setu Backend running on http://localhost:8000
🍃 MongoDB Connected: 127.0.0.1:27017/yojana_setu
📦 MongoDB is empty. Seeding initial 16 statutory schemes...
```

#### Terminal 2 — Start the React Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v8.2.2  ready in 330 ms
  ➜  Local:   http://localhost:5173/
```

#### Terminal 3 — Start the Python ML Service (Optional)

The Node.js backend has a built-in fallback if Python is offline. Only needed for full Random Forest predictions.

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 5000
```

#### Open in Browser

```
http://localhost:5173
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health check (MongoDB + Gemini status) |
| `GET` | `/api/schemes` | List all 16 statutory schemes |
| `GET` | `/api/schemes/analytics` | Aggregate statistics and impact metrics |
| `POST` | `/api/match` | Match applicant profile → ranked scheme recommendations |
| `POST` | `/api/explain` | Google Gemini AI explanation for a welfare topic |
| `GET` | `/api/profile` | Retrieve saved beneficiary profiles |
| `POST` | `/api/profile` | Save or update a beneficiary profile |

### Example: Scheme Match Request

```bash
curl -X POST http://localhost:8000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Sharma",
    "age": 27,
    "gender": "female",
    "category": "SC",
    "annual_family_income": 250000,
    "state": "Madhya Pradesh",
    "district": "Indore",
    "project_cost": 100000,
    "business_type": "tailoring"
  }'
```

### Example Response:

```json
{
  "topMatch": {
    "scheme_name": "Mahila Samriddhi Yojana (MSY)",
    "corporation": "NSFDC",
    "confidence": 94.7,
    "interest_rate": 4.0,
    "max_loan": 140000,
    "explanation_en": "This scheme is ideal for you as an SC woman entrepreneur...",
    "explanation_hi": "यह योजना आपके लिए सर्वोत्तम है..."
  }
}
```

---

## 🔐 Environment Variables Reference

| Variable | Required | Description |
| :--- | :--- | :--- |
| `PORT` | No | Backend server port (default: `8000`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI explanations |
| `GEMINI_MODEL` | No | Gemini model to use (default: `gemini-3.8-flash`) |
| `CORS_ORIGINS` | No | Allowed frontend origins (default: `http://localhost:5173`) |
| `ML_SERVICE_URL` | No | Python ML microservice URL (default: `http://127.0.0.1:5000/predict`) |

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## 🛡️ Security & Privacy

- `.env` files are excluded from git via `.gitignore` — API keys are never committed
- No user PII is stored permanently without explicit consent
- Gemini API calls are made server-side (backend), never from the browser
- MongoDB stores only scheme data and voluntary profile information

---

## 👨‍💻 Author

**Nikhil Kumar**
3rd Year Minor Project — AI-Powered Government Scheme Recommender for Marginalized Entrepreneurs

---

## 📄 License

This project is licensed under the **MIT License**.
