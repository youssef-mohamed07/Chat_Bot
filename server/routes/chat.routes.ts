// ===================================
// CHAT ROUTES
// Routes for chat endpoints
// ===================================

import { Router, type Request, type Response } from 'express'
import { ChatController } from '../controllers/ChatController.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const chatController = new ChatController()

// POST /chat - Regular chat endpoint
router.post(
  '/',
  asyncHandler((req: Request, res: Response) => chatController.handleChat(req, res))
)

// POST /chat/stream - Streaming chat endpoint
router.post(
  '/stream',
  asyncHandler((req: Request, res: Response) => chatController.handleStreamingChat(req, res))
)

export default router
