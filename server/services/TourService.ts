import { ragService } from './RAGService.js'
import type { Language } from '../shared.js'

export class TourService {
 // Get all available destinations
 getDestinations(): string[] {
 return ragService.destinations()
 }

 // Get destination information
 getDestinationInfo(destination: string, infoType: 'hotels' | 'tours' | 'visa' | 'includes' | 'excludes' | 'all', lang: Language) {
 return ragService.getDestinationInfo(destination, infoType, lang)
 }

 // Search hotels with filters
 searchHotels(destination: string, filters?: { minRating?: number; maxPrice?: number }) {
 return ragService.searchHotels(destination, filters)
 }

 // Get hotel by name
 getHotelByName(destination: string, hotelName: string) {
 const hotels = ragService.searchHotels(destination)
 return hotels.find(h => 
 (h.hotel_name || h.name || '').toLowerCase().includes(hotelName.toLowerCase())
 )
 }

 // Get tours for destination
 getTours(destination: string, lang: Language) {
 const chunks = ragService.getDestinationInfo(destination, 'tours', lang)
 return chunks.flatMap(c => c.metadata?.tours || [])
 }

 // Get visa requirements
 getVisaRequirements(destination: string, lang: Language) {
 return ragService.getDestinationInfo(destination, 'visa', lang)
 }

 // Calculate total price
 calculateTotalPrice(hotelPricePerPerson: number, numTravelers: number, optionalTours?: number[]): number {
 const hotelTotal = hotelPricePerPerson * numTravelers
 const toursTotal = optionalTours ? optionalTours.reduce((sum, price) => sum + price, 0) * numTravelers : 0
 return hotelTotal + toursTotal
 }

 // Format hotel for display
 formatHotelDisplay(hotel: any, lang: Language, numTravelers: number = 1): string {
 const name = hotel.hotel_name || hotel.name || 'Unknown'
 const rating = hotel.rating ? ``.repeat(parseInt(hotel.rating)) : ''
 const area = hotel.area || ''
 const price = hotel.price_usd || hotel.price_single_usd || hotel.price_double_triple_usd || 0
 const total = price * numTravelers

 if (lang === 'ar') {
 return ` **${name}** ${rating}\n` +
 ` ${area}\n` +
 ` السعر: $${price}/شخص (المجموع: $${total} لـ ${numTravelers} ${numTravelers === 1 ? 'شخص' : 'أشخاص'})\n` +
 ` الإقامة: 6 أيام/5 ليالي مع إفطار\n` +
 ` يشمل: انتقالات المطار`
 } else {
 return ` **${name}** ${rating}\n` +
 ` ${area}\n` +
 ` Price: $${price}/person (Total: $${total} for ${numTravelers} ${numTravelers === 1 ? 'person' : 'people'})\n` +
 ` Stay: 6 days/5 nights with breakfast\n` +
 ` Includes: Airport transfers`
 }
 }

 // Format tour for display
 formatTourDisplay(tour: any, lang: Language): string {
 const name = lang === 'ar' ? (tour.name_ar || tour.name_en) : (tour.name_en || tour.name_ar)
 const desc = lang === 'ar' ? (tour.description_ar || tour.description_en) : (tour.description_en || tour.description_ar)
 const price = tour.price_usd ? ` - $${tour.price_usd}/شخص` : ''

 return ` **${name}**${price}\n${desc}`
 }

 // Get top N hotels by rating/price
 getTopHotels(destination: string, limit: number = 3, sortBy: 'rating' | 'price' = 'rating') {
 const hotels = ragService.searchHotels(destination)
 
 const sorted = hotels.sort((a, b) => {
 if (sortBy === 'rating') {
 return (parseInt(b.rating) || 0) - (parseInt(a.rating) || 0)
 } else {
 const priceA = a.price_usd || a.price_single_usd || a.price_double_triple_usd || 0
 const priceB = b.price_usd || b.price_single_usd || b.price_double_triple_usd || 0
 return priceA - priceB
 }
 })

 return sorted.slice(0, limit)
 }

 // Get hotels by budget range
 getHotelsByBudget(destination: string, minBudget?: number, maxBudget?: number) {
 const hotels = ragService.searchHotels(destination)
 
 return hotels.filter(h => {
 const price = h.price_usd || h.price_single_usd || h.price_double_triple_usd || 0
 if (minBudget && price < minBudget) return false
 if (maxBudget && price > maxBudget) return false
 return true
 })
 }

 // Get hotels by star rating
 getHotelsByRating(destination: string, minRating: number) {
 return ragService.searchHotels(destination, { minRating })
 }

 // Get complete offer details
 getOfferDetails(destination: string) {
 return ragService.getOfferByDestination(destination)
 }

 // Search across all content
 searchContent(query: string, lang: Language, limit: number = 5) {
 return ragService.retrieve(query, { lang, limit })
 }

 // Get what's included in the package
 getPackageIncludes(destination: string, lang: Language) {
 return ragService.getDestinationInfo(destination, 'includes', lang)
 }

 // Get what's excluded from the package
 getPackageExcludes(destination: string, lang: Language) {
 return ragService.getDestinationInfo(destination, 'excludes', lang)
 }

 // Format multiple hotels for display
 formatHotelsList(hotels: any[], lang: Language, numTravelers: number = 1, limit: number = 3): string {
 const displayHotels = hotels.slice(0, limit)
 const remaining = hotels.length - limit

 const header = lang === 'ar' 
 ? ' **الفنادق المتاحة:**\n\n' 
 : ' **Available Hotels:**\n\n'

 const formatted = displayHotels.map((hotel, index) => {
 const name = hotel.hotel_name || hotel.name || 'Unknown'
 const rating = hotel.rating ? `${hotel.rating}` : ''
 const area = hotel.area ? ` - ${hotel.area}` : ''
 const price = hotel.price_usd || hotel.price_single_usd || hotel.price_double_triple_usd || 0
 const total = price * numTravelers

 if (lang === 'ar') {
 return `${index + 1}. **${name}** ${rating}${area}\n $${price}/شخص (المجموع: $${total})`
 } else {
 return `${index + 1}. **${name}** ${rating}${area}\n $${price}/person (Total: $${total})`
 }
 }).join('\n\n')

 let footer = ''
 if (remaining > 0) {
 footer = lang === 'ar'
 ? `\n\n *لدينا ${remaining} فندق آخر. عايز تشوف المزيد؟*`
 : `\n\n *We have ${remaining} more hotels. Want to see more?*`
 }

 return `${header}${formatted}${footer}`
 }

 // Format multiple tours for display
 formatToursList(tours: any[], lang: Language, limit: number = 3): string {
 const displayTours = tours.slice(0, limit)
 const remaining = tours.length - limit

 const header = lang === 'ar' 
 ? ' **الجولات الاختيارية:**\n\n' 
 : ' **Optional Tours:**\n\n'

 const formatted = displayTours.map((tour, index) => {
 const name = lang === 'ar' ? (tour.name_ar || tour.name_en) : (tour.name_en || tour.name_ar)
 const price = tour.price_usd ? ` - $${tour.price_usd}/شخص` : ''
 const desc = lang === 'ar' ? (tour.description_ar || tour.description_en) : (tour.description_en || tour.description_ar)
 const shortDesc = desc.length > 80 ? desc.substring(0, 80) + '...' : desc

 return `${index + 1}. **${name}**${price}\n ${shortDesc}`
 }).join('\n\n')

 let footer = ''
 if (remaining > 0) {
 footer = lang === 'ar'
 ? `\n\n *لدينا ${remaining} جولة أخرى. عايز تشوف المزيد؟*`
 : `\n\n *We have ${remaining} more tours. Want to see more?*`
 }

 return `${header}${formatted}${footer}`
 }
}

// Singleton instance
export const tourService = new TourService()
