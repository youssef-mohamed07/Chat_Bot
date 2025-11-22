// ===================================
// CONSOLIDATED SHARED FRONTEND CODE
// Merges: types + utils + eventBus + theme + plugins
// ===================================

// ============ TYPES (from src/types/index.ts) ============

export type ChatMessage = {
  text: string
  isUser: boolean
  timestamp: Date
  meta?: {
    source?: 'json' | 'ai' | 'system'
    topic?: string
    card?: {
      type: 'trip'
      data: {
        dest: string
        offer: any
      }
    }
    images?: string[]
    buttons?: ButtonOption[]
    attachments?: Attachment[]
    // Structured widgets
    dateRange?: {
      heading?: string
      minDate?: string
      maxDate?: string
    }
    travellers?: {
      heading?: string
      min?: number
      max?: number
      default?: number
    }
    quickReplies?: {
      title_ar?: string
      title_en?: string
      options: Array<{ label_ar: string; label_en: string; value: string; emoji?: string }>
    }
    hotelFilters?: {
      title_ar?: string
      title_en?: string
      filters: {
        stars?: Array<{ value: number; label: string }>
        mealPlans?: Array<{ value: string; label_ar: string; label_en: string }>
        areas?: Array<{ value: string; label_ar: string; label_en: string }>
      }
    }
    mealPlans?: {
      title_ar?: string
      title_en?: string
      options: Array<{ value: string; label_ar: string; label_en: string; icon: string; description_ar?: string; description_en?: string }>
    }
    roomTypes?: {
      title_ar?: string
      title_en?: string
      options: Array<{ value: string; label_ar: string; label_en: string; icon: string; capacity?: number; description_ar?: string; description_en?: string }>
    }
    budget?: {
      title_ar?: string
      title_en?: string
      ranges: Array<{
        label_ar: string
        label_en: string
        min: number
        max: number
        icon: string
        description_ar?: string
        description_en?: string
        popular?: boolean
      }>
    }
    hotelCards?: {
      layout?: 'grid' | 'carousel'
      responsive?: {
        mobile?: { layout: 'carousel' | 'grid'; showCount?: number; columns?: number }
        tablet?: { layout: 'carousel' | 'grid'; columns?: number }
        desktop?: { layout: 'carousel' | 'grid'; columns?: number }
      }
      hotels: Array<{
        hotel_id?: string
        hotel_name_ar: string
        hotel_name_en: string
        priceEGP: number
        priceUSD?: number
        rating?: number
        amenities?: string[]
        description_ar?: string
        description_en?: string
        image?: string
        area_ar?: string
        lazy?: boolean
        area_en?: string
      }>
    }
    bookingSummary?: {
      title_ar?: string
      title_en?: string
      data: {
        destination: string
        hotel: string
        mealPlan: string
        roomType: string
        travelers?: number
        startDate?: string
        endDate?: string
        budget?: any
      }
      actions?: Array<{ text_ar: string; text_en: string; value: string; variant?: string }>
    }
    contactInfo?: {
      title_ar?: string
      title_en?: string
    }
  }
}

export type Language = 'ar' | 'en'

export type ContactInfo = {
  name: string
  phone: string
  email: string
}

export type ButtonOption = {
  text: string
  value: string
}

export type Attachment = {
  name: string
  size: number
  type: string
  previewUrl?: string
}

export type SupportRequest = {
  name: string
  email: string
  phone: string
  message: string
  userId: string
  lang: Language
}

export type SupportResponse = {
  ok: boolean
  error?: string
  message?: string
}

// ============ UTILITIES (from src/utils/index.ts) ============

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

// ============ EVENT BUS (from src/utils/eventBus.ts) ============

// Lightweight event bus for decoupled features (typing, notifications, uploads)
export type EventMap = {
  'typing:start': void
  'typing:stop': void
  'message:new': { role: 'user' | 'assistant'; text?: string }
  'notify': { title: string; body?: string }
  'attachments:add': { files: Array<{ name: string; size: number; type: string; previewUrl?: string }> }
}

type Handler<T> = (payload: T) => void

class EventBus {
  private listeners: Partial<Record<keyof EventMap, Set<Function>>> = {}

  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): () => void {
    if (!this.listeners[event]) this.listeners[event] = new Set()
    ;(this.listeners[event] as Set<Function>).add(handler as any)
    return () => this.off(event, handler)
  }

  off<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>) {
    (this.listeners[event] as Set<Function> | undefined)?.delete(handler as any)
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    (this.listeners[event] as Set<Function> | undefined)?.forEach(h => {
      try { (h as Handler<EventMap[K]>)(payload) } catch { /* noop */ }
    })
  }
}

export const eventBus = new EventBus()

// ============ THEME (from src/theme/index.ts) ============

export type ThemeVars = Partial<{
  '--brand-primary': string
  '--brand-secondary': string
  '--chat-user-bg': string
  '--chat-user-text': string
  '--chat-bot-bg': string
  '--chat-bot-text': string
  '--color-success': string
  '--color-warning': string
  '--color-error': string
  '--header-bg': string
  '--border-color': string
  '--text-primary': string
  '--text-secondary': string
  '--bg-primary': string
  '--bg-secondary': string
}>

export const defaultTheme: ThemeVars = {
  '--brand-primary': '#7A0C2E',
  '--brand-secondary': '#991B1B',
  '--chat-user-bg': '#f3f4f6',
  '--chat-user-text': '#374151',
  '--chat-bot-bg': '#7A0C2E',
  '--chat-bot-text': '#ffffff',
  '--color-success': '#059669',
  '--color-warning': '#d97706',
  '--color-error': '#dc2626',
  '--header-bg': '#991B1B',
  '--border-color': '#e5e7eb',
  '--text-primary': '#111827',
  '--text-secondary': '#6b7280',
  '--bg-primary': '#ffffff',
  '--bg-secondary': '#f9fafb',
}

export const applyTheme = (overrides?: ThemeVars) => {
  const vars = { ...defaultTheme, ...(overrides || {}) }
  const root = document.documentElement
  Object.entries(vars).forEach(([k, v]) => {
    if (v) root.style.setProperty(k, v)
  })
}

// ============ PLUGINS (from src/plugins/index.ts) ============

export interface ChatPluginContext {
  lang: Language
  setLang?: (l: Language) => void
  // Allow plugins to append messages
  pushMessage: (msg: ChatMessage) => void
}

export interface ChatPlugin {
  id: string
  init?(ctx: ChatPluginContext): void
  onUserMessage?(msg: ChatMessage, ctx: ChatPluginContext): Promise<void> | void
  onAssistantMessage?(msg: ChatMessage, ctx: ChatPluginContext): Promise<void> | void
  dispose?(): void
}

const registry: ChatPlugin[] = []

export const Plugins = {
  register(plugin: ChatPlugin) {
    if (!registry.find(p => p.id === plugin.id)) registry.push(plugin)
  },
  unregister(id: string) {
    const idx = registry.findIndex(p => p.id === id)
    if (idx >= 0) {
      try { registry[idx].dispose?.() } catch {}
      registry.splice(idx, 1)
    }
  },
  list(): ChatPlugin[] { return [...registry] },
}

export default Plugins
