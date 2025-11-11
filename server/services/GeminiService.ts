import fetch from 'node-fetch'
import type { ChatMessage, GeminiResponse, Language } from '../types/index.js'
import { config } from '../config/index.js'
import { PromptService } from './PromptService.js'

interface FunctionCall {
  name: string
  args: Record<string, any>
}

interface GeminiStreamChunk {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
        functionCall?: FunctionCall
      }>
    }
    finishReason?: string
  }>
}

export class GeminiService {
  private readonly apiKey: string
  private readonly model: string
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models'

  constructor() {
    this.apiKey = config.geminiKey
    this.model = config.model || 'gemini-2.0-flash-exp'
  }

  // Main chat request with function calling support
  async sendChatRequest(
    messages: ChatMessage[],
    lang: Language,
    enableFunctions: boolean = true
  ): Promise<{ text: string; functionCall?: FunctionCall }> {
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`

    const { systemMessages, regularMessages } = this.splitMessages(messages)
    const requestBody: any = {
      contents: regularMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }

    // Add system instruction
    if (systemMessages.length > 0) {
      requestBody.systemInstruction = {
        parts: [{ text: systemMessages.join('\n\n') }]
      }
    }

    // Add function declarations if enabled
    if (enableFunctions) {
      requestBody.tools = [{
        functionDeclarations: PromptService.getFunctionDefinitions()
      }]
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Gemini API Error:', errorData)
      throw new Error(`Gemini API Error: ${response.status}`)
    }

    const data = await response.json() as GeminiResponse
    const candidate = data.candidates?.[0]
    const parts = candidate?.content?.parts || []

    // Check for function call
    const functionCallPart = parts.find((p: any) => p.functionCall)
    if (functionCallPart && (functionCallPart as any).functionCall) {
      return {
        text: '',
        functionCall: (functionCallPart as any).functionCall
      }
    }

    // Regular text response
    const text = parts.map((p: any) => p.text || '').join('')
    return { text: text || (lang === 'ar' ? '❌ لم أتمكن من الحصول على رد.' : '❌ Could not get a response.') }
  }

  // Streaming chat with function calling support
  async sendStreamingRequest(
    messages: ChatMessage[],
    lang: Language,
    enableFunctions: boolean = true
  ): Promise<AsyncGenerator<{ text?: string; functionCall?: FunctionCall; done?: boolean }>> {
    const url = `${this.baseUrl}/${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`

    const { systemMessages, regularMessages } = this.splitMessages(messages)
    const requestBody: any = {
      contents: regularMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }

    if (systemMessages.length > 0) {
      requestBody.systemInstruction = {
        parts: [{ text: systemMessages.join('\n\n') }]
      }
    }

    if (enableFunctions) {
      requestBody.tools = [{
        functionDeclarations: PromptService.getFunctionDefinitions()
      }]
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ Gemini Streaming Error:', errorData)
      throw new Error(`Gemini API Error (${response.status})`)
    }

    if (!response.body) {
      throw new Error('Stream unavailable: response body is null')
    }

    return this.parseSSEStream(response.body as any, lang)
  }

  // Parse SSE stream
  private async *parseSSEStream(
    stream: NodeJS.ReadableStream,
    lang: Language
  ): AsyncGenerator<{ text?: string; functionCall?: FunctionCall; done?: boolean }> {
    let buffer = ''

    for await (const chunk of stream as any) {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue
        
        const data = line.slice(6).trim()
        if (data === '[DONE]') {
          yield { done: true }
          return
        }

        try {
          const parsed: GeminiStreamChunk = JSON.parse(data)
          const candidate = parsed.candidates?.[0]
          const parts = candidate?.content?.parts || []

          for (const part of parts) {
            if ((part as any).functionCall) {
              yield { functionCall: (part as any).functionCall }
            } else if ((part as any).text) {
              yield { text: (part as any).text }
            }
          }

          if (candidate?.finishReason) {
            yield { done: true }
          }
        } catch (e) {
          console.warn('Failed to parse SSE chunk:', e)
        }
      }
    }
  }

  // Build messages with enhanced prompts
  buildMessages(userMessage: string, history: ChatMessage[], lang: Language, ragContext?: string): ChatMessage[] {
    const messages: ChatMessage[] = [
      { role: 'system', content: PromptService.getSystemPrompt(lang) },
      { role: 'system', content: PromptService.getContextInstructions(lang) },
    ]

    // Add RAG context if available
    if (ragContext) {
      messages.push({
        role: 'system',
        content: ragContext
      })
    }

    // Add conversation history
    messages.push(...history)

    // Add current user message
    messages.push({ role: 'user', content: userMessage })

    return messages
  }

  // Split system messages from regular messages
  private splitMessages(messages: ChatMessage[]): {
    systemMessages: string[]
    regularMessages: Array<{ role: string; parts: Array<{ text: string }> }>
  } {
    const systemMessages: string[] = []
    const regularMessages: Array<{ role: string; parts: Array<{ text: string }> }> = []

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
}
