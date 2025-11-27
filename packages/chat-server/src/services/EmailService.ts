import nodemailer from 'nodemailer'
import type { EmailConfig } from '../config/index.js'
import { config, EMAIL_TEMPLATES } from '../config/index.js'
import { GmailService } from './GmailService.js'

export interface WelcomeEmailData {
  name: string
  email: string
  phone?: string
  lang: 'ar' | 'en'
}

export interface BookingConfirmationData {
  name: string
  email: string
  destination: string
  hotel: string
  checkIn: string
  checkOut: string
  travelers: number
  mealPlan: string
  roomType: string
  lang: 'ar' | 'en'
}

export class EmailService {
 private transporter?: nodemailer.Transporter
 private gmailService?: GmailService
 private isReady: boolean = false
 private emailProvider: 'gmail' | 'sendgrid' | 'smtp' | 'ethereal' = 'ethereal'

 constructor() {
 this.initializeTransporter()
 }

 private async initializeTransporter() {
 try {
 // Priority 1: Gmail with App Password (simplest!)
 const gmailUser = process.env.GMAIL_USER
 const gmailAppPassword = process.env.GMAIL_APP_PASSWORD
 
 if (gmailUser && gmailAppPassword) {
 console.log('📧 Initializing Gmail service...')
 this.gmailService = new GmailService()
 
 // Also create nodemailer transporter for Gmail
 this.transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
 user: gmailUser,
 pass: gmailAppPassword
 },
 tls: {
 rejectUnauthorized: false
 }
 })
 
 // Test connection
 await this.transporter.verify()
 console.log('✅ Gmail ready! (using App Password)')
 console.log(`📧 Sending from: ${gmailUser}`)
 this.emailProvider = 'gmail'
 this.isReady = true
 return
 }
 
 // Priority 2: SendGrid API Key
 const sendGridApiKey = process.env.SENDGRID_API_KEY
 
 if (sendGridApiKey) {
 console.log('📧 Initializing SendGrid...')
 this.transporter = nodemailer.createTransport({
 host: 'smtp.sendgrid.net',
 port: 587,
 auth: {
 user: 'apikey',
 pass: sendGridApiKey
 }
 })
 console.log('✅ SendGrid ready')
 this.emailProvider = 'sendgrid'
 this.isReady = true
 return
 }
 
 // Priority 3: Custom SMTP
 if (config.emailConfig) {
 console.log('📧 Initializing custom SMTP...')
 this.transporter = nodemailer.createTransport({
 host: config.emailConfig.host,
 port: config.emailConfig.port,
 secure: config.emailConfig.secure,
 auth: {
 user: config.emailConfig.user,
 pass: config.emailConfig.pass,
 }
 })
 console.log('✅ Custom SMTP ready')
 this.emailProvider = 'smtp'
 this.isReady = true
 return
 }
 
 // Priority 4: Ethereal test account (auto-created)
 console.log('📧 Creating test email account (Ethereal)...')
 const testAccount = await nodemailer.createTestAccount()
 
 this.transporter = nodemailer.createTransport({
 host: 'smtp.ethereal.email',
 port: 587,
 secure: false,
 auth: {
 user: testAccount.user,
 pass: testAccount.pass
 }
 })
 
 console.log('✅ Test email account created!')
 console.log('📧 Email User:', testAccount.user)
 console.log('🔗 Preview emails at: https://ethereal.email/messages')
 this.emailProvider = 'ethereal'
 this.isReady = true
 
 } catch (error: any) {
 console.warn('⚠️  Email service not available:', error.message)
 this.isReady = false
 }
 }

 async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
 console.log(`🔍 sendWelcomeEmail called for: ${data.email}`)
 console.log(`🔍 Email service ready: ${this.isReady}, Provider: ${this.emailProvider}`)
 
 if (!this.transporter || !this.isReady) {
 console.warn('⚠️  Email service not ready')
 return false
 }

 try {
 console.log(`📧 Preparing welcome email for ${data.email}...`)
 
 const subject = data.lang === 'ar' 
   ? '🎉 مرحباً بك في Quick Air - رحلتك تبدأ هنا!'
   : '🎉 Welcome to Quick Air - Your Journey Starts Here!'

 const html = this.generateWelcomeEmailHtml(data)
 
 // Get sender email based on provider
 const fromEmail = this.emailProvider === 'gmail' 
   ? process.env.GMAIL_USER
   : (process.env.SENDGRID_FROM_EMAIL || config.emailConfig?.user || 'noreply@quickair.com')

 console.log(`📤 Sending email from ${fromEmail} to ${data.email} via ${this.emailProvider}...`)
 
 const info = await this.transporter.sendMail({
 from: `Quick Air Travel <${fromEmail}>`,
 to: data.email,
 subject,
 html,
 })

 console.log(`✅ Welcome email sent to ${data.email} via ${this.emailProvider}`)
 
 // Log preview URL for Ethereal only
 if (this.emailProvider === 'ethereal') {
 console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info))
 }
 
 return true
 } catch (error: any) {
 console.error('❌ Failed to send welcome email:', error.message)
 return false
 }
 }

 async sendBookingConfirmation(data: BookingConfirmationData): Promise<boolean> {
 if (!this.transporter || !this.isReady) {
 console.warn('⚠️  Email service not ready')
 return false
 }

 try {
 const subject = data.lang === 'ar' 
   ? `✈️ تأكيد حجزك إلى ${data.destination} - Quick Air`
   : `✈️ Your Booking to ${data.destination} Confirmed - Quick Air`

 const html = this.generateBookingConfirmationHtml(data)
 
 const fromEmail = process.env.SENDGRID_FROM_EMAIL || 
                   config.emailConfig?.user || 
                   'noreply@quickair.com'

 const info = await this.transporter.sendMail({
 from: `Quick Air Travel <${fromEmail}>`,
 to: data.email,
 subject,
 html,
 })

 console.log(`✅ Booking confirmation email sent to ${data.email}`)
 
 // Log preview URL for Ethereal (test emails)
 if (process.env.NODE_ENV !== 'production' && !process.env.SENDGRID_API_KEY) {
 console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info))
 }
 
 return true
 } catch (error: any) {
 console.error('❌ Failed to send booking confirmation:', error.message)
 return false
 }
 }

 private generateWelcomeEmailHtml(data: WelcomeEmailData): string {
 if (data.lang === 'ar') {
 return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <style>
 * { margin: 0; padding: 0; box-sizing: border-box; }
 body { 
 font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
 background-color: #f4f7fa; 
 padding: 20px;
 }
 .email-container { 
 max-width: 600px; 
 margin: 0 auto; 
 background: #ffffff; 
 border-radius: 12px; 
 overflow: hidden; 
 box-shadow: 0 4px 20px rgba(0,0,0,0.08);
 }
 .header { 
 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 padding: 40px 30px;
 text-align: center;
 }
 .logo {
 width: 120px;
 height: 120px;
 margin: 0 auto 20px;
 background: white;
 border-radius: 50%;
 display: flex;
 align-items: center;
 justify-content: center;
 box-shadow: 0 4px 15px rgba(0,0,0,0.15);
 }
 .logo-text {
 font-size: 36px;
 font-weight: bold;
 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 background-clip: text;
 }
 .header h1 { 
 color: white; 
 font-size: 28px; 
 margin-bottom: 10px;
 font-weight: 600;
 }
 .header p { 
 color: rgba(255,255,255,0.9); 
 font-size: 16px;
 }
 .content { 
 padding: 40px 30px;
 }
 .greeting { 
 font-size: 22px; 
 color: #2d3748; 
 margin-bottom: 20px;
 font-weight: 600;
 }
 .message { 
 font-size: 16px; 
 line-height: 1.8; 
 color: #4a5568; 
 margin-bottom: 30px;
 }
 .features-grid {
 display: grid;
 gap: 20px;
 margin: 30px 0;
 }
 .feature-card {
 background: #f7fafc;
 border-right: 4px solid #667eea;
 padding: 20px;
 border-radius: 8px;
 transition: transform 0.2s;
 }
 .feature-title {
 font-weight: 600;
 color: #2d3748;
 margin-bottom: 8px;
 font-size: 16px;
 }
 .feature-desc {
 color: #718096;
 font-size: 14px;
 line-height: 1.6;
 }
 .cta-section {
 text-align: center;
 margin: 35px 0;
 }
 .cta-button {
 display: inline-block;
 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 color: white;
 text-decoration: none;
 padding: 16px 40px;
 border-radius: 8px;
 font-size: 16px;
 font-weight: 600;
 box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
 transition: transform 0.2s;
 }
 .cta-button:hover {
 transform: translateY(-2px);
 box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
 }
 .footer {
 background: #f7fafc;
 padding: 30px;
 text-align: center;
 border-top: 1px solid #e2e8f0;
 }
 .footer-links {
 margin: 20px 0;
 }
 .footer-links a {
 color: #667eea;
 text-decoration: none;
 margin: 0 15px;
 font-size: 14px;
 }
 .footer-text {
 color: #a0aec0;
 font-size: 13px;
 margin-top: 15px;
 }
 .contact-info {
 margin: 20px 0;
 color: #4a5568;
 font-size: 14px;
 }
 </style>
</head>
<body>
 <div class="email-container">
 <div class="header">
 <div class="logo">
 <div class="logo-text">Q</div>
 </div>
 <h1>مرحباً بك في Quick Air</h1>
 <p>رحلتك القادمة تبدأ هنا</p>
 </div>
 
 <div class="content">
 <div class="greeting">أهلاً ${data.name}</div>
 
 <div class="message">
 يسعدنا انضمامك إلى Quick Air، شريكك الموثوق في عالم السفر. نحن هنا لنجعل كل رحلة تجربة لا تُنسى.
 </div>
 
 <div class="features-grid">
 <div class="feature-card">
 <div class="feature-title">وجهات عالمية مميزة</div>
 <div class="feature-desc">اكتشف أجمل الوجهات حول العالم بأفضل الأسعار والعروض الحصرية</div>
 </div>
 
 <div class="feature-card">
 <div class="feature-title">فنادق فاخرة ومختارة</div>
 <div class="feature-desc">إقامة فاخرة في أرقى الفنادق المصنفة عالمياً</div>
 </div>
 
 <div class="feature-card">
 <div class="feature-title">خدمة عملاء متميزة</div>
 <div class="feature-desc">فريقنا متواجد على مدار الساعة لخدمتك ومساعدتك</div>
 </div>
 
 <div class="feature-card">
 <div class="feature-title">أسعار تنافسية</div>
 <div class="feature-desc">عروض وخصومات خاصة لعملائنا الكرام</div>
 </div>
 </div>
 
 <div class="message">
 هل أنت مستعد للبدء؟ تصفح عروضنا المميزة واحجز رحلتك القادمة اليوم.
 </div>
 
 <div class="cta-section">
 <a href="https://quickair.com" class="cta-button">استكشف العروض</a>
 </div>
 </div>
 
 <div class="footer">
 <div class="footer-links">
 <a href="https://quickair.com/about">من نحن</a>
 <a href="https://quickair.com/contact">تواصل معنا</a>
 <a href="https://quickair.com/terms">الشروط والأحكام</a>
 </div>
 
 <div class="contact-info">
 <p>تواصل معنا: ${data.phone || '+201061469904'}</p>
 <p>البريد الإلكتروني: info@quickair.com</p>
 </div>
 
 <div class="footer-text">
 <p>© 2025 Quick Air. جميع الحقوق محفوظة.</p>
 <p>رحلتك، راحتك، أولويتنا</p>
 </div>
 </div>
 </div>
</body>
</html>
 `
 } else {
 return `
<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <style>
 * { margin: 0; padding: 0; box-sizing: border-box; }
 body { 
 font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
 background-color: #f4f7fa; 
 padding: 20px;
 }
 .email-container { 
 max-width: 600px; 
 margin: 0 auto; 
 background: #ffffff; 
 border-radius: 12px; 
 overflow: hidden; 
 box-shadow: 0 4px 20px rgba(0,0,0,0.08);
 }
 .header { 
 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 padding: 40px 30px;
 text-align: center;
 }
 .logo {
 width: 120px;
 height: 120px;
 margin: 0 auto 20px;
 background: white;
 border-radius: 50%;
 display: flex;
 align-items: center;
 justify-content: center;
 box-shadow: 0 4px 15px rgba(0,0,0,0.15);
 }
 .logo-text {
 font-size: 36px;
 font-weight: bold;
 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 background-clip: text;
 }
 .header h1 { 
 color: white; 
 font-size: 28px; 
 margin-bottom: 10px;
 font-weight: 600;
 }
 .header p { 
 color: rgba(255,255,255,0.9); 
 font-size: 16px;
 }
 .content { 
 padding: 40px 30px;
 }
 .greeting { 
 font-size: 22px; 
 color: #2d3748; 
 margin-bottom: 20px;
 font-weight: 600;
 }
 .message { 
 font-size: 16px; 
 line-height: 1.8; 
 color: #4a5568; 
 margin-bottom: 30px;
 }
 .features-grid {
 display: grid;
 gap: 20px;
 margin: 30px 0;
 }
 .feature-card {
 background: #f7fafc;
 border-left: 4px solid #667eea;
 padding: 20px;
 border-radius: 8px;
 transition: transform 0.2s;
 }
 .feature-title {
 font-weight: 600;
 color: #2d3748;
 margin-bottom: 8px;
 font-size: 16px;
 }
 .feature-desc {
 color: #718096;
 font-size: 14px;
 line-height: 1.6;
 }
 .cta-section {
 text-align: center;
 margin: 35px 0;
 }
 .cta-button {
 display: inline-block;
 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 color: white;
 text-decoration: none;
 padding: 16px 40px;
 border-radius: 8px;
 font-size: 16px;
 font-weight: 600;
 box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
 transition: transform 0.2s;
 }
 .cta-button:hover {
 transform: translateY(-2px);
 box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
 }
 .footer {
 background: #f7fafc;
 padding: 30px;
 text-align: center;
 border-top: 1px solid #e2e8f0;
 }
 .footer-links {
 margin: 20px 0;
 }
 .footer-links a {
 color: #667eea;
 text-decoration: none;
 margin: 0 15px;
 font-size: 14px;
 }
 .footer-text {
 color: #a0aec0;
 font-size: 13px;
 margin-top: 15px;
 }
 .contact-info {
 margin: 20px 0;
 color: #4a5568;
 font-size: 14px;
 }
 </style>
</head>
<body>
 <div class="email-container">
 <div class="header">
 <div class="logo">
 <div class="logo-text">Q</div>
 </div>
 <h1>Welcome to Quick Air</h1>
 <p>Your Journey Starts Here</p>
 </div>
 
 <div class="content">
 <div class="greeting">Hello ${data.name}</div>
 
 <div class="message">
 We're delighted to have you join Quick Air, your trusted travel partner. We're here to make every journey an unforgettable experience.
 </div>
 
 <div class="features-grid">
 <div class="feature-card">
 <div class="feature-title">Exclusive Destinations</div>
 <div class="feature-desc">Discover the world's most beautiful destinations with our best prices and exclusive offers</div>
 </div>
 
 <div class="feature-card">
 <div class="feature-title">Luxury Hotels</div>
 <div class="feature-desc">Stay in the finest internationally rated hotels</div>
 </div>
 
 <div class="feature-card">
 <div class="feature-title">24/7 Support</div>
 <div class="feature-desc">Our team is available around the clock to serve and assist you</div>
 </div>
 
 <div class="feature-card">
 <div class="feature-title">Competitive Prices</div>
 <div class="feature-desc">Special offers and discounts for our valued customers</div>
 </div>
 </div>
 
 <div class="message">
 Ready to get started? Browse our exclusive offers and book your next trip today.
 </div>
 
 <div class="cta-section">
 <a href="https://quickair.com" class="cta-button">Explore Offers</a>
 </div>
 </div>
 
 <div class="footer">
 <div class="footer-links">
 <a href="https://quickair.com/about">About Us</a>
 <a href="https://quickair.com/contact">Contact</a>
 <a href="https://quickair.com/terms">Terms & Conditions</a>
 </div>
 
 <div class="contact-info">
 <p>Contact us: ${data.phone || '+201061469904'}</p>
 <p>Email: info@quickair.com</p>
 </div>
 
 <div class="footer-text">
 <p>© 2025 Quick Air. All rights reserved.</p>
 <p>Your Journey, Your Comfort, Our Priority</p>
 </div>
 </div>
 </div>
</body>
</html>
 `
 }
 }

 private generateBookingConfirmationHtml(data: BookingConfirmationData): string {
 // Similar template for booking confirmation
 // Will be implemented when needed
 return ''
 }

 async sendSupportEmail(data: {
 name: string
 email: string
 phone: string
 message: string
 userId: string
 lang: 'ar' | 'en'
 }): Promise<void> {
 if (!this.transporter || !this.isReady) {
 throw new Error('Email service not ready')
 }

 const subject = EMAIL_TEMPLATES.subject[data.lang]
 const html = EMAIL_TEMPLATES.generateHtml({
 userId: data.userId,
 name: data.name,
 email: data.email,
 phone: data.phone,
 message: data.message,
 })
 
 const fromEmail = process.env.SENDGRID_FROM_EMAIL || 
                   config.emailConfig?.user || 
                   'noreply@quickair.com'
 
 const supportEmail = config.supportEmail || fromEmail

 const info = await this.transporter.sendMail({
 from: `Quick Air Support <${fromEmail}>`,
 to: supportEmail,
 subject,
 html,
 })
 
 // Log preview URL for Ethereal (test emails)
 if (process.env.NODE_ENV !== 'production' && !process.env.SENDGRID_API_KEY) {
 console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info))
 }
 }

 isConfigured(): boolean {
 return this.isReady
 }
}
