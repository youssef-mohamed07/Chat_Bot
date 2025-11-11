import { Router } from 'express'
import { ChatController, SupportController } from '../controllers/index.js'
import { ragService } from '../services/index.js'

const router = Router()

// Initialize controllers
const chatController = new ChatController()
const supportController = new SupportController()

// Chat routes
router.post('/chat', (req, res) => chatController.handleChat(req, res))
router.post('/chat/stream', (req, res) => chatController.handleStreamingChat(req, res))

// Support routes
router.post('/support/request', (req, res) => supportController.handleSupportRequest(req, res))

// (Tours API removed per request)

// Lightweight offers/RAG info endpoint
router.get('/offers/destinations', (req, res) => {
	const destinations = ragService.destinations()
	res.json({ destinations })
})

// Offer details by destination (language-aware)
router.get('/offers/:dest', (req, res) => {
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
	const pick = (obj: any, key: 'ar' | 'en') => (obj && (obj[key] || [])) || []
	const pickText = (obj: any, key: 'ar' | 'en') => (obj && (obj[key] || '')) || ''

	filtered.title = lang === 'ar' ? (offer.title_ar || '') : (offer.title_en || '')
	filtered.validity_text = pickText(offer.validity, lang)
	filtered.includes = pick(offer.price_includes, lang)
	filtered.excludes = pick(offer.price_excludes, lang)
	filtered.visa = pick(offer.visa_requirements, lang)
	// Hotels and optional_tours are language-agnostic fields; keep as-is

	res.json({ dest, lang, offer: filtered })
})

export default router
