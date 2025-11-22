// ===================================
// FRONTEND UTILITIES
// Helper functions for frontend
// ===================================

import type { Language } from '@shared/types/index'

// ============ Time Formatting ============

export const formatTime = (date: Date, lang: Language): string => {
  return date.toLocaleTimeString(
    lang === 'ar' ? 'ar-EG' : 'en-US',
    { hour: '2-digit', minute: '2-digit', hour12: true }
  )
}

// ============ User ID Generation ============

export const generateUserId = (): string => {
  return 'user-' + Math.random().toString(36).substr(2, 9)
}

// ============ Validation ============

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  // Egyptian phone numbers: 01[0-2,5]\d{8} or international format
  const phoneRegex = /^(\+?20)?0?1[0125]\d{8}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

// ============ Language Detection ============

export const hasArabic = (text: string): boolean => {
  return /[\u0600-\u06FF]/.test(text)
}

export const detectLanguage = (text: string): Language => {
  return hasArabic(text) ? 'ar' : 'en'
}

// ============ String Utilities ============

export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
