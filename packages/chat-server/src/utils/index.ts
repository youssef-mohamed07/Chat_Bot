// ===================================
// SERVER UTILITIES
// Helper functions for server
// ===================================

// ============ Error Handlers ============

export const setupErrorHandlers = (): void => {
  process.on('unhandledRejection', (reason) => {
    console.error('⚠️  Unhandled Rejection:', reason)
    // Don't exit on unhandled rejection during development
  })

  process.on('uncaughtException', (err) => {
    console.error('⚠️  Uncaught Exception:', err)
    // Don't exit immediately - log and continue
  })
}

// ============ Logging ============

export const logServerStart = (port: number): void => {
  console.log(`🚀 Quick Air AI Agent running on http://localhost:${port}`)
}

export const logRequest = (method: string, path: string): void => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${method} ${path}`)
}

export const logError = (context: string, error: any): void => {
  console.error(`❌ [${context}]`, error)
}

export const logInfo = (context: string, message: string): void => {
  console.log(`ℹ️  [${context}] ${message}`)
}

export const logWarning = (context: string, message: string): void => {
  console.warn(`⚠️  [${context}] ${message}`)
}

// ============ Validation Helpers ============

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  // Egyptian phone numbers: 01[0-2,5]\d{8} or international format
  const phoneRegex = /^(\+?20)?0?1[0125]\d{8}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '')
}
