import { Router } from 'express'
import { ChatController, SupportController } from '../controllers/index.js'

const router = Router()

// Initialize controllers
const chatController = new ChatController()
const supportController = new SupportController()

// Chat routes
router.post('/chat', (req, res) => chatController.handleChat(req, res))
router.post('/chat/stream', (req, res) => chatController.handleStreamingChat(req, res))

// Support routes
router.post('/support/request', (req, res) => supportController.handleSupportRequest(req, res))

export default router
