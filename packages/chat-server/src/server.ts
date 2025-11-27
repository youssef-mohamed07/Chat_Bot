// ✈️ Quick Air AI Agent (Powered by Google Gemini)
// ==============================================

import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

// Import config and utilities
import { config, validateConfig } from './config/index.js'
import { setupErrorHandlers, logServerStart } from './utils/index.js'

// Import middleware
import { requestLogger, corsHandler } from './middleware/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

// Import routes
import { chatRoutes, supportRoutes, offersRoutes } from './routes/index.js'

// Initialize Express app
const app = express()

// Validate configuration
validateConfig()

// Setup error handlers
setupErrorHandlers()

// ============================================
// Middleware
// ============================================
app.use(cors())
app.use(corsHandler)
app.use(bodyParser.json())
app.use(requestLogger)

// ============================================
// Routes
// ============================================
app.use('/chat', chatRoutes)
app.use('/support', supportRoutes)
app.use('/offers', offersRoutes)

// ============================================
// Error Handling
// ============================================
app.use(notFoundHandler)
app.use(errorHandler)

// ============================================
// Start Server
// ============================================
app.listen(config.port, () => logServerStart(config.port))