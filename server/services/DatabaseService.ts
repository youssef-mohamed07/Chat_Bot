import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import path from 'path'

export interface SupportTicket {
  id?: number
  userId: string
  name: string
  email: string
  phone: string
  message: string
  lang: 'ar' | 'en'
  status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  whatsappMessageId?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

export class DatabaseService {
  private db: sqlite3.Database
  private dbRun: (sql: string, params?: any[]) => Promise<any>
  private dbGet: (sql: string, params?: any[]) => Promise<any>
  private dbAll: (sql: string, params?: any[]) => Promise<any[]>

  constructor() {
    const dbPath = path.join(process.cwd(), 'support_tickets.db')
    this.db = new sqlite3.Database(dbPath)
    
    // Promisify database methods
    this.dbRun = promisify(this.db.run.bind(this.db))
    this.dbGet = promisify(this.db.get.bind(this.db))
    this.dbAll = promisify(this.db.all.bind(this.db))
    
    this.initializeDatabase()
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await this.dbRun(`
        CREATE TABLE IF NOT EXISTS support_tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          message TEXT NOT NULL,
          lang TEXT NOT NULL CHECK (lang IN ('ar', 'en')),
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
          whatsappMessageId TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          resolvedAt DATETIME
        )
      `)

      // Create index for better performance
      await this.dbRun(`
        CREATE INDEX IF NOT EXISTS idx_support_tickets_userId ON support_tickets(userId)
      `)
      
      await this.dbRun(`
        CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status)
      `)

      console.log('✅ Database initialized successfully')
    } catch (error) {
      console.error('❌ Database initialization failed:', error)
    }
  }

  async createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    try {
      const result = await this.dbRun(`
        INSERT INTO support_tickets (userId, name, email, phone, message, lang, status, whatsappMessageId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        ticket.userId,
        ticket.name,
        ticket.email,
        ticket.phone,
        ticket.message,
        ticket.lang,
        ticket.status,
        ticket.whatsappMessageId
      ])

      console.log(`✅ Support ticket created with ID: ${result.lastID}`)
      return result.lastID
    } catch (error) {
      console.error('❌ Failed to create support ticket:', error)
      throw error
    }
  }

  async getSupportTicket(id: number): Promise<SupportTicket | null> {
    try {
      const ticket = await this.dbGet(`
        SELECT * FROM support_tickets WHERE id = ?
      `, [id])

      return ticket || null
    } catch (error) {
      console.error('❌ Failed to get support ticket:', error)
      throw error
    }
  }

  async getAllSupportTickets(status?: string): Promise<SupportTicket[]> {
    try {
      let query = 'SELECT * FROM support_tickets'
      let params: any[] = []

      if (status) {
        query += ' WHERE status = ?'
        params.push(status)
      }

      query += ' ORDER BY createdAt DESC'

      const tickets = await this.dbAll(query, params)
      return tickets
    } catch (error) {
      console.error('❌ Failed to get support tickets:', error)
      throw error
    }
  }

  async updateSupportTicketStatus(id: number, status: SupportTicket['status'], whatsappMessageId?: string): Promise<void> {
    try {
      const updateFields = ['status = ?', 'updatedAt = CURRENT_TIMESTAMP']
      const params: any[] = [status]

      if (whatsappMessageId) {
        updateFields.push('whatsappMessageId = ?')
        params.push(whatsappMessageId)
      }

      if (status === 'resolved' || status === 'closed') {
        updateFields.push('resolvedAt = CURRENT_TIMESTAMP')
      }

      params.push(id)

      await this.dbRun(`
        UPDATE support_tickets 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, params)

      console.log(`✅ Support ticket ${id} status updated to ${status}`)
    } catch (error) {
      console.error('❌ Failed to update support ticket:', error)
      throw error
    }
  }

  async getPendingTicketsCount(): Promise<number> {
    try {
      const result = await this.dbGet(`
        SELECT COUNT(*) as count FROM support_tickets WHERE status = 'pending'
      `)
      return result.count
    } catch (error) {
      console.error('❌ Failed to get pending tickets count:', error)
      return 0
    }
  }

  async getTicketsByUser(userId: string): Promise<SupportTicket[]> {
    try {
      const tickets = await this.dbAll(`
        SELECT * FROM support_tickets 
        WHERE userId = ? 
        ORDER BY createdAt DESC
      `, [userId])
      return tickets
    } catch (error) {
      console.error('❌ Failed to get tickets by user:', error)
      throw error
    }
  }

  async closeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          console.error('❌ Failed to close database:', err)
          reject(err)
        } else {
          console.log('✅ Database connection closed')
          resolve()
        }
      })
    })
  }
}
