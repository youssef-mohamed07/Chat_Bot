import type { Language } from '../types'

// Time formatting utility
export const formatTime = (date: Date, lang: Language): string => {
 return date.toLocaleTimeString(
 lang === 'ar' ? 'ar-EG' : 'en-US',
 { hour: '2-digit', minute: '2-digit', hour12: true }
 )
}

// User ID generation
export const generateUserId = (): string => {
 return 'user-' + Math.random().toString(36).substr(2, 9)
}

// Constants
export const WELCOME_MESSAGES: Record<Language, string> = {
 ar: "مرحباً! أنا مساعدك الذكي في Quick Air للطيران والسفر. كيف يمكنني مساعدتك اليوم؟",
 en: "Hello! I'm your Quick Air intelligent travel assistant. How can I help you today?"
}

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

export const API_ENDPOINTS = {
 CHAT_STREAM: 'http://localhost:9090/chat/stream',
 SUPPORT_REQUEST: 'http://localhost:9090/support/request'
} as const

// Re-exports for convenience
export { eventBus } from './eventBus'
export { applyTheme } from '../theme'