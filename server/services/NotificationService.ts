import { DatabaseService, SupportTicket } from './DatabaseService.js'

export interface NotificationConfig {
  enableEmailNotifications: boolean
  enableConsoleNotifications: boolean
  adminEmail?: string
}

export class NotificationService {
  private databaseService: DatabaseService
  private config: NotificationConfig

  constructor(databaseService: DatabaseService, config: NotificationConfig) {
    this.databaseService = databaseService
    this.config = config
  }

  async notifyNewSupportTicket(ticket: SupportTicket): Promise<void> {
    console.log('\n🚨 ===== NEW SUPPORT TICKET =====')
    console.log(`📋 Ticket ID: ${ticket.id}`)
    console.log(`👤 User: ${ticket.name} (${ticket.userId})`)
    console.log(`📧 Email: ${ticket.email || 'Not provided'}`)
    console.log(`📱 Phone: ${ticket.phone || 'Not provided'}`)
    console.log(`🌐 Language: ${ticket.lang}`)
    console.log(`💬 Message: ${ticket.message}`)
    console.log(`⏰ Created: ${ticket.createdAt}`)
    console.log(`📊 Status: ${ticket.status}`)
    console.log('================================\n')

    // Send email notification if configured
    if (this.config.enableEmailNotifications && this.config.adminEmail) {
      await this.sendEmailNotification(ticket)
    }

    // Log to file for persistence
    await this.logToFile(ticket)
  }

  async notifyTicketStatusUpdate(ticketId: number, oldStatus: string, newStatus: string): Promise<void> {
    console.log(`\n🔄 ===== TICKET STATUS UPDATE =====`)
    console.log(`📋 Ticket ID: ${ticketId}`)
    console.log(`📊 Status: ${oldStatus} → ${newStatus}`)
    console.log(`⏰ Updated: ${new Date().toISOString()}`)
    console.log('==================================\n')
  }

  async notifyPendingTicketsCount(): Promise<void> {
    try {
      const pendingCount = await this.databaseService.getPendingTicketsCount()
      
      if (pendingCount > 0) {
        console.log(`\n⚠️  PENDING SUPPORT TICKETS: ${pendingCount}`)
        console.log('=====================================\n')
      }
    } catch (error) {
      console.error('❌ Failed to get pending tickets count:', error)
    }
  }

  private async sendEmailNotification(ticket: SupportTicket): Promise<void> {
    // This would integrate with your existing EmailService
    // For now, we'll just log the email content
    console.log('\n📧 EMAIL NOTIFICATION:')
    console.log(`To: ${this.config.adminEmail}`)
    console.log(`Subject: New Support Ticket #${ticket.id} - ${ticket.name}`)
    console.log(`Body: New support ticket received from ${ticket.name}`)
    console.log('=====================================\n')
  }

  private async logToFile(ticket: SupportTicket): Promise<void> {
    const fs = await import('fs/promises')
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'NEW_SUPPORT_TICKET',
      ticketId: ticket.id,
      userId: ticket.userId,
      name: ticket.name,
      email: ticket.email,
      phone: ticket.phone,
      message: ticket.message,
      lang: ticket.lang,
      status: ticket.status
    }

    try {
      const logFile = 'support_tickets.log'
      const logLine = JSON.stringify(logEntry) + '\n'
      await fs.appendFile(logFile, logLine)
    } catch (error) {
      console.error('❌ Failed to log to file:', error)
    }
  }

  async getSupportTicketStats(): Promise<{
    total: number
    pending: number
    inProgress: number
    resolved: number
    closed: number
  }> {
    try {
      const allTickets = await this.databaseService.getAllSupportTickets()
      
      const stats = {
        total: allTickets.length,
        pending: allTickets.filter(t => t.status === 'pending').length,
        inProgress: allTickets.filter(t => t.status === 'in_progress').length,
        resolved: allTickets.filter(t => t.status === 'resolved').length,
        closed: allTickets.filter(t => t.status === 'closed').length
      }

      return stats
    } catch (error) {
      console.error('❌ Failed to get support ticket stats:', error)
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0
      }
    }
  }

  async printSupportTicketStats(): Promise<void> {
    const stats = await this.getSupportTicketStats()
    
    console.log('\n📊 ===== SUPPORT TICKETS STATISTICS =====')
    console.log(`📋 Total Tickets: ${stats.total}`)
    console.log(`⏳ Pending: ${stats.pending}`)
    console.log(`🔄 In Progress: ${stats.inProgress}`)
    console.log(`✅ Resolved: ${stats.resolved}`)
    console.log(`🔒 Closed: ${stats.closed}`)
    console.log('==========================================\n')
  }
}
