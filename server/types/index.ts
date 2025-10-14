export interface ChatRequest {
  message: string
  userId?: string
  lang?: 'ar' | 'en'
}

export interface ChatResponse {
  reply: string
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

export interface OpenRouterResponse {
  choices: Array<{
    delta?: {
      content?: string
    }
    message?: {
      content?: string
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
  openRouterKey: string
  emailConfig?: EmailConfig
  supportEmail?: string
}
