import type { ChatMessage } from '../types/index.js'

interface ConversationTurn {
 userMessage: string
 botResponse: string
 timestamp: number
 intent?: string
 entities?: any
}

interface ContextMemory {
 lastMentionedHotel?: string
 lastMentionedDestination?: string
 lastMentionedPrice?: number
 lastShownHotels?: string[]
 lastComparedHotels?: string[]
 implicitReferences: Map<string, any>
}

export class SessionManager {
 private sessions = new Map<string, ChatMessage[]>()
 private conversationHistory = new Map<string, ConversationTurn[]>()
 private contextMemory = new Map<string, ContextMemory>()
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

 // إدارة تاريخ المحادثة
 addConversationTurn(userId: string, userMessage: string, botResponse: string, intent?: string, entities?: any): void {
 if (!this.conversationHistory.has(userId)) {
 this.conversationHistory.set(userId, [])
 }
 
 const history = this.conversationHistory.get(userId)!
 history.push({
 userMessage,
 botResponse,
 timestamp: Date.now(),
 intent,
 entities
 })

 // الاحتفاظ بآخر 10 محادثات فقط
 if (history.length > 10) {
 history.shift()
 }
 }

 getConversationHistory(userId: string, limit: number = 5): ConversationTurn[] {
 const history = this.conversationHistory.get(userId) || []
 return history.slice(-limit)
 }

 getFullConversationHistory(userId: string): ConversationTurn[] {
 return this.conversationHistory.get(userId) || []
 }

 // إدارة ذاكرة السياق
 getContextMemory(userId: string): ContextMemory {
 if (!this.contextMemory.has(userId)) {
 this.contextMemory.set(userId, {
 implicitReferences: new Map()
 })
 }
 return this.contextMemory.get(userId)!
 }

 updateContextMemory(userId: string, updates: Partial<ContextMemory>): void {
 const current = this.getContextMemory(userId)
 this.contextMemory.set(userId, { ...current, ...updates })
 }

 addImplicitReference(userId: string, key: string, value: any): void {
 const context = this.getContextMemory(userId)
 context.implicitReferences.set(key, value)
 }

 getImplicitReference(userId: string, key: string): any {
 const context = this.getContextMemory(userId)
 return context.implicitReferences.get(key)
 }

 // حل الإشارات الضمنية
 resolveImplicitReference(userId: string, message: string): any {
 const context = this.getContextMemory(userId)
 const lowerMessage = message.toLowerCase()

 // "ده" أو "دي" أو "this" أو "that"
 if (/(^| )(ده|دي|دا|this|that|it)( |$)/i.test(lowerMessage)) {
 // إذا كان يسأل عن سعر
 if (/(سعر|كام|price|cost)/i.test(lowerMessage)) {
 return context.lastMentionedHotel || context.lastShownHotels?.[0]
 }
 
 // إذا كان يسأل عن فندق
 if (/(فندق|hotel)/i.test(lowerMessage)) {
 return context.lastMentionedHotel || context.lastShownHotels?.[0]
 }
 }

 // "الأول" أو "الثاني" أو "first" أو "second"
 if (/(الأول|الاول|first|1st)/i.test(lowerMessage)) {
 return context.lastShownHotels?.[0]
 }
 if (/(الثاني|التاني|second|2nd)/i.test(lowerMessage)) {
 return context.lastShownHotels?.[1]
 }
 if (/(الثالث|التالت|third|3rd)/i.test(lowerMessage)) {
 return context.lastShownHotels?.[2]
 }

 // "الأرخص" أو "cheapest"
 if (/(الأرخص|الارخص|cheapest|cheapest one)/i.test(lowerMessage)) {
 return 'cheapest'
 }

 // "الأغلى" أو "most expensive"
 if (/(الأغلى|الاغلى|most expensive|priciest)/i.test(lowerMessage)) {
 return 'most_expensive'
 }

 return null
 }

 // مسح البيانات
 clearConversationHistory(userId: string): void {
 this.conversationHistory.delete(userId)
 }

 clearContextMemory(userId: string): void {
 this.contextMemory.delete(userId)
 }

 clearAllUserData(userId: string): void {
 this.sessions.delete(userId)
 this.conversationHistory.delete(userId)
 this.contextMemory.delete(userId)
 this.metadata.delete(userId)
 }
}

