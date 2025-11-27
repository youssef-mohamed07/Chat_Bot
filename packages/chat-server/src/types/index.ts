// ===================================
// SERVER-SPECIFIC TYPES
// Backend-only types
// ===================================

export * from '@shared/types/index.js'

// ============ Gemini API Types ============

export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
        functionCall?: {
          name: string
          args: any
        }
      }>
    }
    finishReason?: string
  }>
  usageMetadata?: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
}

// ============ RAG Types ============

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

// ============ Session Types ============

export interface SessionMetadata {
  destination?: string
  dates?: { start: string; end: string }
  travelers?: number
  budget?: { min: number; max: number }
  hotel?: string
  mealPlan?: string
  roomType?: string
  customerInfo?: {
    name: string
    phone: string
    email: string
  }
  step?: string
  language?: 'ar' | 'en'
  [key: string]: any
}

export interface Session {
  userId: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  metadata: SessionMetadata
  createdAt: Date
  updatedAt: Date
}
