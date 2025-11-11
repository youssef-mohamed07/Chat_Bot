export type Language = 'ar' | 'en'

export interface ChatRequest {
  message: string
  userId?: string
  lang?: Language
}

export interface ChatResponse {
  reply: string
  ui?: {
    blocks?: Array<
      | { type: 'text'; text: string }
      | { type: 'buttons'; text?: string; buttons: Array<{ text: string; value: string }> }
      | { type: 'card'; cardType: 'trip'; data: { dest: string; offer: any } }
      | { type: 'images'; urls: string[] }
      | { type: 'dateRange'; heading?: string; minDate?: string; maxDate?: string }
      | { type: 'travellers'; heading?: string; min?: number; max?: number; default?: number }
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

