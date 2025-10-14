export type ChatMessage = {
  text: string
  isUser: boolean
  timestamp: Date
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
