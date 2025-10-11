import fetch from 'node-fetch'
import type { ChatMessage, OpenRouterResponse } from '../types/index.js'
import { config } from '../config/index.js'
import { API_ENDPOINTS, SYSTEM_PROMPTS, LANGUAGE_INSTRUCTIONS, LANGUAGE_SYSTEM_MESSAGES } from '../constants/index.js'

export class OpenRouterService {
  private readonly apiKey: string
  private readonly model: string

  constructor() {
    this.apiKey = config.openRouterKey
    this.model = config.model
  }

  async sendChatRequest(messages: ChatMessage[]): Promise<string> {
    const response = await fetch(API_ENDPOINTS.OPENROUTER_CHAT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.6,
        max_tokens: 700,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenRouter API Error: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json() as OpenRouterResponse
    return data.choices?.[0]?.message?.content || '❌ لم يتم الحصول على رد من الذكاء الاصطناعي.'
  }

  async sendStreamingRequest(messages: ChatMessage[]): Promise<NodeJS.ReadableStream> {
    const response = await fetch(API_ENDPOINTS.OPENROUTER_CHAT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.6,
        max_tokens: 700,
        stream: true,
      }),
    })

    if (!response.ok || !response.body) {
      throw new Error('Stream unavailable')
    }

    return response.body
  }

  buildMessages(message: string, history: ChatMessage[], lang: 'ar' | 'en'): ChatMessage[] {
    const systemPrompt = SYSTEM_PROMPTS[lang]
    const languageInstruction = LANGUAGE_INSTRUCTIONS[lang]
    const languageSystem = LANGUAGE_SYSTEM_MESSAGES[lang]

    return [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: languageInstruction },
      { role: 'system', content: languageSystem },
      ...history,
      { role: 'user', content: message },
    ]
  }
}
