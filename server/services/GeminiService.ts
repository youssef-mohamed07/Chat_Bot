import fetch from 'node-fetch'
import type { ChatMessage, GeminiResponse } from '../types/index.js'
import { config } from '../config/index.js'
import { API_ENDPOINTS, SYSTEM_PROMPTS, LANGUAGE_INSTRUCTIONS, LANGUAGE_SYSTEM_MESSAGES } from '../utils/index.js'

export class GeminiService {
  private readonly apiKey: string
  private readonly model: string

  constructor() {
    this.apiKey = config.geminiKey
    this.model = config.model || 'gemini-2.0-flash-001'
  }

  async sendChatRequest(messages: ChatMessage[]): Promise<string> {
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      return this.getDemoResponse(messages)
    }

    const url = `${API_ENDPOINTS.GEMINI_CHAT}?key=${this.apiKey}`
    
    // Extract system messages and regular messages
    const { systemMessages, regularMessages } = this.splitMessages(messages)

    const requestBody: any = {
      contents: regularMessages,
      generationConfig: {
        temperature: 0.7,
      },
    }

    // Only add systemInstruction if we have system messages
    if (systemMessages.length > 0) {
      requestBody.systemInstruction = {
        parts: [{ text: systemMessages.join('\n\n') }]
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Gemini API Error: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json() as GeminiResponse
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '❌ لم يتم الحصول على رد من الذكاء الاصطناعي.'
  }

  async sendStreamingRequest(messages: ChatMessage[]): Promise<NodeJS.ReadableStream> {
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      return this.getDemoStreamingResponse(messages)
    }

    const url = `${API_ENDPOINTS.GEMINI_STREAM}?key=${this.apiKey}`
    
    // Extract system messages and regular messages
    const { systemMessages, regularMessages } = this.splitMessages(messages)

    const requestBody: any = {
      contents: regularMessages,
      generationConfig: {
        temperature: 0.7,
      },
    }

    // Only add systemInstruction if we have system messages
    if (systemMessages.length > 0) {
      requestBody.systemInstruction = {
        parts: [{ text: systemMessages.join('\n\n') }]
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Gemini API Error (${response.status}): ${errorData}`)
    }

    if (!response.body) {
      throw new Error('Stream unavailable: response body is null')
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

  private convertToGeminiFormat(messages: ChatMessage[]): Array<{ role: string, parts: Array<{ text: string }> }> {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))
  }

  private splitMessages(messages: ChatMessage[]): { systemMessages: string[], regularMessages: Array<{ role: string, parts: Array<{ text: string }> }> } {
    const systemMessages: string[] = []
    const regularMessages: Array<{ role: string, parts: Array<{ text: string }> }> = []

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemMessages.push(msg.content)
      } else {
        regularMessages.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })
      }
    }

    return { systemMessages, regularMessages }
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

