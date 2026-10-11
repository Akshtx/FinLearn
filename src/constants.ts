import { TabKey } from './types';

export const APP_NAME = "Finlearn AI";
export const APP_TAGLINE = "Your AI-Powered Stock Market Co-Pilot";

export const TABS_CONFIG = [
  { key: TabKey.SUMMARY, label: TabKey.SUMMARY },
  { key: TabKey.FUNDAMENTALS, label: TabKey.FUNDAMENTALS },
  { key: TabKey.NEWS, label: TabKey.NEWS },
];

export const GEMINI_TEXT_MODEL = (process.env.GEMINI_MODEL) || "gemini-3.6-flash";

export const GEMINI_TEXT_MODEL_FALLBACKS = [
  GEMINI_TEXT_MODEL,
  "gemini-3.8-flash",
  "gemini-2.5-flash",
];

export const MOCK_API_DELAY = 1000; // ms

export const BROKERS = [
  {
    name: 'Upstox',
    url: 'https://upstox.com/open-demat-account/',
  },
  {
    name: 'Groww',
    url: 'https://groww.in/',
  },
  {
    name: 'Angel One',
    url: 'https://www.angelone.in/login/',
  }
];