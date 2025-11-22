// ===================================
// REQUEST MIDDLEWARE
// Request logging and CORS handling
// ===================================

import type { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'

// ============ Request Logger ============

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  logger.info('Request', `${req.method} ${req.path}`, {
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined
  })
  next()
}

// ============ CORS Handler ============

export const corsHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
}
