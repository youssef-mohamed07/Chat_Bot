import { google } from 'googleapis'
import nodemailer from 'nodemailer'

export interface GmailEmailData {
  to: string
  subject: string
  html: string
  from?: string
}

export class GmailService {
  private transporter?: nodemailer.Transporter
  private isReady: boolean = false
  private gmailUser: string = ''

  constructor() {
    this.initializeGmail()
  }

  private async initializeGmail() {
    try {
      const gmailUser = process.env.GMAIL_USER
      const gmailAppPassword = process.env.GMAIL_APP_PASSWORD

      if (!gmailUser || !gmailAppPassword) {
        console.log('ℹ️  Gmail not configured (optional)')
        return
      }

      console.log('📧 Initializing Gmail service...')
      
      this.gmailUser = gmailUser
      
      // Use nodemailer with Gmail SMTP and App Password
      // This is simpler than OAuth2 and works perfectly
      this.transporter = nodemailer.createTransport({
        service: 'gmail', // This automatically configures Gmail SMTP
        auth: {
          user: gmailUser,
          pass: gmailAppPassword
        },
        tls: {
          rejectUnauthorized: false // Accept self-signed certificates
        }
      })

      // Test the connection
      await this.transporter.verify()
      
      console.log('✅ Gmail service ready!')
      console.log(`📧 Sending from: ${gmailUser}`)
      this.isReady = true
      
    } catch (error: any) {
      console.error('❌ Gmail service failed:', error.message)
      this.isReady = false
    }
  }

  async sendEmail(data: GmailEmailData): Promise<boolean> {
    if (!this.transporter || !this.isReady) {
      console.warn('⚠️  Gmail service not ready')
      return false
    }

    try {
      const info = await this.transporter.sendMail({
        from: data.from || `Quick Air <${this.gmailUser}>`,
        to: data.to,
        subject: data.subject,
        html: data.html
      })

      console.log(`✅ Gmail sent to ${data.to}`)
      console.log(`📧 Message ID: ${info.messageId}`)
      return true
      
    } catch (error: any) {
      console.error('❌ Gmail send failed:', error.message)
      return false
    }
  }

  isConfigured(): boolean {
    return this.isReady
  }
}
