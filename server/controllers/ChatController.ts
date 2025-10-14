import type { Request, Response } from 'express'
import type { ChatRequest, ChatResponse } from '../types/index.js'
import { OpenRouterService, SessionManager, MultiPlatformService, DatabaseService, NotificationService } from '../services/index.js'

export class ChatController {
  private openRouterService: OpenRouterService
  private sessionManager: SessionManager
  private multiPlatformService: MultiPlatformService
  private databaseService: DatabaseService
  private notificationService: NotificationService

  constructor() {
    this.openRouterService = new OpenRouterService()
    this.sessionManager = new SessionManager()
    this.multiPlatformService = new MultiPlatformService()
    this.databaseService = new DatabaseService()
    this.notificationService = new NotificationService(this.databaseService, {
      enableEmailNotifications: false,
      enableConsoleNotifications: true
    })
  }

  private isSupportRequest(message: string, lang: 'ar' | 'en'): boolean {
    const supportKeywords = {
      ar: [
        'خدمة عملاء', 'خدمة العملاء', 'دعم عملاء', 'دعم العملاء',
        'موظف دعم', 'موظف الدعم', 'اتصل بدعم', 'اتصل بالدعم',
        'أريد مساعدة', 'أحتاج مساعدة', 'مساعدة بشرية',
        'تكلم مع موظف', 'تكلم مع موظف دعم', 'موظف بشري',
        'خدمة', 'دعم', 'مساعدة', 'موظف', 'اتصل', 'تكلم'
      ],
      en: [
        'customer support', 'customer service', 'support agent',
        'human agent', 'talk to agent', 'speak to agent',
        'contact support', 'need help', 'want help',
        'human help', 'live agent', 'real person',
        'support', 'help', 'agent', 'human', 'contact',
        'deals', 'offers', 'special offers', 'discounts'
      ]
    }

    const keywords = supportKeywords[lang]
    
    if (lang === 'ar') {
      // For Arabic, don't use toLowerCase as it doesn't work well with Arabic text
      return keywords.some(keyword => message.includes(keyword))
    } else {
      // For English, use toLowerCase for case-insensitive matching
      const lowerMessage = message.toLowerCase()
      return keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))
    }
  }

  async handleChat(req: Request, res: Response): Promise<void> {
    try {
      const { message, userId = 'default-user', lang = 'en' }: ChatRequest = req.body
      const history = this.sessionManager.getSession(userId)

      // Log only important info
      const isSupport = this.isSupportRequest(message, lang as 'ar' | 'en')

      // Check if this is a support request
      if (this.isSupportRequest(message, lang as 'ar' | 'en')) {
        
        let supportReply: string
        let platformResults: any[] = []
        
        // Create support ticket in database
        const ticketId = await this.databaseService.createSupportTicket({
          userId,
          name: 'Guest',
          email: '',
          phone: '',
          message: message,
          lang: lang as 'ar' | 'en',
          status: 'pending'
        })

        // Get available platforms
        const availablePlatforms = this.multiPlatformService.getAvailablePlatforms()
        const platformStatus = this.multiPlatformService.getPlatformStatus()

        if (availablePlatforms.length > 0) {
          try {
            // Send to all available platforms
            platformResults = await this.multiPlatformService.sendSupportMessage({
              name: 'Guest',
              email: '',
              phone: '',
              message: message,
              userId,
              lang: lang as 'ar' | 'en'
            }, 'all')

            // Update ticket status based on results
            const successfulPlatforms = platformResults.filter(r => r.success)
            if (successfulPlatforms.length > 0) {
              await this.databaseService.updateSupportTicketStatus(ticketId, 'in_progress')
            }

            const platformList = this.multiPlatformService.formatPlatformList(lang as 'ar' | 'en')
            
            supportReply = lang === 'ar' 
              ? `✅ تم إرسال رسالتك إلى فريق الدعم عبر المنصات المتاحة.\n\n📋 رقم التذكرة: #${ticketId}\n${platformList}\n📱 يمكنك متابعة المحادثة هنا في البوت أو انتظار ردنا على المنصات المتاحة.`
              : `✅ Your message has been sent to our support team via available platforms.\n\n📋 Ticket Number: #${ticketId}\n${platformList}\n📱 You can continue the conversation here in the bot or wait for our response on available platforms.`
          } catch (error) {
            console.error('Failed to send multi-platform message:', error)
            supportReply = lang === 'ar' 
              ? `أفهم أنك تحتاج مساعدة من موظف دعم. تم حفظ طلبك في النظام.\n\n📋 رقم التذكرة: #${ticketId}\nللأسف، حدث خطأ في إرسال الرسالة. يرجى المحاولة لاحقاً.`
              : `I understand you need help from a support agent. Your request has been saved in the system.\n\n📋 Ticket Number: #${ticketId}\nUnfortunately, there was an error sending the message. Please try again later.`
          }
        } else {
          supportReply = lang === 'ar' 
            ? `أفهم أنك تحتاج مساعدة من موظف دعم. تم حفظ طلبك في النظام.\n\n📋 رقم التذكرة: #${ticketId}\nللأسف، لا توجد منصات متاحة حالياً. يرجى المحاولة لاحقاً.`
            : `I understand you need help from a support agent. Your request has been saved in the system.\n\n📋 Ticket Number: #${ticketId}\nUnfortunately, no platforms are currently available. Please try again later.`
        }

        // Send notification about new support ticket
        const ticket = await this.databaseService.getSupportTicket(ticketId)
        if (ticket) {
          await this.notificationService.notifyNewSupportTicket(ticket)
        }

        // Log platform results
        if (platformResults.length > 0) {
        // Platform results logged silently
        }

        // Add user message to history
        this.sessionManager.addMessage(userId, { role: 'user', content: message })
        // Add assistant response to history
        this.sessionManager.addMessage(userId, { role: 'assistant', content: supportReply })

        const response: ChatResponse = { reply: supportReply }
        res.json(response)
        return
      }

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

    // Log only important info
    const isSupport = this.isSupportRequest(message, lang as 'ar' | 'en')

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    })

    try {
      // Check if this is a support request
      if (this.isSupportRequest(message, lang as 'ar' | 'en')) {
        
        let supportReply: string
        let platformResults: any[] = []
        
        // Create support ticket in database
        const ticketId = await this.databaseService.createSupportTicket({
          userId,
          name: 'Guest',
          email: '',
          phone: '',
          message: message,
          lang: lang as 'ar' | 'en',
          status: 'pending'
        })

        // Get available platforms
        const availablePlatforms = this.multiPlatformService.getAvailablePlatforms()
        const platformStatus = this.multiPlatformService.getPlatformStatus()

        if (availablePlatforms.length > 0) {
          try {
            // Send to all available platforms
            platformResults = await this.multiPlatformService.sendSupportMessage({
              name: 'Guest',
              email: '',
              phone: '',
              message: message,
              userId,
              lang: lang as 'ar' | 'en'
            }, 'all')

            // Update ticket status based on results
            const successfulPlatforms = platformResults.filter(r => r.success)
            if (successfulPlatforms.length > 0) {
              await this.databaseService.updateSupportTicketStatus(ticketId, 'in_progress')
            }

            const platformList = this.multiPlatformService.formatPlatformList(lang as 'ar' | 'en')
            
            supportReply = lang === 'ar' 
              ? `✅ تم إرسال رسالتك إلى فريق الدعم عبر المنصات المتاحة.\n\n📋 رقم التذكرة: #${ticketId}\n${platformList}\n📱 يمكنك متابعة المحادثة هنا في البوت أو انتظار ردنا على المنصات المتاحة.`
              : `✅ Your message has been sent to our support team via available platforms.\n\n📋 Ticket Number: #${ticketId}\n${platformList}\n📱 You can continue the conversation here in the bot or wait for our response on available platforms.`
          } catch (error) {
            console.error('Failed to send multi-platform message:', error)
            supportReply = lang === 'ar' 
              ? `أفهم أنك تحتاج مساعدة من موظف دعم. تم حفظ طلبك في النظام.\n\n📋 رقم التذكرة: #${ticketId}\nللأسف، حدث خطأ في إرسال الرسالة. يرجى المحاولة لاحقاً.`
              : `I understand you need help from a support agent. Your request has been saved in the system.\n\n📋 Ticket Number: #${ticketId}\nUnfortunately, there was an error sending the message. Please try again later.`
          }
        } else {
          supportReply = lang === 'ar' 
            ? `أفهم أنك تحتاج مساعدة من موظف دعم. تم حفظ طلبك في النظام.\n\n📋 رقم التذكرة: #${ticketId}\nللأسف، لا توجد منصات متاحة حالياً. يرجى المحاولة لاحقاً.`
            : `I understand you need help from a support agent. Your request has been saved in the system.\n\n📋 Ticket Number: #${ticketId}\nUnfortunately, no platforms are currently available. Please try again later.`
        }

        // Send notification about new support ticket
        const ticket = await this.databaseService.getSupportTicket(ticketId)
        if (ticket) {
          await this.notificationService.notifyNewSupportTicket(ticket)
        }

        // Log platform results
        if (platformResults.length > 0) {
        // Platform results logged silently
        }

        // Add user message to history
        this.sessionManager.addMessage(userId, { role: 'user', content: message })
        // Add assistant response to history
        this.sessionManager.addMessage(userId, { role: 'assistant', content: supportReply })

        // Send the support reply as a stream
        res.write(`data: ${JSON.stringify({ content: supportReply })}\n\n`)
        res.write('data: [DONE]\n\n')
        res.end()
        return
      }

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
