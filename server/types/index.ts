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

