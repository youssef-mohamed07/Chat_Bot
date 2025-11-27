import pkg from 'whatsapp-web.js'
const { Client, LocalAuth } = pkg
import qrcode from 'qrcode-terminal'

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
  private client: typeof Client.prototype | null = null
  private targetPhone: string
  private isReady: boolean = false
  private messageQueue: Array<{ phone: string; message: string }> = []
  private enabled: boolean = true

  constructor() {
    this.targetPhone = process.env.WHATSAPP_NOTIFY_TO || ''
    
    // Check if WhatsApp should be enabled
    const whatsappEnabled = process.env.WHATSAPP_ENABLED !== 'false'
    
    if (!whatsappEnabled) {
      console.log('ℹ️  WhatsApp Service disabled (WHATSAPP_ENABLED=false)')
      this.enabled = false
      return
    }
    
    if (!this.targetPhone) {
      console.warn('⚠️  WhatsApp Service: Missing WHATSAPP_NOTIFY_TO in .env')
      console.warn('⚠️  WhatsApp notifications will be disabled')
      this.enabled = false
      return
    }
    
    this.initializeClient()
  }

  private initializeClient() {
    if (!this.enabled) return
    
    try {
      console.log('🔄 Initializing WhatsApp client...')
      
      this.client = new Client({
        authStrategy: new LocalAuth({
          dataPath: '.wwebjs_auth'
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ],
          timeout: 60000 // Increase timeout to 60 seconds
        }
      })

      this.client.on('qr', (qr: string) => {
        console.log('📱 Scan this QR code with WhatsApp:')
        qrcode.generate(qr, { small: true })
        console.log('💡 Or open WhatsApp > Linked Devices > Link a Device')
      })

      this.client.on('ready', () => {
        console.log('✅ WhatsApp client is ready!')
        this.isReady = true
        this.processQueue()
      })

      this.client.on('authenticated', () => {
        console.log('🔐 WhatsApp authenticated')
      })

      this.client.on('auth_failure', (msg: string) => {
        console.error('❌ WhatsApp authentication failed:', msg)
        this.isReady = false
      })

      this.client.on('disconnected', (reason: string) => {
        console.log('⚠️  WhatsApp disconnected:', reason)
        this.isReady = false
      })

      // Handle initialization errors gracefully
      this.client.initialize().catch((error) => {
        console.warn('⚠️  WhatsApp initialization failed (service will continue without WhatsApp):', error.message)
        this.isReady = false
      })
    } catch (error) {
      console.error('❌ Failed to initialize WhatsApp client:', error)
      this.isReady = false
    }
  }

  private async processQueue() {
    if (!this.isReady || this.messageQueue.length === 0) return

    while (this.messageQueue.length > 0) {
      const item = this.messageQueue.shift()
      if (item) {
        await this.sendMessage(item.phone, item.message)
      }
    }
  }

  private async sendMessage(phone: string, message: string): Promise<boolean> {
    if (!this.client || !this.isReady) {
      console.log('⏳ WhatsApp not ready, adding to queue...')
      this.messageQueue.push({ phone, message })
      return false
    }

    try {
      // Format phone number for WhatsApp (remove + and add @c.us)
      const formattedPhone = phone.replace(/[^0-9]/g, '') + '@c.us'
      
      console.log(`📤 Sending WhatsApp message to: ${formattedPhone}`)
      
      await this.client.sendMessage(formattedPhone, message)
      
      console.log('✅ WhatsApp message sent successfully')
      return true
    } catch (error: any) {
      console.error('❌ WhatsApp send error:', error.message)
      return false
    }
  }

  async sendBookingSummary(summary: BookingSummary): Promise<boolean> {
    if (!this.targetPhone) {
      console.error('❌ WhatsApp target phone not configured')
      return false
    }

    try {
      const lang = summary.language || 'ar'
      const message = lang === 'ar' 
        ? this.formatBookingMessageAr(summary)
        : this.formatBookingMessageEn(summary)
      
      return await this.sendMessage(this.targetPhone, message)
    } catch (error: any) {
      console.error('❌ WhatsApp send error:', error.message)
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
      const testMessage = '✅ WhatsApp Service configured successfully!\n\nYour chatbot is ready to send booking notifications.'
      return await this.sendMessage(this.targetPhone, testMessage)
    } catch (error: any) {
      console.error('❌ Test message failed:', error.message)
      return false
    }
  }
}
