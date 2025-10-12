import type { Request, Response } from 'express'
import type { SupportRequest, SupportResponse } from '../types/index.js'
import { WhatsAppService } from '../services/index.js'

export class WhatsAppController {
  private whatsappService: WhatsAppService

  constructor() {
    this.whatsappService = new WhatsAppService()
  }

  async handleSupportRequest(req: Request, res: Response): Promise<void> {
    try {
      const { 
        name = 'Guest', 
        email = '', 
        phone = '', 
        message = '', 
        userId = 'unknown', 
        lang = 'en' 
      }: SupportRequest = req.body || {}

      if (!this.whatsappService.isConfigured()) {
        const response: SupportResponse = { 
          ok: false, 
          error: 'WhatsApp is not configured on the server.' 
        }
        res.status(500).json(response)
        return
      }

      // Generate WhatsApp link for direct communication
      const whatsappLink = this.whatsappService.generateSupportWhatsAppLink({
        name,
        email,
        phone,
        message,
        userId,
        lang: lang as 'ar' | 'en'
      })

      const response: SupportResponse = { 
        ok: true, 
        whatsappLink,
        message: lang === 'ar' 
          ? 'تم إنشاء رابط واتساب للدعم. اضغط على الرابط للتواصل مع فريق الدعم.'
          : 'WhatsApp support link generated. Click the link to contact our support team.'
      }
      res.json(response)
    } catch (error) {
      console.error('WhatsApp support error:', error)
      const response: SupportResponse = { 
        ok: false, 
        error: 'Failed to generate WhatsApp support link.' 
      }
      res.status(500).json(response)
    }
  }

  async sendSupportMessage(req: Request, res: Response): Promise<void> {
    try {
      const { 
        name = 'Guest', 
        email = '', 
        phone = '', 
        message = '', 
        userId = 'unknown', 
        lang = 'en' 
      }: SupportRequest = req.body || {}

      if (!this.whatsappService.isConfigured()) {
        const response: SupportResponse = { 
          ok: false, 
          error: 'WhatsApp is not configured on the server.' 
        }
        res.status(500).json(response)
        return
      }

      await this.whatsappService.sendSupportMessage({
        name,
        email,
        phone,
        message,
        userId,
        lang: lang as 'ar' | 'en'
      })

      const response: SupportResponse = { ok: true }
      res.json(response)
    } catch (error) {
      console.error('WhatsApp message error:', error)
      const response: SupportResponse = { 
        ok: false, 
        error: 'Failed to send WhatsApp message.' 
      }
      res.status(500).json(response)
    }
  }
}
