import fetch from 'node-fetch'
import type { ChatMessage, OpenRouterResponse } from '../types/index.js'
import { config } from '../config/index.js'
import { API_ENDPOINTS, SYSTEM_PROMPTS, LANGUAGE_INSTRUCTIONS, LANGUAGE_SYSTEM_MESSAGES } from '../utils/index.js'

export class OpenRouterService {
  private readonly apiKey: string
  private readonly model: string

  constructor() {
    this.apiKey = config.openRouterKey
    this.model = config.model
  }

  async sendChatRequest(messages: ChatMessage[]): Promise<string> {
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      return this.getDemoResponse(messages)
    }

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
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      return this.getDemoStreamingResponse(messages)
    }

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

  private getDemoResponse(messages: ChatMessage[]): string {
    const lastMessage = messages[messages.length - 1]?.content || ''
    const lowerMessage = lastMessage.toLowerCase()
    
    const isArabic = messages.some(msg => 
      msg.content.includes('العربية') || 
      msg.content.includes('Arabic') ||
      msg.content.includes('اللغة العربية')
    )
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('مرحبا') || lowerMessage.includes('السلام')) {
      return isArabic ? 'مرحباً! أنا مساعدك الذكي لشركة Quick Air. كيف يمكنني مساعدتك اليوم؟' : 'Hello! I\'m your intelligent assistant for Quick Air. How can I help you today?'
    }
    
    if (lowerMessage.includes('flight') || lowerMessage.includes('رحل') || lowerMessage.includes('طيران')) {
      return isArabic ? 'يمكنني مساعدتك في البحث عن أفضل الرحلات الجوية. ما هي وجهتك المفضلة؟' : 'I can help you find the best flights. What\'s your preferred destination?'
    }
    
    if (lowerMessage.includes('deal') || lowerMessage.includes('offer') || lowerMessage.includes('عرض') || lowerMessage.includes('خصم')) {
      return isArabic ? 'لدينا عروض رائعة متاحة! يمكنك زيارة موقعنا لمشاهدة أحدث العروض والخصومات.' : 'We have great deals available! You can visit our website to see the latest offers and discounts.'
    }
    
    if (lowerMessage.includes('visa') || lowerMessage.includes('تأشيرة')) {
      return isArabic ? 'يمكنني مساعدتك في معلومات التأشيرة. ما نوع التأشيرة التي تحتاجها؟' : 'I can help you with visa information. What type of visa do you need?'
    }
    
    return isArabic ? 'شكراً لك! هل هناك شيء آخر يمكنني مساعدتك فيه؟' : 'Thank you! Is there anything else I can help you with?'
  }

  private getDemoStreamingResponse(messages: ChatMessage[]): NodeJS.ReadableStream {
    const response = this.getDemoResponse(messages)
    const { Readable } = require('stream')
    
    return new Readable({
      read() {
        const chunks = response.split(' ')
        let index = 0
        
        const sendChunk = () => {
          if (index < chunks.length) {
            const chunk = chunks[index] + (index < chunks.length - 1 ? ' ' : '')
            this.push(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`)
            index++
            setTimeout(sendChunk, 100)
          } else {
            this.push('data: [DONE]\n\n')
            this.push(null)
          }
        }
        
        sendChunk()
      }
    })
  }
}
