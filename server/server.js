// ✈️ Quick Air AI Agent (Powered by OpenRouter)
// ==============================================

import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { config, validateConfig, setupErrorHandlers, logServerStart } from './shared.js'
import { ChatController, SupportController } from './controllers/index.js'
import { ragService } from './services/index.js'

// Initialize Express app
const app = express()

// Validate configuration
validateConfig()

// Setup error handlers
setupErrorHandlers()

// ============================================
// Middleware (embedded)
// ============================================
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path}`)
  next()
}

const corsHandler = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
}

const errorHandler = (error, req, res, next) => {
  console.error('❌ Server Error:', error)
  res.status(500).json({ error: 'Internal server error' })
}

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Route not found' })
}

// Apply middleware
app.use(cors())
app.use(corsHandler)
app.use(bodyParser.json())
app.use(requestLogger)

// ============================================
// Routes (embedded)
// ============================================

// Initialize controllers
const chatController = new ChatController()
const supportController = new SupportController()

// Chat routes
app.post('/chat', (req, res) => chatController.handleChat(req, res))
app.post('/chat/stream', (req, res) => chatController.handleStreamingChat(req, res))

// Support routes
app.post('/support/request', (req, res) => supportController.handleSupportRequest(req, res))

// Lightweight offers/RAG info endpoint
app.get('/offers/destinations', (req, res) => {
  const destinations = ragService.destinations()
  res.json({ destinations })
})

// Offer details by destination (language-aware)
app.get('/offers/:dest', (req, res) => {
  const destParam = String(req.params.dest || '').toLowerCase()
  const lang = (String(req.query.lang || 'en').toLowerCase() === 'ar') ? 'ar' : 'en'
  const dest = destParam === 'turkey' ? 'istanbul' : destParam

  const offer = ragService.getOfferByDestination(dest)
  if (!offer) {
    res.status(404).json({ error: 'not_found', message: `No offer for destination: ${dest}` })
    return
  }

  // If language-specific requested, filter text fields
  const filtered = { ...offer }
  const pick = (obj, key) => (obj && (obj[key] || [])) || []
  const pickText = (obj, key) => (obj && (obj[key] || '')) || ''

  filtered.title = lang === 'ar' ? (offer.title_ar || '') : (offer.title_en || '')
  filtered.validity_text = pickText(offer.validity, lang)
  filtered.includes = pick(offer.price_includes, lang)
  filtered.excludes = pick(offer.price_excludes, lang)
  filtered.visa = pick(offer.visa_requirements, lang)

  res.json({ dest, lang, offer: filtered })
})

// Error handling middleware
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
app.listen(config.port, () => logServerStart(config.port))