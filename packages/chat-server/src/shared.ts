// ===================================
// CONSOLIDATED BACKEND SHARED CODE
// Merges: config + types + utils
// ===================================

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '../.env')
console.log('📂 Looking for .env at:', envPath)
const result = dotenv.config({ path: envPath })
if (result.error) {
  console.error('❌ Error loading .env:', result.error)
} else {
  console.log('✅ .env loaded successfully')
}

// ============ TYPES (from server/types/index.ts) ============

export type Language = 'ar' | 'en'

export interface ChatRequest {
  message: string
  userId?: string
  lang?: Language
  customerInfo?: {
    name: string
    phone: string
    email: string
  }
}

export interface ChatResponse {
  reply: string
  ui?: {
    blocks?: Array<
      | { type: 'text'; text: string }
      | { type: 'buttons'; text?: string; buttons: Array<{ text: string; value: string }> }
      | { type: 'card'; cardType: 'trip'; data: { dest: string; offer: any } }
      | { type: 'images'; urls: string[] }
      | { type: 'dateRange'; heading?: string; minDate?: string; maxDate?: string; label_ar?: string; label_en?: string; nights?: number }
      | { type: 'travellers'; heading?: string; min?: number; max?: number; default?: number; label_ar?: string; label_en?: string; options?: Array<{ value: number; label_ar: string; label_en: string; icon: string }> }
      | { type: 'destinations'; title?: string; categories?: Array<{ title: string; destinations: Array<{ id: string; name: string; name_en: string; emoji: string; image?: string }> }> }
      | { type: 'budget'; title_ar?: string; title_en?: string; ranges: Array<{ label_ar: string; label_en: string; min: number; max: number; icon: string; description_ar?: string; description_en?: string; popular?: boolean }> }
      | { type: 'hotelCards'; hotels: Array<{ hotel_id?: string; hotel_name_ar: string; hotel_name_en: string; priceEGP: number; priceUSD?: number; rating?: number; amenities?: string[]; description_ar?: string; description_en?: string; image?: string; area_ar?: string; area_en?: string }> }
      | { type: 'quickReplies'; title_ar?: string; title_en?: string; options: Array<{ label_ar: string; label_en: string; value: string; emoji?: string }> }
      | { type: 'hotelFilters'; title_ar?: string; title_en?: string; filters: { stars?: Array<{ value: number; label: string }>; mealPlans?: Array<{ value: string; label_ar: string; label_en: string }>; areas?: Array<{ value: string; label_ar: string; label_en: string }> } }
      | { type: 'mealPlans'; title_ar?: string; title_en?: string; options: Array<{ value: string; label_ar: string; label_en: string; icon: string; description_ar?: string; description_en?: string }> }
      | { type: 'roomTypes'; title_ar?: string; title_en?: string; options: Array<{ value: string; label_ar: string; label_en: string; icon: string; capacity?: number; description_ar?: string; description_en?: string }> }
      | { type: 'bookingSummary'; title_ar?: string; title_en?: string; data: { destination: string; hotel: string; mealPlan: string; roomType: string; travelers?: number; startDate?: string; endDate?: string; budget?: any }; actions?: Array<{ text_ar: string; text_en: string; value: string; variant?: string }> }
      | { type: 'contactInfo'; title_ar?: string; title_en?: string }
    >
  }
}

export interface SupportRequest {
  name?: string
  email?: string
  phone?: string
  message?: string
  userId?: string
  lang?: 'ar' | 'en'
}

export interface SupportResponse {
  ok: boolean
  error?: string
  message?: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

export interface EmailConfig {
  host: string
  port: number
  user: string
  pass: string
  secure: boolean
}

export interface ServerConfig {
  port: number
  model: string
  geminiKey: string
  emailConfig?: EmailConfig
  supportEmail?: string
}

// RAG types
export interface RAGChunk {
  id: string
  source: string
  destination?: string
  section?: string
  lang: 'ar' | 'en'
  title?: string
  text: string
  metadata?: {
    category?: 'hotels' | 'tours' | 'visa' | 'includes' | 'excludes' | 'general'
    hotels?: any[]
    tours?: any[]
    [key: string]: any
  }
}

export interface RAGQueryOptions {
  lang: 'ar' | 'en'
  limit?: number
}

export interface RAGResult {
  chunks: RAGChunk[]
}

// ============ CONFIG (from server/config/index.ts) ============

export const config: ServerConfig = {
  port: Number(process.env.PORT) || 9090,
  model: process.env.MODEL || 'gemini-2.0-flash-001',
  // Never hard-code API keys; require from environment
  geminiKey: process.env.GEMINI_KEY ?? '',
  supportEmail: process.env.SUPPORT_TO,
  emailConfig: process.env.SMTP_HOST ? {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    secure: false
  } : undefined
}

export const validateConfig = (): void => {
  if (!config.geminiKey) {
    console.warn('\n⚠️  WARNING: GEMINI_KEY is not set!')
    console.warn('   Please create a .env file in the root directory with:')
    console.warn('   GEMINI_KEY=your_api_key_here')
    console.warn('\n   Get your API key from: https://makersuite.google.com/app/apikey')
    console.warn('   Server will start with demo mode (limited functionality)\n')
    // Don't exit, just warn
  }
}

// ============ UTILS (from server/utils/index.ts) ============

// Server utilities
export const setupErrorHandlers = (): void => {
  process.on('unhandledRejection', (reason) => {
    console.error('⚠️  Unhandled Rejection:', reason)
    // Don't exit on unhandled rejection during development
  })

  process.on('uncaughtException', (err) => {
    console.error('⚠️  Uncaught Exception:', err)
    // Don't exit immediately - log and continue
  })
}

export const validateEnvironment = (): void => {
  const requiredEnvVars = ['GEMINI_KEY']
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`)
    process.exit(1)
  }
}

export const logServerStart = (port: number): void => {
  console.log(`🚀 Quick Air AI Agent running on http://localhost:${port}`)
}

// Server constants
export const SYSTEM_PROMPTS = {
  ar: `أنت مساعد لشركة Quick Air مختص بالسفر والطيران فقط.

السياسة:
- المجال المسموح: الرحلات، التأشيرات، العروض، الفنادق، وخدمات Quick Air.
- إذا كان السؤال خارج هذا المجال (مثل الرياضة أو الأخبار أو البرمجة): لا تجاوِب عن الموضوع، وردّ باختصار: "أنا متاح لمساعدتك في الرحلات، التأشيرات، العروض، والفنادق الخاصة بـ Quick Air."
- لا تستخدم عبارات عامة مثل: "سؤال لطيف"، "يعتمد"، "أنا هنا للمساعدة"، ولا تطرح أسئلة إلا إذا كنت تحتاج معلومة واحدة ضرورية لإكمال الطلب (مثال: تاريخ السفر أو الوجهة).
- اجعل الرد قصيرًا ومباشرًا (جملتان كحد أقصى) وبلا حشو.

معلومات مفيدة:
- أمثلة الأسعار والعروض تُذكر باختصار عند الطلب فقط.
- عند سؤال المستخدم عن الفنادق أو الرحلات، اذكر الخيارات والأسعار بشكل واضح بدون مقدمات.

إن كان الطلب خارج النطاق، استخدم الرد التحويلي القصير المذكور بالأعلى.`,

  en: `You are the Quick Air assistant. Scope is airline and travel only (flights, visas, offers, hotels, Quick Air services).

Policy:
- If the user asks about anything outside this scope (sports, politics, coding, etc.), do not answer that topic. Instead reply briefly: "I can help with flights, visas, offers, and hotels for Quick Air."
- Do not use filler like "That's a fun question", "It depends", or "I'm here to help". Do not ask questions unless one specific detail is required to proceed (e.g., travel date or destination).
- Keep answers short and direct (max 2 sentences) with no fluff.

When asked for hotels or flights, list options and prices concisely. If off-topic, use the short redirect line above.`
}

export const LANGUAGE_INSTRUCTIONS = {
  ar: 'أجب باللغة العربية الفصحى فقط في جميع الحالات، حتى لو كتب المستخدم بلغة أخرى. لا تستخدم الإنجليزية إطلاقًا، ولا تعتذر عن اللغة.',
  en: 'Always respond in English only, even if the user writes in another language. Do not use Arabic and do not apologize about language.'
}

export const LANGUAGE_SYSTEM_MESSAGES = {
  ar: 'اللغة: العربية. استخدم العربية الفصحى حصراً. لا تُدرج نصوصاً بلغات أخرى.',
  en: 'Language: English. Use English exclusively. Do not include other languages.'
}

export const EMAIL_TEMPLATES = {
  subject: {
    ar: 'طلب دعم عملاء - Quick Air',
    en: 'Quick Air - Customer Support Request'
  },
  
  generateHtml: (data: {
    userId: string
    name: string
    email: string
    phone: string
    message: string
  }) => `
    <h2>Quick Air - Customer Support Request</h2>
    <p><strong>User ID:</strong> ${data.userId}</p>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>Message:</strong></p>
    <p>${data.message.replace(/\n/g, '<br/>')}</p>
  `
}

export const API_ENDPOINTS = {
  GEMINI_CHAT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent',
  GEMINI_STREAM: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:streamGenerateContent'
} as const
