import type { Request, Response } from 'express'
import { MultiPlatformService } from '../services/index.js'

export class PlatformController {
  private multiPlatformService: MultiPlatformService

  constructor() {
    this.multiPlatformService = new MultiPlatformService()
  }

  async getPlatformStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = this.multiPlatformService.getPlatformStatus()
      const availablePlatforms = this.multiPlatformService.getAvailablePlatforms()
      const emojis = this.multiPlatformService.getPlatformEmojis()
      
      res.json({
        success: true,
        platforms: {
          status,
          available: availablePlatforms,
          emojis,
          count: availablePlatforms.length
        }
      })
    } catch (error) {
      console.error('Failed to get platform status:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve platform status'
      })
    }
  }

  async sendTestMessage(req: Request, res: Response): Promise<void> {
    try {
      const { platform = 'all', message = 'Test message from Quick Air support system' } = req.body
      
      const testData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        message: message,
        userId: 'test-user',
        lang: 'en' as const
      }

      const results = await this.multiPlatformService.sendSupportMessage(testData, platform)
      
      res.json({
        success: true,
        message: `Test message sent to ${platform}`,
        results
      })
    } catch (error) {
      console.error('Failed to send test message:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to send test message'
      })
    }
  }

  async getPlatformInfo(req: Request, res: Response): Promise<void> {
    try {
      const { lang = 'en' } = req.query
      const availablePlatforms = this.multiPlatformService.getAvailablePlatforms()
      const platformList = this.multiPlatformService.formatPlatformList(lang as 'ar' | 'en')
      const emojis = this.multiPlatformService.getPlatformEmojis()
      
      res.json({
        success: true,
        info: {
          availablePlatforms,
          platformList,
          emojis,
          count: availablePlatforms.length
        }
      })
    } catch (error) {
      console.error('Failed to get platform info:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve platform info'
      })
    }
  }
}
