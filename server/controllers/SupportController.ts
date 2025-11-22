import type { Request, Response } from 'express'
import type { SupportRequest, SupportResponse } from '../types/index.js'
import { EmailService } from '../services/index.js'

export class SupportController {
 private emailService: EmailService

 constructor() {
 this.emailService = new EmailService()
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

 if (!this.emailService.isConfigured()) {
 const response: SupportResponse = { 
 ok: false, 
 error: 'Email is not configured on the server.' 
 }
 res.status(500).json(response)
 return
 }

 await this.emailService.sendSupportEmail({
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
 console.error('Support email error:', error)
 const response: SupportResponse = { 
 ok: false, 
 error: 'Failed to send support request.' 
 }
 res.status(500).json(response)
 }
 }
}
