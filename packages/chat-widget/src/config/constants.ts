// ===================================
// FRONTEND CONSTANTS
// Labels, messages, and static data
// ===================================

import type { Language } from '../types'

// ============ Welcome Messages ============

export const WELCOME_MESSAGES: Record<Language, string> = {
  ar: "مرحباً! أنا مساعدك الذكي في Quick Air للطيران والسفر. كيف يمكنني مساعدتك اليوم؟",
  en: "Hello! I'm your Quick Air intelligent travel assistant. How can I help you today?"
}

// ============ Placeholders ============

export const PLACEHOLDERS: Record<Language, Record<string, string>> = {
  ar: {
    message: 'اكتب رسالتك...',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    issue: 'اكتب مشكلتك أو استفسارك'
  },
  en: {
    message: 'Type your message...',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    issue: 'Describe your issue or request'
  }
}

// ============ Labels ============

export const LABELS: Record<Language, Record<string, string>> = {
  ar: {
    chooseLanguage: 'اختر لغتك',
    youCanChangeLater: 'يمكنك تغييرها لاحقاً',
    requiredToContinue: 'مطلوب للمتابعة',
    onlineTravelAssistant: 'متصل • مساعد السفر',
    needSupport: 'تحتاج مساعدة من موظف الدعم؟ اضغط هنا',
    customerSupportRequest: 'طلب دعم عملاء',
    sending: 'جارٍ الإرسال...',
    send: 'إرسال',
    requestSent: ' تم إرسال رسالتك إلى فريق الدعم. سيتواصل معك أحد موظفي الدعم قريباً.',
    requestFailed: ' تعذّر إرسال الرسالة إلى فريق الدعم. حاول لاحقًا.',
    contactInfo: 'معلومات التواصل',
    contactDescription: 'نحتاج معلوماتك للتواصل معك بشكل أفضل',
    phoneNumber: 'رقم الهاتف',
    emailAddress: 'البريد الإلكتروني',
    continue: 'متابعة',
    secureInfo: 'معلوماتك آمنة ومحمية',
    phoneRequired: 'رقم الهاتف مطلوب',
    emailRequired: 'البريد الإلكتروني مطلوب',
    invalidPhone: 'رقم هاتف غير صحيح',
    invalidEmail: 'بريد إلكتروني غير صحيح'
  },
  en: {
    chooseLanguage: 'Choose your language',
    youCanChangeLater: 'You can change it later',
    requiredToContinue: 'Required to continue',
    onlineTravelAssistant: 'Online • Travel Assistant',
    needSupport: 'Need help from a human agent? Click here',
    customerSupportRequest: 'Customer Support Request',
    sending: 'Sending...',
    send: 'Send',
    requestSent: ' Your message has been sent to our support team. A support agent will contact you soon.',
    requestFailed: ' Failed to send message to support team. Please try later.',
    contactInfo: 'Contact Information',
    contactDescription: 'We need your contact info to serve you better',
    phoneNumber: 'Phone Number',
    emailAddress: 'Email Address',
    continue: 'Continue',
    secureInfo: 'Your information is safe and secure',
    phoneRequired: 'Phone number is required',
    emailRequired: 'Email is required',
    invalidPhone: 'Invalid phone number',
    invalidEmail: 'Invalid email address'
  }
}

// ============ App Configuration ============

// Default configuration - can be overridden via props
export const APP_CONFIG = {
  API_BASE_URL: '', // Will be set via props
  DEFAULT_LANG: 'ar' as Language,
  STORAGE_KEY_PREFIX: 'quickair_chat_'
}

// API Endpoints - will be resolved with the provided baseURL
export const getApiEndpoints = (baseURL: string) => ({
  CHAT: `${baseURL}/chat`,
  SUPPORT_REQUEST: `${baseURL}/support/request`,
  DESTINATIONS: `${baseURL}/destinations`,
  OFFERS: `${baseURL}/offers`
})