// ===================================
// LOGGER SERVICE
// Structured logging utility
// ===================================

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

class Logger {
  private formatMessage(level: LogLevel, context: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString()
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : ''
    return `[${timestamp}] [${level}] [${context}] ${message}${metaStr}`
  }

  debug(context: string, message: string, meta?: any): void {
    console.debug(this.formatMessage(LogLevel.DEBUG, context, message, meta))
  }

  info(context: string, message: string, meta?: any): void {
    console.log(this.formatMessage(LogLevel.INFO, context, message, meta))
  }

  warn(context: string, message: string, meta?: any): void {
    console.warn(this.formatMessage(LogLevel.WARN, context, message, meta))
  }

  error(context: string, message: string, error?: any): void {
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error
    console.error(this.formatMessage(LogLevel.ERROR, context, message, errorDetails))
  }
}

export const logger = new Logger()
