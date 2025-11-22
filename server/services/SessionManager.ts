import type { ChatMessage } from '../shared.js'

export class SessionManager {
 private sessions = new Map<string, ChatMessage[]>()
 private metadata = new Map<string, { 
 lastDest?: string
 lastTopic?: string
 lastCardShownAt?: number
 lastCardDest?: string
 depCity?: string
 startDate?: string
 endDate?: string
 pax?: number
 budget?: number | string
 step?: 'initial' | 'destination_selected' | 'dates_selected' | 'travelers_selected' | 'budget_selected' | 'ready_for_offers' | 'hotel_selected' | 'meal_selected' | 'room_selected' | 'contact_info' | 'booking_confirmed' | 'booking_modification' | 'support_contact' | 'general_inquiry'
 hasSeenDestinationButtons?: boolean
 selectedHotel?: string
 mealPlan?: string
 roomType?: string
 filter_stars?: string
 filter_mealPlans?: string
 filter_areas?: string
 previousStep?: string
 customerName?: string
 customerPhone?: string
 customerEmail?: string
 preferredLanguage?: 'ar' | 'en'
 }>()

 getSession(userId: string): ChatMessage[] {
 if (!this.sessions.has(userId)) {
 this.sessions.set(userId, [])
 }
 return this.sessions.get(userId)!
 }

 addMessage(userId: string, message: ChatMessage): void {
 const session = this.getSession(userId)
 session.push(message)
 }

 clearSession(userId: string): void {
 this.sessions.delete(userId)
 }

 getAllSessions(): Map<string, ChatMessage[]> {
 return new Map(this.sessions)
 }

 getSessionCount(): number {
 return this.sessions.size
 }

 getMeta(userId: string): { 
 lastDest?: string
 lastTopic?: string
 lastCardShownAt?: number
 lastCardDest?: string
 depCity?: string
 startDate?: string
 endDate?: string
 pax?: number
 budget?: number | string
 step?: 'initial' | 'destination_selected' | 'dates_selected' | 'travelers_selected' | 'budget_selected' | 'ready_for_offers' | 'hotel_selected' | 'meal_selected' | 'room_selected' | 'contact_info' | 'booking_confirmed' | 'booking_modification' | 'support_contact' | 'general_inquiry'
 hasSeenDestinationButtons?: boolean
 selectedHotel?: string
 mealPlan?: string
 roomType?: string
 filter_stars?: string
 filter_mealPlans?: string
 filter_areas?: string
 previousStep?: string
 customerName?: string
 customerPhone?: string
 customerEmail?: string
 preferredLanguage?: 'ar' | 'en'
 } {
 if (!this.metadata.has(userId)) {
 this.metadata.set(userId, {})
 }
 return this.metadata.get(userId)!
 }

 updateMeta(userId: string, updates: Partial<{ 
 lastDest?: string
 lastTopic?: string
 lastCardShownAt?: number
 lastCardDest?: string
 depCity?: string
 startDate?: string
 endDate?: string
 pax?: number
 budget?: number | string
 step?: 'initial' | 'destination_selected' | 'dates_selected' | 'travelers_selected' | 'budget_selected' | 'ready_for_offers' | 'hotel_selected' | 'meal_selected' | 'room_selected' | 'contact_info' | 'booking_confirmed' | 'booking_modification' | 'support_contact' | 'general_inquiry'
 hasSeenDestinationButtons?: boolean
 selectedHotel?: string
 mealPlan?: string
 roomType?: string
 filter_stars?: string
 filter_mealPlans?: string
 filter_areas?: string
 previousStep?: string
 customerName?: string
 customerPhone?: string
 customerEmail?: string
 preferredLanguage?: 'ar' | 'en'
 }>): void {
 const current = this.getMeta(userId)
 this.metadata.set(userId, { ...current, ...updates })
 }
}
