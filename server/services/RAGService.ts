import fs from 'fs'
import path from 'path'
import type { RAGChunk, RAGQueryOptions, RAGResult, Language } from '../types/index.js'

type AnyJson = Record<string, any>

// Enhanced RAG Service with better semantic search and categorization
export class RAGService {
 private chunks: RAGChunk[] = []
 private loaded = false
 private offersByDest = new Map<string, AnyJson>()

 constructor() {
 // Lazy load on first use
 }

 private resolveDataDir(): string {
 return path.resolve(process.cwd(), 'server', 'tours')
 }

 private safeReadJson(filePath: string): AnyJson | null {
 try {
 const raw = fs.readFileSync(filePath, 'utf-8')
 return JSON.parse(raw)
 } catch (e) {
 console.warn(`RAG: Failed to read/parse ${filePath}:`, e)
 return null
 }
 }

 private deriveDestination(fileBase: string, json: AnyJson): string | undefined {
 const title = (json.title_en || json.title_ar || '') as string
 const location = (json.location || '') as string
 const candidates = [fileBase, title, location]
 const lower = candidates.join(' ').toLowerCase()
 
 if (lower.includes('bali')) return 'bali'
 if (lower.includes('istanbul') || lower.includes('turkey')) return 'istanbul'
 if (lower.includes('beirut') || lower.includes('lebanon')) return 'beirut'
 if (lower.includes('sharm') || lower.includes('sharm el sheikh') || lower.includes('sharm_el_sheikh')) return 'sharm_el_sheikh'
 if (lower.includes('hurghada') || lower.includes('الغردقة')) return 'hurghada'
 if (lower.includes('dahab') || lower.includes('دهب')) return 'dahab'
 if (lower.includes('ain sokhna') || lower.includes('ain_sokhna') || lower.includes('العين السخنة')) return 'ain_sokhna'
 if (lower.includes('sahl') || lower.includes('hasheesh') || lower.includes('sahl_hashish')) return 'sahl_hashish'
 
 return undefined
 }

 // Enhanced chunking with better structure
 private chunkFromJson(filePath: string, fileBase: string, json: AnyJson): RAGChunk[] {
 const chunks: RAGChunk[] = []
 const destination = this.deriveDestination(fileBase, json)

 // Title chunks
 if (json.title_ar || json.title_en) {
 for (const lang of ['ar', 'en'] as const) {
 const title = lang === 'ar' ? json.title_ar : json.title_en
 if (title) {
 chunks.push({
 id: `${fileBase}:title:${lang}`,
 source: path.basename(filePath),
 destination,
 section: lang === 'ar' ? 'العنوان' : 'Title',
 lang,
 title,
 text: title
 })
 }
 }
 }

 // Validity chunks
 if (json.validity) {
 for (const lang of ['ar', 'en'] as const) {
 const text = json.validity[lang]
 if (text) {
 chunks.push({
 id: `${fileBase}:validity:${lang}`,
 source: path.basename(filePath),
 destination,
 section: lang === 'ar' ? 'صلاحية العرض' : 'Offer Validity',
 lang,
 title: lang === 'ar' ? json.title_ar : json.title_en,
 text
 })
 }
 }
 }

 // Hotels chunks (enhanced with structured data)
 if (Array.isArray(json.hotels) && json.hotels.length > 0) {
 for (const lang of ['ar', 'en'] as const) {
 const hotelsText = this.formatHotelsForRAG(json.hotels, lang)
 if (hotelsText) {
 chunks.push({
 id: `${fileBase}:hotels:${lang}`,
 source: path.basename(filePath),
 destination,
 section: lang === 'ar' ? 'الفنادق المتاحة' : 'Available Hotels',
 lang,
 title: lang === 'ar' ? json.title_ar : json.title_en,
 text: hotelsText,
 metadata: { category: 'hotels', hotels: json.hotels }
 })
 }
 }
 }

 // Price includes
 if (json.price_includes) {
 for (const lang of ['ar', 'en'] as const) {
 const items = json.price_includes[lang]
 if (Array.isArray(items) && items.length > 0) {
 chunks.push({
 id: `${fileBase}:includes:${lang}`,
 source: path.basename(filePath),
 destination,
 section: lang === 'ar' ? 'السعر يشمل' : 'Price Includes',
 lang,
 title: lang === 'ar' ? json.title_ar : json.title_en,
 text: items.map((item: string) => `• ${item}`).join('\n'),
 metadata: { category: 'includes' }
 })
 }
 }
 }

 // Price excludes
 if (json.price_excludes) {
 for (const lang of ['ar', 'en'] as const) {
 const items = json.price_excludes[lang]
 if (Array.isArray(items) && items.length > 0) {
 chunks.push({
 id: `${fileBase}:excludes:${lang}`,
 source: path.basename(filePath),
 destination,
 section: lang === 'ar' ? 'السعر لا يشمل' : 'Price Excludes',
 lang,
 title: lang === 'ar' ? json.title_ar : json.title_en,
 text: items.map((item: string) => `• ${item}`).join('\n'),
 metadata: { category: 'excludes' }
 })
 }
 }
 }

 // Visa requirements
 if (json.visa_requirements) {
 for (const lang of ['ar', 'en'] as const) {
 const items = json.visa_requirements[lang]
 if (Array.isArray(items) && items.length > 0) {
 chunks.push({
 id: `${fileBase}:visa:${lang}`,
 source: path.basename(filePath),
 destination,
 section: lang === 'ar' ? 'متطلبات التأشيرة' : 'Visa Requirements',
 lang,
 title: lang === 'ar' ? json.title_ar : json.title_en,
 text: items.map((item: string) => `• ${item}`).join('\n'),
 metadata: { category: 'visa' }
 })
 }
 }
 }

 // Optional tours (enhanced with structured data)
 if (Array.isArray(json.optional_tours) && json.optional_tours.length > 0) {
 for (const lang of ['ar', 'en'] as const) {
 const toursText = this.formatToursForRAG(json.optional_tours, lang)
 if (toursText) {
 chunks.push({
 id: `${fileBase}:tours:${lang}`,
 source: path.basename(filePath),
 destination,
 section: lang === 'ar' ? 'الجولات الاختيارية' : 'Optional Tours',
 lang,
 title: lang === 'ar' ? json.title_ar : json.title_en,
 text: toursText,
 metadata: { category: 'tours', tours: json.optional_tours }
 })
 }
 }
 }

 // Notes
 if (json.notes) {
 for (const lang of ['ar', 'en'] as const) {
 const items = json.notes[lang]
 if (Array.isArray(items) && items.length > 0) {
 chunks.push({
 id: `${fileBase}:notes:${lang}`,
 source: path.basename(filePath),
 destination,
 section: lang === 'ar' ? 'ملاحظات' : 'Notes',
 lang,
 title: lang === 'ar' ? json.title_ar : json.title_en,
 text: items.map((item: string) => `• ${item}`).join('\n'),
 metadata: { category: 'general' }
 })
 }
 }
 }

 return chunks
 }

 private formatHotelsForRAG(hotels: any[], lang: Language): string {
 return hotels.map(h => {
 const name = lang === 'ar' ? (h.hotel_name_ar || h.hotel_name_en) : (h.hotel_name_en || h.hotel_name_ar)
 const rating = h.stars ? `${h.stars} نجوم` : (h.rating || '')
 const area = h.area ? ` في ${h.area}` : ''
 const room = lang === 'ar' ? (h.room_type_ar || h.room_type_en || '') : (h.room_type_en || h.room_type_ar || '')
 const roomText = room ? ` - ${room}` : ''
 const meal = h.meal ? ` - ${h.meal}` : ''
 
 let price = ''
 // Primary: EGP pricing
 if (h.price_egp) {
 const usdRef = h.price_usd_reference ? ` (~$${h.price_usd_reference})` : ''
 price = lang === 'ar' 
 ? ` سعر العرض: ${h.price_egp} جنيه${usdRef}`
 : ` Offer Price: ${h.price_egp} EGP${usdRef}`
 } else if (h.prices_egp?.double) {
 const egpDouble = h.prices_egp.double
 const usdRef = h.price_usd_reference ? ` (~$${h.price_usd_reference})` : ''
 price = lang === 'ar'
 ? ` سعر العرض للفرد: ${egpDouble} جنيه${usdRef}`
 : ` Offer Price per person: ${egpDouble} EGP${usdRef}`
 } else if (h.prices_egp) {
 // Istanbul format with single/double/child
 const parts: string[] = []
 if (h.prices_egp.single) parts.push(`فردي: ${h.prices_egp.single} جنيه`)
 if (h.prices_egp.double) parts.push(`ثنائي: ${h.prices_egp.double} جنيه`)
 if (h.prices_egp.child) parts.push(`طفل: ${h.prices_egp.child} جنيه`)
 price = parts.length > 0 ? ` سعر العرض - ${parts.join(' / ')}` : ''
 }

 return `${name} ${rating}${area}${roomText}${meal}${price}`
 }).join('\n')
 }

 private formatToursForRAG(tours: any[], lang: Language): string {
 return tours.map(t => {
 const name = lang === 'ar' ? (t.name_ar || t.name_en) : (t.name_en || t.name_ar)
 const desc = lang === 'ar' ? (t.description_ar || t.description_en) : (t.description_en || t.description_ar)
 const price = t.price_usd ? ` ($${t.price_usd})` : ''
 return `${name}${price}: ${desc}`
 }).join('\n')
 }

 private loadAll(): void {
 if (this.loaded) return
 
 const dir = this.resolveDataDir()
 const entries = fs.readdirSync(dir)
 const jsonFiles = entries.filter(f => f.toLowerCase().endsWith('.json') && !f.includes('package'))
 const chunks: RAGChunk[] = []
 
 for (const file of jsonFiles) {
 const filePath = path.join(dir, file)
 const json = this.safeReadJson(filePath)
 if (!json) continue
 
 const base = path.parse(file).name
 const dest = this.deriveDestination(base, json)
 if (dest) {
 this.offersByDest.set(dest, json)
 }
 
 chunks.push(...this.chunkFromJson(filePath, base, json))
 }
 
 this.chunks = chunks
 this.loaded = true
 
 const byDest = new Set(this.chunks.map(c => c.destination).filter(Boolean) as string[])
 console.log(` RAG: Loaded ${this.chunks.length} chunks from ${jsonFiles.length} files`)
 console.log(` Destinations: ${[...byDest].join(', ') || 'none'}`)
 }

 // Enhanced scoring with semantic matching
 private score(query: string, chunk: RAGChunk, lang: Language): number {
 const qLower = query.toLowerCase()
 const textLower = `${chunk.title || ''} ${chunk.text}`.toLowerCase()
 
 let score = 0

 // Exact phrase matching (highest priority)
 if (textLower.includes(qLower)) {
 score += 10
 }

 // Keyword matching
 const keywords = this.extractKeywords(qLower)
 const textKeywords = this.extractKeywords(textLower)
 
 for (const kw of keywords) {
 if (textKeywords.includes(kw)) {
 score += 2
 }
 }

 // Category matching (hotels, tours, visa, etc.)
 if (chunk.metadata?.category) {
 const categoryKeywords: Record<string, string[]> = {
 hotels: ['hotel', 'فندق', 'فنادق', 'accommodation', 'إقامة', 'stay'],
 tours: ['tour', 'جولة', 'رحلة', 'trip', 'excursion', 'نشاط'],
 visa: ['visa', 'تأشيرة', 'فيزا', 'requirements', 'متطلبات'],
 includes: ['include', 'يشمل', 'contain', 'cover', 'تغطي'],
 excludes: ['exclude', 'لا يشمل', 'not include', 'exclude', 'مستثنى']
 }
 
 const catWords = categoryKeywords[chunk.metadata.category] || []
 if (catWords.some(w => qLower.includes(w))) {
 score += 5
 }
 }

 // Language preference
 if (chunk.lang === lang) {
 score += 3
 }

 // Destination matching
 if (chunk.destination) {
 const destKeywords = [chunk.destination, chunk.destination === 'istanbul' ? 'turkey' : '']
 if (destKeywords.some(d => d && qLower.includes(d))) {
 score += 4
 }
 }

 return score
 }

 private extractKeywords(text: string): string[] {
 // Remove common stop words and extract meaningful keywords
 const stopWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'and', 'or', 'في', 'من', 'إلى', 'مع', 'و', 'أو'])
 return text
 .toLowerCase()
 .split(/[\s,،.]+/)
 .filter(w => w.length > 2 && !stopWords.has(w))
 }

 // Enhanced retrieval with better ranking
 retrieve(query: string, options: RAGQueryOptions): RAGResult {
 this.loadAll()
 const { lang, limit = 5 } = options

 const scored = this.chunks
 .map(ch => ({ chunk: ch, score: this.score(query, ch, lang) }))
 .filter(x => x.score > 0)
 .sort((a, b) => b.score - a.score)
 .slice(0, limit)
 .map(x => x.chunk)

 return { chunks: scored }
 }

 destinations(): string[] {
 this.loadAll()
 const set = new Set(this.chunks.map(c => c.destination).filter(Boolean) as string[])
 return [...set]
 }

 getOfferByDestination(destination: string): AnyJson | null {
 this.loadAll()
 return this.offersByDest.get(destination.toLowerCase()) || null
 }

 // Get specific information type
 getDestinationInfo(destination: string, infoType: 'hotels' | 'tours' | 'visa' | 'includes' | 'excludes' | 'all', lang: Language): RAGChunk[] {
 this.loadAll()
 
 return this.chunks.filter(chunk => 
 chunk.destination === destination.toLowerCase() &&
 chunk.lang === lang &&
 (infoType === 'all' || chunk.metadata?.category === infoType)
 )
 }

 // Search hotels with filters (prices now in EGP)
 searchHotels(destination: string, filters?: { minRating?: number; maxPrice?: number; currency?: 'EGP' | 'USD' }): any[] {
 const offer = this.getOfferByDestination(destination)
 if (!offer || !Array.isArray(offer.hotels)) return []

 let hotels = offer.hotels

 if (filters?.minRating) {
 hotels = hotels.filter(h => {
 const rating = parseInt(h.stars || h.rating || '0')
 return rating >= (filters.minRating || 0)
 })
 }

 if (filters?.maxPrice) {
 hotels = hotels.filter(h => {
 let price = 0
 // Check if filtering by USD or EGP
 if (filters.currency === 'USD') {
 price = h.price_usd_reference || h.prices_usd_reference?.double || 0
 } else {
 // Default to EGP
 price = h.price_egp || h.prices_egp?.double || 0
 }
 return price <= (filters.maxPrice || Infinity)
 })
 }

 return hotels
 }

 /**
 * مقارنة فنادق
 */
 compareHotels(hotelNames: string[], destination?: string): any[] {
 this.loadAll()
 const results: any[] = []

 for (const hotelName of hotelNames) {
 const lowerName = hotelName.toLowerCase()
 
 // البحث في جميع الوجهات إذا لم تُحدد
 const destinations = destination 
 ? [destination]
 : Array.from(this.offersByDest.keys())

 for (const dest of destinations) {
 const json = this.offersByDest.get(dest)
 if (!json?.hotels) continue

 const hotel = json.hotels.find((h: any) => {
 const nameEn = (h.hotel_name_en || '').toLowerCase()
 const nameAr = (h.hotel_name_ar || '').toLowerCase()
 return nameEn.includes(lowerName) || nameAr.includes(lowerName) || 
 lowerName.includes(nameEn) || lowerName.includes(nameAr)
 })

 if (hotel) {
 results.push({
 ...hotel,
 destination: dest,
 location: json.location || dest
 })
 break
 }
 }
 }

 return results
 }

 /**
 * الحصول على توصيات بناءً على التفضيلات
 */
 getRecommendations(preferences: {
 destination?: string
 budget?: 'low' | 'medium' | 'high'
 stars?: number
 amenities?: string[]
 travelType?: 'family' | 'couple' | 'solo' | 'group'
 }, language: Language = 'ar'): any[] {
 this.loadAll()
 
 let hotels: any[] = []

 // جمع الفنادق من الوجهات
 const destinations = preferences.destination
 ? [preferences.destination]
 : Array.from(this.offersByDest.keys())

 for (const dest of destinations) {
 const json = this.offersByDest.get(dest)
 if (json?.hotels) {
 hotels.push(...json.hotels.map((h: any) => ({
 ...h,
 destination: dest,
 location: json.location || dest
 })))
 }
 }

 // تطبيق الفلاتر
 if (preferences.stars) {
 hotels = hotels.filter(h => h.stars === preferences.stars)
 }

 // فلترة حسب الميزانية
 if (preferences.budget) {
 hotels = hotels.filter(h => {
 const price = h.price_egp || h.prices_egp?.double || 0
 if (preferences.budget === 'low') return price < 8000
 if (preferences.budget === 'medium') return price >= 8000 && price <= 15000
 if (preferences.budget === 'high') return price > 15000
 return true
 })
 }

 // فلترة حسب نوع السفر
 if (preferences.travelType === 'family') {
 // تفضيل الفنادق 4-5 نجوم مع أنشطة عائلية
 hotels = hotels.filter(h => h.stars >= 4)
 }
 if (preferences.travelType === 'couple') {
 // تفضيل الفنادق الرومانسية 5 نجوم
 hotels = hotels.filter(h => h.stars === 5)
 }

 // ترتيب حسب التقييم والسعر
 hotels.sort((a, b) => {
 // ترتيب حسب النجوم أولاً
 if (a.stars !== b.stars) return b.stars - a.stars
 // ثم حسب السعر
 const priceA = a.price_egp || a.prices_egp?.double || 0
 const priceB = b.price_egp || b.prices_egp?.double || 0
 return priceA - priceB
 })

 // إرجاع أفضل 5 نتائج
 return hotels.slice(0, 5)
 }

 /**
 * الإجابة على الأسئلة العامة
 */
 answerGeneralQuestion(question: string, language: Language = 'ar'): string | null {
 const lowerQuestion = question.toLowerCase()

 // أسئلة عن التأشيرات
 if (/(visa|تأشيرة|فيزا)/i.test(lowerQuestion)) {
 if (language === 'ar') {
 return 'معظم الوجهات المصرية (شرم الشيخ، الغردقة، دهب) لا تحتاج تأشيرة للمصريين. بالنسبة للوجهات الدولية مثل بالي واسطنبول، يرجى الاتصال بنا لمعرفة متطلبات التأشيرة.'
 } else {
 return 'Most Egyptian destinations (Sharm El Sheikh, Hurghada, Dahab) do not require a visa for Egyptians. For international destinations like Bali and Istanbul, please contact us for visa requirements.'
 }
 }

 // أسئلة عن الطقس
 if (/(weather|طقس|جو)/i.test(lowerQuestion)) {
 if (language === 'ar') {
 return 'الطقس في شهري نوفمبر وديسمبر معتدل ومثالي للسفر في جميع الوجهات المصرية. درجة الحرارة تتراوح بين 20-28 درجة مئوية.'
 } else {
 return 'Weather in November and December is moderate and ideal for travel in all Egyptian destinations. Temperature ranges between 20-28°C.'
 }
 }

 // أسئلة عن طرق الدفع
 if (/(payment|دفع|طرق الدفع)/i.test(lowerQuestion)) {
 if (language === 'ar') {
 return 'نقبل جميع طرق الدفع: نقداً، بطاقات الائتمان، التحويل البنكي، وفودافون كاش.'
 } else {
 return 'We accept all payment methods: Cash, Credit Cards, Bank Transfer, and Vodafone Cash.'
 }
 }

 // أسئلة عن السفر مع الأطفال
 if (/(kids|children|أطفال|اطفال)/i.test(lowerQuestion)) {
 if (language === 'ar') {
 return 'نوفر عروض خاصة للعائلات مع الأطفال. الأطفال تحت سن معينة يحصلون على خصومات. يرجى التواصل معنا لمعرفة التفاصيل.'
 } else {
 return 'We offer special packages for families with children. Children under a certain age get discounts. Please contact us for details.'
 }
 }

 // أسئلة عن الإلغاء
 if (/(cancel|refund|إلغاء|استرجاع)/i.test(lowerQuestion)) {
 if (language === 'ar') {
 return 'سياسة الإلغاء تعتمد على الفندق والباقة المختارة. يرجى التواصل معنا لمعرفة التفاصيل.'
 } else {
 return 'Cancellation policy depends on the hotel and selected package. Please contact us for details.'
 }
 }

 return null
 }

 /**
 * بحث ذكي مع دعم الأخطاء الإملائية
 */
 smartSearch(query: string, options?: RAGQueryOptions): RAGResult {
 // تصحيح الأخطاء الشائعة
 const corrections: Record<string, string> = {
 'شرم': 'sharm',
 'غردقه': 'hurghada',
 'الغرده': 'hurghada',
 'دهاب': 'dahab',
 'اسطمبول': 'istanbul',
 'استنبول': 'istanbul',
 'بيروت': 'beirut',
 }

 let correctedQuery = query
 for (const [wrong, correct] of Object.entries(corrections)) {
 correctedQuery = correctedQuery.replace(new RegExp(wrong, 'gi'), correct)
 }

 return this.retrieve(correctedQuery, options || { lang: 'ar' })
 }
}

// Singleton instance
export const ragService = new RAGService()
