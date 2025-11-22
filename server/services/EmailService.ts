import nodemailer from 'nodemailer'
import type { EmailConfig } from '../shared.js'
import { config, EMAIL_TEMPLATES } from '../shared.js'

export class EmailService {
 private transporter?: nodemailer.Transporter

 constructor() {
 if (config.emailConfig) {
 this.transporter = nodemailer.createTransport({
 host: config.emailConfig.host,
 port: config.emailConfig.port,
 secure: config.emailConfig.secure,
 auth: {
 user: config.emailConfig.user,
 pass: config.emailConfig.pass,
 },
 })
 }
 }

 async sendSupportEmail(data: {
 name: string
 email: string
 phone: string
 message: string
 userId: string
 lang: 'ar' | 'en'
 }): Promise<void> {
 if (!this.transporter || !config.supportEmail) {
 throw new Error('Email is not configured on the server.')
 }

 const subject = EMAIL_TEMPLATES.subject[data.lang]
 const html = EMAIL_TEMPLATES.generateHtml({
 userId: data.userId,
 name: data.name,
 email: data.email,
 phone: data.phone,
 message: data.message,
 })

 await this.transporter.sendMail({
 from: `Quick Air Support <${config.emailConfig!.user}>`,
 to: config.supportEmail,
 subject,
 html,
 })
 }

 isConfigured(): boolean {
 return !!(this.transporter && config.supportEmail)
 }
}
