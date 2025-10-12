import type { SupportRequest } from '../types/index.js'
import { WhatsAppService } from './WhatsAppService.js'
import { InstagramService } from './InstagramService.js'
import { MessengerService } from './MessengerService.js'

export type Platform = 'whatsapp' | 'instagram' | 'messenger' | 'all'

export interface PlatformResponse {
  platform: string
  success: boolean
  messageId?: string
  error?: string
}

export class MultiPlatformService {
  private whatsappService: WhatsAppService
  private instagramService: InstagramService
  private messengerService: MessengerService

  constructor() {
    this.whatsappService = new WhatsAppService()
    this.instagramService = new InstagramService()
    this.messengerService = new MessengerService()
  }

  getAvailablePlatforms(): Platform[] {
    const platforms: Platform[] = []
    
    if (this.whatsappService.isConfigured()) {
      platforms.push('whatsapp')
    }
    
    if (this.instagramService.isConfigured()) {
      platforms.push('instagram')
    }
    
    if (this.messengerService.isConfigured()) {
      platforms.push('messenger')
    }
    
    return platforms
  }

  async sendSupportMessage(supportData: SupportRequest, platform: Platform = 'all'): Promise<PlatformResponse[]> {
    const results: PlatformResponse[] = []
    
    if (platform === 'all') {
      // Send to all available platforms
      const availablePlatforms = this.getAvailablePlatforms()
      
      for (const p of availablePlatforms) {
        try {
          const result = await this.sendToPlatform(supportData, p)
          results.push(result)
        } catch (error) {
          results.push({
            platform: p,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    } else {
      // Send to specific platform
      try {
        const result = await this.sendToPlatform(supportData, platform)
        results.push(result)
      } catch (error) {
        results.push({
          platform,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return results
  }

  private async sendToPlatform(supportData: SupportRequest, platform: Platform): Promise<PlatformResponse> {
    switch (platform) {
      case 'whatsapp':
        if (!this.whatsappService.isConfigured()) {
          throw new Error('WhatsApp is not configured')
        }
        const whatsappResponse = await this.whatsappService.sendSupportMessage(supportData)
        return {
          platform: 'whatsapp',
          success: true,
          messageId: whatsappResponse.messages?.[0]?.id
        }

      case 'instagram':
        if (!this.instagramService.isConfigured()) {
          throw new Error('Instagram is not configured')
        }
        const instagramResponse = await this.instagramService.sendSupportMessage(supportData)
        return {
          platform: 'instagram',
          success: true,
          messageId: instagramResponse.message_id
        }

      case 'messenger':
        if (!this.messengerService.isConfigured()) {
          throw new Error('Messenger is not configured')
        }
        const messengerResponse = await this.messengerService.sendSupportMessage(supportData)
        return {
          platform: 'messenger',
          success: true,
          messageId: messengerResponse.message_id
        }

      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  generateSupportLinks(supportData: SupportRequest): Record<string, string> {
    const links: Record<string, string> = {}
    
    if (this.whatsappService.isConfigured()) {
      links.whatsapp = this.whatsappService.generateSupportWhatsAppLink(supportData)
    }
    
    if (this.instagramService.isConfigured()) {
      links.instagram = this.instagramService.generateSupportInstagramLink(supportData)
    }
    
    if (this.messengerService.isConfigured()) {
      links.messenger = this.messengerService.generateSupportMessengerLink(supportData)
    }
    
    return links
  }

  getPlatformStatus(): Record<string, boolean> {
    return {
      whatsapp: this.whatsappService.isConfigured(),
      instagram: this.instagramService.isConfigured(),
      messenger: this.messengerService.isConfigured()
    }
  }

  getPlatformEmojis(): Record<string, string> {
    return {
      whatsapp: '📱',
      instagram: '📸',
      messenger: '💬'
    }
  }

  formatPlatformList(lang: 'ar' | 'en'): string {
    const availablePlatforms = this.getAvailablePlatforms()
    const emojis = this.getPlatformEmojis()
    
    if (availablePlatforms.length === 0) {
      return lang === 'ar' 
        ? 'لا توجد منصات متاحة حالياً'
        : 'No platforms are currently available'
    }
    
    const platformNames = {
      ar: {
        whatsapp: 'واتساب',
        instagram: 'إنستجرام',
        messenger: 'ماسنجر'
      },
      en: {
        whatsapp: 'WhatsApp',
        instagram: 'Instagram',
        messenger: 'Messenger'
      }
    }
    
    const formattedPlatforms = availablePlatforms.map(platform => 
      `${emojis[platform as keyof typeof emojis]} ${platformNames[lang][platform as keyof typeof platformNames[typeof lang]]}`
    ).join(', ')
    
    return lang === 'ar' 
      ? `متاح على: ${formattedPlatforms}`
      : `Available on: ${formattedPlatforms}`
  }
}
