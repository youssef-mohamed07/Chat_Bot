// ===================================
// FRONTEND CONFIGURATION
// App config and constants
// ===================================

// ============ App Config ============

// In development mode, use relative URLs to leverage Vite proxy
// In production, use the full API URL
const isDevelopment = import.meta.env.MODE === 'development'

export const APP_CONFIG = {
  API_BASE_URL: isDevelopment 
    ? '' // Use relative URLs in dev mode (Vite proxy will handle routing)
    : (import.meta.env.VITE_API_URL || 'http://localhost:9090'),
  APP_NAME: 'Quick Air Travel Assistant',
  VERSION: '1.0.0',
  WHATSAPP_NUMBER: '+201061469904'
} as const

// ============ API Endpoints ============

export const API_ENDPOINTS = {
  CHAT: `${APP_CONFIG.API_BASE_URL}/chat`,
  CHAT_STREAM: `${APP_CONFIG.API_BASE_URL}/chat/stream`,
  SUPPORT_REQUEST: `${APP_CONFIG.API_BASE_URL}/support/request`,
  DESTINATIONS: `${APP_CONFIG.API_BASE_URL}/destinations`,
  OFFERS: `${APP_CONFIG.API_BASE_URL}/offers`
} as const

// ============ Chat Config ============

export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 1000,
  TYPING_INDICATOR_DELAY: 300,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  AUTO_SCROLL_DELAY: 100
} as const

// Export all constants
export * from './constants.js'
