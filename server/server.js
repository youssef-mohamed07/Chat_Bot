// ✈️ Quick Air AI Agent (Powered by OpenRouter)
// ==============================================

import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { config, validateConfig } from './config/index.js'
import { setupErrorHandlers, logServerStart } from './utils/index.js'
import { errorHandler, notFoundHandler, requestLogger } from './middleware/index.js'
import routes from './routes/index.js'

// Initialize Express app
const app = express()

// Validate configuration
validateConfig()

// Setup error handlers
setupErrorHandlers()

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(requestLogger)

// Routes
app.use('/', routes)

// Error handling middleware
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
app.listen(config.port, () => logServerStart(config.port))