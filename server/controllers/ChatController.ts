import type { Request, Response } from 'express'
import type { ChatRequest, ChatResponse } from '../types/index.js'
import { OpenRouterService, SessionManager } from '../services/index.js'

export class ChatController {
  private openRouterService: OpenRouterService
  private sessionManager: SessionManager

  constructor() {
    this.openRouterService = new OpenRouterService()
    this.sessionManager = new SessionManager()
  }

  async handleChat(req: Request, res: Response): Promise<void> {
    try {
      const { message, userId = 'default-user', lang = 'en' }: ChatRequest = req.body
      const history = this.sessionManager.getSession(userId)

      const messages = this.openRouterService.buildMessages(message, history, lang as 'ar' | 'en')
      
      // Add user message to history
      this.sessionManager.addMessage(userId, { role: 'user', content: message })

      const reply = await this.openRouterService.sendChatRequest(messages)
      
      // Add assistant response to history
      this.sessionManager.addMessage(userId, { role: 'assistant', content: reply })

      const response: ChatResponse = { reply }
      res.json(response)
    } catch (error) {
      console.error('❌ Chat Error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async handleStreamingChat(req: Request, res: Response): Promise<void> {
    const { message, userId = 'default-user', lang = 'en' }: ChatRequest = req.body || {}
    const history = this.sessionManager.getSession(userId)

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    })

    try {
      const messages = this.openRouterService.buildMessages(message, history, lang as 'ar' | 'en')
      
      // Add user message to history
      this.sessionManager.addMessage(userId, { role: 'user', content: message })

      const stream = await this.openRouterService.sendStreamingRequest(messages)
      
      let buffer = ''
      let assistantContent = ''

      stream.on('data', (chunk) => {
        buffer += chunk.toString()
        const lines = buffer.split(/\r?\n/)
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (!line.trim()) continue
          // Forward upstream SSE lines as-is
          res.write(line + '\n')

          // Extract content for local history accumulation
          if (line.startsWith('data: ')) {
            const payload = line.slice(6).trim()
            if (payload === '[DONE]') continue
            try {
              const json = JSON.parse(payload)
              const delta = json?.choices?.[0]?.delta?.content || json?.choices?.[0]?.message?.content || ''
              if (delta) {
                assistantContent += delta
              }
            } catch {}
          }
        }
      })

      stream.on('end', () => {
        // Save complete assistant message to history
        if (assistantContent) {
          this.sessionManager.addMessage(userId, { role: 'assistant', content: assistantContent })
        }
        res.write('data: [DONE]\n\n')
        res.end()
      })

      stream.on('error', (err) => {
        console.error('Stream error:', err)
        res.write(`data: ${JSON.stringify({ error: 'stream_error' })}\n\n`)
        res.end()
      })
    } catch (error) {
      console.error('Streaming error:', error)
      try {
        res.write(`data: ${JSON.stringify({ error: 'stream_error' })}\n\n`)
      } catch {}
      res.end()
    }
  }
}
