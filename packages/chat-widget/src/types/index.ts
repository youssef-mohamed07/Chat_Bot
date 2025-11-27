// ===================================
// FRONTEND TYPES
// Client-side specific types
// ===================================

export * from './shared'

// ============ Frontend-Specific Message Type ============

export interface FrontendChatMessage {
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
    buttons?: Array<{ text: string; value: string }>
    attachments?: Array<{
      name: string
      size: number
      type: string
      previewUrl?: string
    }>
    // Structured widgets
    dateRange?: {
      heading?: string
      minDate?: string
      maxDate?: string
      label_ar?: string
      label_en?: string
      nights?: number
    }
    travellers?: {
      heading?: string
      min?: number
      max?: number
      default?: number
      label_ar?: string
      label_en?: string
      options?: Array<{ value: number; label_ar: string; label_en: string; icon: string }>
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
        area_en?: string
        lazy?: boolean
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
