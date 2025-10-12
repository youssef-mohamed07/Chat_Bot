import { Router } from 'express'
import { ChatController, SupportController, WhatsAppController, SupportTicketController, PlatformController } from '../controllers/index.js'

const router = Router()

// Initialize controllers
const chatController = new ChatController()
const supportController = new SupportController()
const whatsappController = new WhatsAppController()
const supportTicketController = new SupportTicketController()
const platformController = new PlatformController()

// Chat routes
router.post('/chat', (req, res) => chatController.handleChat(req, res))
router.post('/chat/stream', (req, res) => chatController.handleStreamingChat(req, res))

// Support routes
router.post('/support/request', (req, res) => supportController.handleSupportRequest(req, res))

// WhatsApp routes
router.post('/whatsapp/support', (req, res) => whatsappController.handleSupportRequest(req, res))
router.post('/whatsapp/send', (req, res) => whatsappController.sendSupportMessage(req, res))

// Support Ticket Management routes
router.get('/tickets', (req, res) => supportTicketController.getAllTickets(req, res))
router.get('/tickets/stats', (req, res) => supportTicketController.getTicketStats(req, res))
router.get('/tickets/stats/print', (req, res) => supportTicketController.printStats(req, res))
router.get('/tickets/:id', (req, res) => supportTicketController.getTicket(req, res))
router.get('/tickets/user/:userId', (req, res) => supportTicketController.getUserTickets(req, res))
router.put('/tickets/:id/status', (req, res) => supportTicketController.updateTicketStatus(req, res))

// Platform Management routes
router.get('/platforms/status', (req, res) => platformController.getPlatformStatus(req, res))
router.get('/platforms/info', (req, res) => platformController.getPlatformInfo(req, res))
router.post('/platforms/test', (req, res) => platformController.sendTestMessage(req, res))

export default router
