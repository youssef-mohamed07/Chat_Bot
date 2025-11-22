// ===================================
// OFFERS ROUTES
// Routes for offers/destinations
// ===================================

import { Router, type Request, type Response } from 'express'
import { ragService } from '../services/index.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()

// GET /offers/destinations - List all destinations
router.get(
  '/destinations',
  asyncHandler((req: Request, res: Response) => {
    const destinations = ragService.destinations()
    res.json({ destinations })
  })
)

// GET /offers/:dest - Get offer details by destination
router.get(
  '/:dest',
  asyncHandler((req: Request, res: Response) => {
    const destParam = String(req.params.dest || '').toLowerCase()
    const lang = (String(req.query.lang || 'en').toLowerCase() === 'ar') ? 'ar' : 'en'
    const dest = destParam === 'turkey' ? 'istanbul' : destParam

    const offer = ragService.getOfferByDestination(dest)
    if (!offer) {
      res.status(404).json({ 
        error: 'not_found', 
        message: `No offer for destination: ${dest}` 
      })
      return
    }

    // Filter by language
    const filtered = { ...offer }
    const pick = (obj: any, key: string) => (obj && (obj[key] || [])) || []
    const pickText = (obj: any, key: string) => (obj && (obj[key] || '')) || ''

    filtered.title = lang === 'ar' ? (offer.title_ar || '') : (offer.title_en || '')
    filtered.validity_text = pickText(offer.validity, lang)
    filtered.includes = pick(offer.price_includes, lang)
    filtered.excludes = pick(offer.price_excludes, lang)
    filtered.visa = pick(offer.visa_requirements, lang)

    res.json({ dest, lang, offer: filtered })
  })
)

export default router
