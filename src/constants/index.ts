import type { Language } from '../types'

export const WELCOME_MESSAGES: Record<Language, string> = {
  ar: "مرحباً! أنا مساعدك الذكي في Quick Air للطيران والسفر. كيف يمكنني مساعدتك اليوم؟",
  en: "Hello! I'm your Quick Air intelligent travel assistant. How can I help you today?"
}

export const SUGGESTION_CHIPS: Record<Language, string[]> = {
  ar: [
    'أفضل عروض الطيران اليوم',
    'متطلبات الفيزا إلى دبي',
    '٥ وجهات بميزانية محدودة',
  ],
  en: [
    'Best flight deals today',
    'Visa requirements for Dubai',
    '5 budget-friendly destinations',
  ]
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
    requestSent: '✅ تم إرسال طلبك إلى فريق الدعم. سنتواصل معك قريبًا.',
    requestFailed: '❌ تعذّر إرسال الطلب. حاول لاحقًا.'
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
    requestSent: '✅ Your request has been sent to support. We will contact you soon.',
    requestFailed: '❌ Failed to send request. Please try later.'
  }
}

export const API_ENDPOINTS = {
  CHAT_STREAM: 'http://localhost:3000/chat/stream',
  SUPPORT_REQUEST: 'http://localhost:3000/support/request'
} as const
