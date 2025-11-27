// ===================================
// ERROR HANDLER MIDDLEWARE
// Custom error classes and handler
// ===================================

import type { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'

// ============ Custom Error Classes ============

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, true)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, message, true)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, true)
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(500, message, false)
  }
}

// ============ Error Handler Middleware ============

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('ErrorHandler', 'Request error occurred', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack
  })

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
    return
  }

  // Unknown error - log and return 500
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      message: err.message,
      stack: err.stack 
    })
  })
}

// ============ Not Found Handler ============

export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn('NotFoundHandler', `Route not found: ${req.method} ${req.path}`)
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  })
}

// ============ Async Handler Wrapper ============

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
