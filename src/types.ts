// ============================================================================
// CosmicInsight — Shared Type Definitions
// ============================================================================

export type Language = 'en' | 'hi';

export type ServiceType = 'astrology' | 'numerology';

export type Severity = 'none' | 'low' | 'moderate' | 'high';

// ----------------------------------------------------------------------------
// Astrology / Kundli
// ----------------------------------------------------------------------------
export interface BasicDetails {
  name: string;
  dateOfBirth: string; // human readable
  timeOfBirth: string;
  placeOfBirth: string;
}

export interface Dosha {
  name: string;          // e.g. "Mangal Dosha (Manglik)"
  present: boolean;
  severity: Severity;
  description: string;
  remedy: string;
}

export interface Dasha {
  mahadasha: string;     // ruling planet of the major period
  antardasha: string;    // ruling planet of the sub-period
  startDate: string;
  endDate: string;
  summary: string;
}

export interface Prediction {
  domain: 'Career' | 'Wealth' | 'Love' | 'Health';
  outlook: string;       // narrative
  rating: number;        // 1-5
}

export interface Remedy {
  title: string;
  description: string;
  category: 'Gemstone' | 'Mantra' | 'Ritual' | 'Lifestyle' | 'Charity';
}

export interface KundliAnalysis {
  basicDetails: BasicDetails;
  ascendant: string;     // Lagna
  moonSign: string;      // Rashi
  sunSign: string;
  nakshatra: string;
  doshas: Dosha[];
  currentDasha: Dasha;
  predictions: Prediction[];
  remedies: Remedy[];
  summary: string;       // overall reading
}

// ----------------------------------------------------------------------------
// Soulmate (text-only, descriptive — no images anywhere)
// ----------------------------------------------------------------------------
export interface SoulmateProfile {
  natureAndPersonality: string;
  coreValues: string[];
  likelyBackground: string;
  howYouMayMeet: string;
  compatibilityNotes: string;
  timingHint: string;
}

// ----------------------------------------------------------------------------
// Numerology
// ----------------------------------------------------------------------------
export interface NumerologyNumber {
  key: 'lifePath' | 'destiny' | 'soulUrge' | 'personality' | 'birthday';
  label: string;
  value: number;
  isMaster: boolean;
  meaning: string;
}

export interface NumerologyAnalysis {
  fullName: string;
  dateOfBirth: string;
  numbers: NumerologyNumber[];
  summary: string;
  luckyNumbers: number[];
  favorableColors: string[];
}

// ----------------------------------------------------------------------------
// Chat
// ----------------------------------------------------------------------------
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ----------------------------------------------------------------------------
// Saved reports (Firestore)
// ----------------------------------------------------------------------------
export interface SavedReport {
  id: string;
  type: ServiceType;
  title: string;
  createdAt: number; // epoch ms
  kundli?: KundliAnalysis;
  numerology?: NumerologyAnalysis;
  simulated: boolean;
}

// ----------------------------------------------------------------------------
// App navigation
// ----------------------------------------------------------------------------
export type View =
  | 'landing'
  | 'select'
  | 'upload'
  | 'numerology-input'
  | 'billing'
  | 'dashboard'
  | 'numerology'
  | 'history';
