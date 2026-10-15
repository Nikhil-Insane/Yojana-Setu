/**
 * ==============================================================================
 * Model: UserProfile (MongoDB Mongoose Schema)
 * Path: backend-node/src/models/UserProfile.js
 * 
 * Purpose:
 * Stores beneficiary demographic profiles, certified caste credentials,
 * digital locker documents, and location parameters in MongoDB.
 * ==============================================================================
 */

'use strict';

const mongoose = require('mongoose');

const DigitalLockerDocSchema = new mongoose.Schema({
  docType: { type: String, required: true }, // e.g., 'Caste Certificate', 'Income Certificate', 'Aadhaar'
  docNumber: { type: String, default: '' },
  status: { type: String, enum: ['Verified', 'Pending', 'Uploaded', 'Missing'], default: 'Pending' },
  verified: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now },
  fileUrl: { type: String, default: '' },
}, { _id: false });

const UserProfileSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true, 
    default: 'default_beneficiary' 
  },
  name: { type: String, default: 'Beneficiary Applicant' },
  phone: { type: String, default: '+91 98260 12345' },
  aadhaarLast4: { type: String, default: '4892' },
  casteCertificateNo: { type: String, default: 'MP/IND/SC/2023/94102' },
  category: { 
    type: String, 
    enum: ['SC', 'ST', 'OBC', 'Minority', 'General', ''],
    default: 'SC' 
  },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other', ''],
    default: 'male' 
  },
  age: { type: Number, default: 32 },
  annual_family_income: { type: Number, default: 250000 },
  education: { type: String, default: 'Graduate' },
  current_occupation: { type: String, default: 'Self-employed' },
  state: { type: String, default: 'Madhya Pradesh' },
  district: { type: String, default: 'Indore' },
  latitude: { type: Number, default: 22.7196 },
  longitude: { type: Number, default: 75.8577 },
  preferred_language: { type: String, default: 'Hindi' },
  target_business: { type: String, default: 'Garment Tailoring & Boutique Unit' },
  estimated_cost: { type: Number, default: 100000 },
  business_experience_years: { type: Number, default: 2 },
  business_description: { type: String, default: 'Setting up an artisanal garment boutique and tailoring unit.' },
  digital_locker: {
    type: [DigitalLockerDocSchema],
    default: [
      { docType: 'Caste Certificate (SC/ST/OBC)', docNumber: 'MP/IND/SC/2023/94102', status: 'Verified', verified: true },
      { docType: 'Income Certificate (Revenue Auth)', docNumber: 'INC/IND/2024/0912', status: 'Verified', verified: true },
      { docType: 'Aadhaar Card (KYC)', docNumber: 'XXXX-XXXX-4892', status: 'Verified', verified: true },
      { docType: 'Detailed Project Report (DPR)', docNumber: 'DPR/GARMENT/2026', status: 'Uploaded', verified: false },
    ]
  },
}, {
  timestamps: true,
  collection: 'user_profiles',
});

module.exports = mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema);
