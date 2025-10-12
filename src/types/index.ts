export type ChatMessage = {
  text: string
  isUser: boolean
  timestamp: Date
}

export type Language = 'ar' | 'en'

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
  whatsappLink?: string
  message?: string
}

export type ChatStreamResponse = {
  choices: Array<{
    delta?: {
      content?: string
    }
    message?: {
      content?: string
    }
  }>
}
