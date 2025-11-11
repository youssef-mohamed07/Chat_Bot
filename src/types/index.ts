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
  }
}

export type Language = 'ar' | 'en'

export type ContactInfo = {
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
