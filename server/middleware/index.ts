import type { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('❌ Server Error:', error)
  res.status(500).json({ error: 'Internal server error' })
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({ error: 'Route not found' })
}

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path}`)
  next()
}

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
