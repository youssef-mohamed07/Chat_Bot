import fetch from 'node-fetch'
import type { SupportRequest } from '../types/index.js'
import { config } from '../config/index.js'

export interface MessengerMessage {
  recipient: {
    id: string
  }
  message: {
    text: string
  }
}

export interface MessengerResponse {
  recipient_id: string
  message_id: string
}

export class MessengerService {
  private readonly accessToken: string
  private readonly pageId: string
  private readonly messengerUserId: string

  constructor() {
    this.accessToken = config.messengerAccessToken || ''
    this.pageId = config.facebookPageId || ''
    this.messengerUserId = config.messengerUserId || ''
  }

  isConfigured(): boolean {
    return !!(this.accessToken && this.pageId && this.messengerUserId)
  }

  async sendSupportMessage(supportData: SupportRequest): Promise<MessengerResponse> {
    if (!this.isConfigured()) {
      throw new Error('Messenger is not configured on the server.')
    }

    const message = this.formatSupportMessage(supportData)
    
    const messengerMessage: MessengerMessage = {
      recipient: {
        id: this.messengerUserId
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
        body: JSON.stringify(messengerMessage)
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Messenger API Error: ${JSON.stringify(errorData)}`)
    }

    return await response.json() as MessengerResponse
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

  generateMessengerLink(userId: string, message?: string): string {
    const encodedMessage = message ? encodeURIComponent(message) : ''
    return `https://m.me/${userId}/${encodedMessage ? `?text=${encodedMessage}` : ''}`
  }

  generateSupportMessengerLink(supportData: SupportRequest): string {
    const message = this.formatSupportMessage(supportData)
    return this.generateMessengerLink('quickair', message)
  }
}
