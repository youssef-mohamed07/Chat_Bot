// ===================================
// SERVER CONFIGURATION
// Environment variables and config
// ===================================

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '../../../.env')

console.log('📂 Looking for .env at:', envPath)
const result = dotenv.config({ path: envPath })

if (result.error) {
  console.error('❌ Error loading .env:', result.error)
} else {
  console.log('✅ .env loaded successfully')
}

// ============ Config Types ============

export interface EmailConfig {
  host: string
  port: number
  user: string
  pass: string
  secure: boolean
}

export interface ServerConfig {
  port: number
  model: string
  geminiKey: string
  supportEmail?: string
  emailConfig?: EmailConfig
}

// ============ Config Object ============

export const config: ServerConfig = {
  port: Number(process.env.PORT) || 9090,
  model: process.env.MODEL || 'gemini-2.0-flash-001',
  geminiKey: process.env.GEMINI_KEY ?? '',
  supportEmail: process.env.SUPPORT_TO,
  emailConfig: process.env.SMTP_HOST ? {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    secure: false
  } : undefined
}

// ============ Config Validation ============

export const validateConfig = (): void => {
  if (!config.geminiKey) {
    console.warn('\n⚠️  WARNING: GEMINI_KEY is not set!')
    console.warn('   Please create a .env file in the root directory with:')
    console.warn('   GEMINI_KEY=your_api_key_here')
    console.warn('\n   Get your API key from: https://makersuite.google.com/app/apikey')
    console.warn('   Server will start with demo mode (limited functionality)\n')
  }
}

export const validateEnvironment = (): void => {
  const requiredEnvVars = ['GEMINI_KEY']
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`)
    process.exit(1)
  }
}

// Export constants
export * from './constants.js'
