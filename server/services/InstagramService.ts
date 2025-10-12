import fetch from 'node-fetch'
import type { SupportRequest } from '../types/index.js'
import { config } from '../config/index.js'

export interface InstagramMessage {
  recipient: {
    id: string
  }
  message: {
    text: string
  }
}

export interface InstagramResponse {
  recipient_id: string
  message_id: string
}

export class InstagramService {
  private readonly accessToken: string
  private readonly pageId: string
  private readonly instagramAccountId: string

  constructor() {
    this.accessToken = config.instagramAccessToken || ''
    this.pageId = config.facebookPageId || ''
    this.instagramAccountId = config.instagramAccountId || ''
  }

  isConfigured(): boolean {
    return !!(this.accessToken && this.pageId && this.instagramAccountId)
  }

  async sendSupportMessage(supportData: SupportRequest): Promise<InstagramResponse> {
    if (!this.isConfigured()) {
      throw new Error('Instagram is not configured on the server.')
    }

    const message = this.formatSupportMessage(supportData)
    
    const instagramMessage: InstagramMessage = {
      recipient: {
        id: this.instagramAccountId
      },
      message: {
        text: message
      }
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${this.pageId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(instagramMessage)
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Instagram API Error: ${JSON.stringify(errorData)}`)
    }

    return await response.json() as InstagramResponse
  }

  private formatSupportMessage(supportData: SupportRequest): string {
    const { name, email, phone, message, userId, lang } = supportData
    
    if (lang === 'ar') {
      return `🆘 طلب دعم عملاء جديد من Quick Air

👤 الاسم: ${name}
📧 البريد الإلكتروني: ${email || 'غير محدد'}
📱 الهاتف: ${phone || 'غير محدد'}
🆔 معرف المستخدم: ${userId}

💬 الرسالة:
${message}

---
تم إرسال هذا الطلب عبر نظام الدعم الآلي في Quick Air`
    } else {
      return `🆘 New Customer Support Request from Quick Air

👤 Name: ${name}
📧 Email: ${email || 'Not provided'}
📱 Phone: ${phone || 'Not provided'}
🆔 User ID: ${userId}

💬 Message:
${message}

---
This request was sent through Quick Air's automated support system`
    }
  }

  generateInstagramLink(username: string, message?: string): string {
    const encodedMessage = message ? encodeURIComponent(message) : ''
    return `https://www.instagram.com/${username}/${encodedMessage ? `?text=${encodedMessage}` : ''}`
  }

  generateSupportInstagramLink(supportData: SupportRequest): string {
    const message = this.formatSupportMessage(supportData)
    return this.generateInstagramLink('quickair_official', message)
  }
}
