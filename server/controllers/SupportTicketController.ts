import type { Request, Response } from 'express'
import { DatabaseService, NotificationService } from '../services/index.js'

export class SupportTicketController {
  private databaseService: DatabaseService
  private notificationService: NotificationService

  constructor() {
    this.databaseService = new DatabaseService()
    this.notificationService = new NotificationService(this.databaseService, {
      enableEmailNotifications: false,
      enableConsoleNotifications: true
    })
  }

  async getAllTickets(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query
      const tickets = await this.databaseService.getAllSupportTickets(status as string)
      
      res.json({
        success: true,
        tickets,
        count: tickets.length
      })
    } catch (error) {
      console.error('Failed to get tickets:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve support tickets'
      })
    }
  }

  async getTicket(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const ticketId = parseInt(id)
      
      if (isNaN(ticketId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid ticket ID'
        })
        return
      }

      const ticket = await this.databaseService.getSupportTicket(ticketId)
      
      if (!ticket) {
        res.status(404).json({
          success: false,
          error: 'Ticket not found'
        })
        return
      }

      res.json({
        success: true,
        ticket
      })
    } catch (error) {
      console.error('Failed to get ticket:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve ticket'
      })
    }
  }

  async updateTicketStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { status, whatsappMessageId } = req.body
      const ticketId = parseInt(id)
      
      if (isNaN(ticketId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid ticket ID'
        })
        return
      }

      const validStatuses = ['pending', 'in_progress', 'resolved', 'closed']
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        })
        return
      }

      // Get current ticket to track status change
      const currentTicket = await this.databaseService.getSupportTicket(ticketId)
      if (!currentTicket) {
        res.status(404).json({
          success: false,
          error: 'Ticket not found'
        })
        return
      }

      await this.databaseService.updateSupportTicketStatus(ticketId, status, whatsappMessageId)
      
      // Send notification about status change
      await this.notificationService.notifyTicketStatusUpdate(
        ticketId, 
        currentTicket.status, 
        status
      )

      res.json({
        success: true,
        message: `Ticket ${ticketId} status updated to ${status}`
      })
    } catch (error) {
      console.error('Failed to update ticket status:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update ticket status'
      })
    }
  }

  async getTicketStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.notificationService.getSupportTicketStats()
      
      res.json({
        success: true,
        stats
      })
    } catch (error) {
      console.error('Failed to get ticket stats:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve ticket statistics'
      })
    }
  }

  async getUserTickets(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params
      
      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        })
        return
      }

      const tickets = await this.databaseService.getTicketsByUser(userId)
      
      res.json({
        success: true,
        tickets,
        count: tickets.length
      })
    } catch (error) {
      console.error('Failed to get user tickets:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user tickets'
      })
    }
  }

  async printStats(req: Request, res: Response): Promise<void> {
    try {
      await this.notificationService.printSupportTicketStats()
      
      res.json({
        success: true,
        message: 'Statistics printed to console'
      })
    } catch (error) {
      console.error('Failed to print stats:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to print statistics'
      })
    }
  }
}
