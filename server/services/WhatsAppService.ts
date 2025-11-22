import axios from 'axios'

export interface BookingSummary {
  destination: string
  hotel: string
  mealPlan: string
  roomType: string
  travelers?: number
  startDate?: string
  endDate?: string
  budget?: { min: number; max: number; label: string }
  customerName: string
  customerPhone: string
  customerEmail: string
  language?: 'ar' | 'en'
}

export class WhatsAppService {
  private apiUrl: string
  private apiToken: string
  private targetPhone: string

  constructor() {
    // Ultramsg API Configuration
    const instanceId = process.env.ULTRAMSG_INSTANCE || ''
    this.apiUrl = `https://api.ultramsg.com/${instanceId}`
    this.apiToken = process.env.ULTRAMSG_TOKEN || ''
    this.targetPhone = process.env.WHATSAPP_NOTIFY_TO || ''
    
    if (!instanceId || !this.apiToken || !this.targetPhone) {
      console.warn('⚠️  WhatsApp Service: Missing configuration. Set ULTRAMSG_INSTANCE, ULTRAMSG_TOKEN, WHATSAPP_NOTIFY_TO in .env')
    }
  }

  async sendBookingSummary(summary: BookingSummary): Promise<boolean> {
    if (!this.apiToken || !this.targetPhone) {
      console.error('❌ WhatsApp Service not configured')
      return false
    }

    try {
      const lang = summary.language || 'ar'
      const message = lang === 'ar' 
        ? this.formatBookingMessageAr(summary)
        : this.formatBookingMessageEn(summary)
      
      console.log(`📤 Sending WhatsApp message in ${lang} to:`, this.targetPhone)
      
      const response = await axios.post(
        `${this.apiUrl}/messages/chat`,
        {
          token: this.apiToken,
          to: this.targetPhone,
          body: message,
          priority: 10
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 seconds timeout
        }
      )

      if (response.data && response.data.sent === 'true') {
        console.log('✅ WhatsApp message sent successfully:', response.data.id)
        return true
      } else {
        console.error('❌ WhatsApp send failed:', response.data)
        return false
      }
    } catch (error: any) {
      console.error('❌ WhatsApp send error:', error.response?.data || error.message)
      return false
    }
  }

  private formatBookingMessageAr(summary: BookingSummary): string {
    const nights = this.calculateNights(summary.startDate, summary.endDate)
    
    return `
*حجز جديد من البوت*
━━━━━━━━━━━━━━━━━━

*بيانات العميل*
▫️ الاسم: ${summary.customerName}
▫️ الهاتف: ${summary.customerPhone}
▫️ البريد: ${summary.customerEmail}

*تفاصيل الرحلة*
▫️ الوجهة: ${this.translateDestination(summary.destination)}
▫️ الفندق: ${summary.hotel}
▫️ نظام الوجبات: ${summary.mealPlan}
▫️ نوع الغرفة: ${summary.roomType}
${summary.travelers ? `▫️ عدد المسافرين: ${summary.travelers}` : ''}
${summary.startDate && summary.endDate ? `
*التواريخ*
▫️ المغادرة: ${summary.startDate}
▫️ العودة: ${summary.endDate}
▫️ المدة: ${nights} ليلة` : ''}
${summary.budget ? `
*الميزانية*
▫️ ${summary.budget.label}: ${summary.budget.min.toLocaleString()} - ${summary.budget.max.toLocaleString()} ج.م` : ''}

━━━━━━━━━━━━━━━━━━
تم الإرسال: ${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}
    `.trim()
  }

  private formatBookingMessageEn(summary: BookingSummary): string {
    const nights = this.calculateNights(summary.startDate, summary.endDate)
    
    return `
*New Booking from Chatbot*
━━━━━━━━━━━━━━━━━━

*Customer Information*
▫️ Name: ${summary.customerName}
▫️ Phone: ${summary.customerPhone}
▫️ Email: ${summary.customerEmail}

*Trip Details*
▫️ Destination: ${this.translateDestinationEn(summary.destination)}
▫️ Hotel: ${summary.hotel}
▫️ Meal Plan: ${summary.mealPlan}
▫️ Room Type: ${summary.roomType}
${summary.travelers ? `▫️ Travelers: ${summary.travelers}` : ''}
${summary.startDate && summary.endDate ? `
*Dates*
▫️ Departure: ${summary.startDate}
▫️ Return: ${summary.endDate}
▫️ Duration: ${nights} night${nights !== 1 ? 's' : ''}` : ''}
${summary.budget ? `
*Budget*
▫️ ${summary.budget.label}: ${summary.budget.min.toLocaleString()} - ${summary.budget.max.toLocaleString()} EGP` : ''}

━━━━━━━━━━━━━━━━━━
Sent at: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' })}
    `.trim()
  }

  private calculateNights(start?: string, end?: string): number {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  private translateDestination(dest: string): string {
    const names: Record<string, string> = {
      'bali': 'بالي',
      'istanbul': 'إسطنبول',
      'beirut': 'بيروت',
      'dahab': 'دهب',
      'sharm_el_sheikh': 'شرم الشيخ',
      'hurghada': 'الغردقة',
      'ain_sokhna': 'العين السخنة',
      'sahl_hashish': 'سهل حشيش'
    }
    return names[dest] || dest
  }

  private translateDestinationEn(dest: string): string {
    const names: Record<string, string> = {
      'bali': 'Bali',
      'istanbul': 'Istanbul',
      'beirut': 'Beirut',
      'dahab': 'Dahab',
      'sharm_el_sheikh': 'Sharm El Sheikh',
      'hurghada': 'Hurghada',
      'ain_sokhna': 'Ain Sokhna',
      'sahl_hashish': 'Sahl Hasheesh'
    }
    return names[dest] || dest
  }

  /**
   * Send a test message to verify WhatsApp integration
   */
  async sendTestMessage(): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/messages/chat`,
        {
          token: this.apiToken,
          to: this.targetPhone,
          body: '✅ WhatsApp Service configured successfully!\n\nYour chatbot is ready to send booking notifications.',
          priority: 10
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      )

      return response.data?.sent === 'true'
    } catch (error) {
      console.error('Test message failed:', error)
      return false
    }
  }
}
