import dotenv from 'dotenv'
import type { ServerConfig, EmailConfig } from './types'

dotenv.config()

export const config: ServerConfig = {
  port: Number(process.env.PORT) || 3000,
  model: process.env.MODEL || 'openai/gpt-4o-mini',
  openRouterKey: process.env.OPENROUTER_KEY || '',
  supportEmail: process.env.SUPPORT_TO,
  emailConfig: process.env.SMTP_HOST ? {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    secure: false
  } : undefined
}

export const validateConfig = (): void => {
  if (!config.openRouterKey) {
    console.error('\n❌ ERROR: OPENROUTER_KEY is not set!')
    console.error('📝 Please create a .env file in the root directory with:')
    console.error('   OPENROUTER_KEY=your_api_key_here')
    console.error('\n🔑 Get your API key from: https://openrouter.ai/keys\n')
    process.exit(1)
  }
}
