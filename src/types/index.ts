export type MessageType = 'text' | 'buttons' | 'card' | 'quick_replies'

export type ChatMessage = {
  text: string
  isUser: boolean
  timestamp: Date
  type?: MessageType
  buttons?: ButtonOption[]
  card?: CardData
  quickReplies?: string[]
}

export type ButtonOption = {
  id: string
  text: string
  action: 'url' | 'postback' | 'phone' | 'email'
  value: string
  style?: 'primary' | 'secondary' | 'success' | 'danger'
}

export type CardData = {
  title: string
  subtitle?: string
  image?: string
  description?: string
  buttons?: ButtonOption[]
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
