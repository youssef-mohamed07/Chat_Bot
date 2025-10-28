import type { Request, Response } from 'express'
import type { ChatRequest, ChatResponse } from '../types/index.js'
import { GeminiService, SessionManager } from '../services/index.js'

export class ChatController {
  private geminiService: GeminiService
  private sessionManager: SessionManager

  constructor() {
    this.geminiService = new GeminiService()
    this.sessionManager = new SessionManager()
  }

  async handleChat(req: Request, res: Response): Promise<void> {
    try {
      const { message, userId = 'default-user', lang = 'en' }: ChatRequest = req.body
      const history = this.sessionManager.getSession(userId)

      const messages = this.geminiService.buildMessages(message, history, lang as 'ar' | 'en')
      
      // Add user message to history
      this.sessionManager.addMessage(userId, { role: 'user', content: message })

      const reply = await this.geminiService.sendChatRequest(messages)
      
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
      const messages = this.geminiService.buildMessages(message, history, lang as 'ar' | 'en')
      
      // Add user message to history
      this.sessionManager.addMessage(userId, { role: 'user', content: message })

      const stream = await this.geminiService.sendStreamingRequest(messages)
      
      let buffer = ''
      let fullResponse = ''

      stream.on('data', (chunk) => {
        buffer += chunk.toString()
        
        // Look for complete JSON objects using brace matching
        while (true) {
          const start = buffer.indexOf('{')
          if (start === -1) break
          
          let depth = 0
          let inString = false
          let escapeNext = false
          let end = -1
          
          for (let i = start; i < buffer.length; i++) {
            const char = buffer[i]
            
            if (escapeNext) {
              escapeNext = false
              continue
            }
            
            if (char === '\\') {
              escapeNext = true
              continue
            }
            
            if (char === '"' && !escapeNext) {
              inString = !inString
              continue
            }
            
            if (!inString) {
              if (char === '{') depth++
              if (char === '}') {
                depth--
                if (depth === 0) {
                  end = i + 1
                  break
                }
              }
            }
          }
          
          if (end > start) {
            // Complete object found
            try {
              const jsonStr = buffer.substring(start, end)
              const obj = JSON.parse(jsonStr)
              const text = obj?.candidates?.[0]?.content?.parts?.[0]?.text
              if (text && typeof text === 'string') {
              // Check if this is the same or longer response
              if (text !== fullResponse && text.length >= fullResponse.length) {
                const newText = text.substring(fullResponse.length)
                fullResponse = text
                
                // Send text with slight delay to group words together
                if (newText.length > 0) {
                  console.log('Sending chunk:', newText.substring(0, 100))
                  // Add small spaces or words together
                  res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: newText } }] })}\n\n`)
                }
              }
              }
            } catch (e) {
              console.log('Parse error')
            }
            
            // Remove processed part from buffer
            buffer = buffer.substring(end)
          } else {
            // Incomplete object, wait for more data
            break
          }
        }
      })

      stream.on('end', () => {
        // Process any remaining buffer
        const start = buffer.indexOf('{')
        if (start !== -1) {
          try {
            const jsonStr = buffer.substring(start)
            const obj = JSON.parse(jsonStr)
            const text = obj?.candidates?.[0]?.content?.parts?.[0]?.text
            if (text && typeof text === 'string') {
              const newText = text.substring(fullResponse.length)
              if (newText.length > 0) {
                fullResponse = text
                res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: newText } }] })}\n\n`)
              }
            }
          } catch (e) {}
        }
        
        // Save complete assistant message to history
        if (fullResponse) {
          this.sessionManager.addMessage(userId, { role: 'assistant', content: fullResponse })
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
