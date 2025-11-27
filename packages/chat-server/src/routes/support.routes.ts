// ===================================
// SUPPORT ROUTES
// Routes for support endpoints
// ===================================

import { Router, type Request, type Response } from 'express'
import { SupportController } from '../controllers/SupportController.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const supportController = new SupportController()

// POST /support/request - Submit support request
router.post(
  '/request',
  asyncHandler((req: Request, res: Response) => supportController.handleSupportRequest(req, res))
)

export default router
