import { useState, useRef, useEffect } from 'react'
import type { ChatMessage, Language, SupportRequest, ButtonOption } from '../types'
import { API_ENDPOINTS, LABELS, generateUserId, eventBus } from '../utils'
import Plugins from '../plugins'

export const useChatWidget = () => {
 const [isOpen, setIsOpen] = useState(false)
 const [lang, setLang] = useState<Language | null>(null)
 const [messages, setMessages] = useState<ChatMessage[]>([])
 const [input, setInput] = useState('')
 const [isLoading, setIsLoading] = useState(false)
 const userId = useRef(generateUserId()).current
 const messagesEndRef = useRef<HTMLDivElement>(null)
 // Wizard state
 // Wizard deprecated in favor of AI-driven dynamic UI
 // Track last buttons shown for wizard so free text can re-surface them
 // Legacy caches removed

 useEffect(() => {
 if (isOpen) {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
 }
 }, [messages, isOpen])

 // Global event subscriptions: allow UI components to push messages or attachments
 useEffect(() => {
 const offNew = eventBus.on('message:new', (p) => {
 const isUser = p.role === 'user'
 setMessages(prev => [...prev, { text: p.text || '', isUser, timestamp: new Date(), meta: { source: 'system' } }])
 })
 const offAttach = eventBus.on('attachments:add', ({ files }) => {
 if (!files?.length) return
 setMessages(prev => [...prev, {
 text: '',
 isUser: true,
 timestamp: new Date(),
 meta: { source: 'system', attachments: files.map(f => ({ name: f.name, size: f.size, type: f.type, previewUrl: f.previewUrl })) }
 }])
 })
 return () => { offNew(); offAttach() }
 }, [])

 const handleSelectLang = (selected: Language) => {
 setLang(selected)
 const text = selected === 'ar'
 ? 'مرحباً! أنا مساعد السفر الذكي من Quick Air. لنبدأ التخطيط لرحلتك خطوة بخطوة.'
 : "Hello! I'm your Quick Air intelligent travel assistant. Let's plan your trip step by step."

 // DON'T replace messages - append to existing
 setMessages(prev => [...prev, { text, isUser: false, timestamp: new Date() }])
 
 // Init plugins
 const ctx = { lang: selected, setLang, pushMessage: (m: ChatMessage) => setMessages(prev => [...prev, m]) }
 Plugins.list().forEach(p => { try { p.init?.(ctx as any) } catch {} })
 
 // Auto-initialize AI suggestions
 ;(async () => {
 const initMsg = await sendToAPI('__init__', selected)
 if (initMsg) setMessages(prev => [...prev, initMsg])
 })()
 }

 const detectLanguage = (message: string): Language => {
 // Simple Arabic detection - check for Arabic characters
 const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
 return arabicRegex.test(message) ? 'ar' : 'en'
 }

 // Request full response (no streaming) for a cleaner UX
 const sendToAPI = async (
 message: string,
 lang: Language
 ): Promise<ChatMessage | null> => {
 try {
 const response = await fetch('/chat', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 message,
 userId: 'web-user',
 lang
 })
 })

 if (!response.ok) {
 throw new Error(`HTTP error! status: ${response.status}`)
 }
 const result = await response.json()
 const fullResponse: string = result?.reply ?? ''
 const blocks = result?.ui?.blocks as any[] | undefined

 // If UI blocks are present, map them, append internally, and return null to avoid double append
 if (blocks && Array.isArray(blocks) && blocks.length) {
 const mapped: ChatMessage[] = []
 for (const b of blocks) {
 if (b.type === 'text' && b.text) {
 mapped.push({ text: b.text, isUser: false, timestamp: new Date(), meta: { source: 'ai' } })
 } else if (b.type === 'buttons' && Array.isArray(b.buttons)) {
 mapped.push({ text: b.text || '', isUser: false, timestamp: new Date(), meta: { source: 'ai', buttons: b.buttons } })
 } else if (b.type === 'card' && b.cardType === 'trip' && b.data) {
 mapped.push({ text: '', isUser: false, timestamp: new Date(), meta: { source: 'json', card: { type: 'trip', data: b.data } } })
 } else if (b.type === 'images' && Array.isArray(b.urls)) {
 mapped.push({ text: '', isUser: false, timestamp: new Date(), meta: { source: 'ai', images: b.urls } })
 } else if (b.type === 'dateRange') {
 mapped.push({ text: '', isUser: false, timestamp: new Date(), meta: { source: 'system', dateRange: { heading: b.heading, minDate: b.minDate, maxDate: b.maxDate } } })
 } else if (b.type === 'travellers') {
 mapped.push({ text: '', isUser: false, timestamp: new Date(), meta: { source: 'system', travellers: { heading: b.heading, min: b.min, max: b.max, default: b.default } } })
 } else if (b.type === 'quickReplies') {
 mapped.push({ text: '', isUser: false, timestamp: new Date(), meta: { source: 'system', quickReplies: { title_ar: b.title_ar, title_en: b.title_en, options: b.options || [] } } })
 } else if (b.type === 'mealPlans') {
 mapped.push({ text: '', isUser: false, timestamp: new Date(), meta: { source: 'system', mealPlans: { title_ar: b.title_ar, title_en: b.title_en, options: b.options || [] } } })
 } else if (b.type === 'roomTypes') {
 mapped.push({ text: '', isUser: false, timestamp: new Date(), meta: { source: 'system', roomTypes: { title_ar: b.title_ar, title_en: b.title_en, options: b.options || [] } } })
 } else if (b.type === 'hotelFilters') {
 mapped.push({ text: '', isUser: false, timestamp: new Date(), meta: { source: 'system', hotelFilters: { title_ar: b.title_ar, title_en: b.title_en, filters: b.filters || {} } } })
 } else if (b.type === 'budget') {
 console.log(' Mapping budget widget:', b)
 mapped.push({ text: '', isUser: false, timestamp: new Date(), meta: { source: 'system', budget: { title_ar: b.title_ar, title_en: b.title_en, ranges: b.ranges || [] } } })
 } else if (b.type === 'hotelCards') {
 console.log(' Mapping hotel cards:', b.hotels?.length || 0, 'hotels')
 mapped.push({ 
 text: '', 
 isUser: false, 
 timestamp: new Date(), 
 meta: { 
 source: 'system', 
 hotelCards: { 
 layout: b.layout,
 responsive: b.responsive,
 hotels: b.hotels || [] 
 } 
 } 
 })
 } else if (b.type === 'bookingSummary') {
 console.log(' Mapping booking summary')
 mapped.push({
 text: '',
 isUser: false,
 timestamp: new Date(),
 meta: {
 source: 'system',
 bookingSummary: {
 title_ar: b.title_ar,
 title_en: b.title_en,
 data: b.data,
 actions: b.actions
 }
 }
 })
 }
 }
 
 // Append to existing messages - DON'T REPLACE!
 if (mapped.length > 0) {
 setMessages(prev => [...prev, ...mapped])
 // Plugin hook for assistant messages
 const ctx = { lang: lang, setLang, pushMessage: (m: ChatMessage) => setMessages(prev => [...prev, m]) }
 mapped.forEach(m => Plugins.list().forEach(p => { try { p.onAssistantMessage?.(m, ctx as any) } catch {} }))
 }
 return null
 }

 // Return the AI response
 const assistantMsg: ChatMessage = {
 text: fullResponse,
 isUser: false,
 timestamp: new Date(),
 meta: { source: 'ai' }
 }
 // Plugin hook
 const ctx = { lang: lang, setLang, pushMessage: (m: ChatMessage) => setMessages(prev => [...prev, m]) }
 Plugins.list().forEach(p => { try { p.onAssistantMessage?.(assistantMsg, ctx as any) } catch {} })
 return assistantMsg
 } catch (error) {
 console.error(' API Error:', error)
 return {
 text: lang === 'ar' ? 'عذراً، حدث خطأ في الاتصال بالخادم.' : 'Sorry, there was an error connecting to the server.',
 isUser: false,
 timestamp: new Date()
 }
 }
 }

 const fetchOfferAndPushCard = async (dest: string, detectedLang: Language) => {
 try {
 const r = await fetch(`/offers/${encodeURIComponent(dest)}?lang=${detectedLang}`)
 if (!r.ok) return
 const data = await r.json()
 setMessages(prev => [...prev, {
 text: '',
 isUser: false,
 timestamp: new Date(),
 meta: { source: 'json', card: { type: 'trip', data } }
 }])
 } catch {}
 }

 const pushAssistant = (text: string, buttons?: ButtonOption[]) => {
 if (buttons && buttons.length) {
 setMessages(prev => [...prev, {
 text,
 isUser: false,
 timestamp: new Date(),
 meta: { source: 'system', buttons }
 }])
 } else {
 setMessages(prev => [...prev, { text, isUser: false, timestamp: new Date() }])
 }
 }

 // Reusable navigation buttons once user reaches suggestions step
 const buildSuggestionNav = (_l: Language): ButtonOption[] => []

 const handleButtonOption = async (button: ButtonOption) => {
 // Echo user choice
 setMessages(prev => [...prev, { text: button.text, isUser: true, timestamp: new Date(), meta: { source: 'system' } }])
 const l = lang ?? 'en'
 const rawVal = (button.value || '').toLowerCase()

 // Normalize legacy/simple buttons
 if (rawVal === 'bali' || rawVal === 'istanbul' || rawVal === 'turkey') {
 // Treat as destination selection
 const mapped = rawVal === 'turkey' ? 'istanbul' : rawVal
 // Ensure we are in destination step to proceed
 // Continue as if dest: was chosen
 const synthetic: ButtonOption = { text: button.text, value: `dest:${mapped}` }
 // Call handler again with normalized value without double echo
 return await handleButtonOptionCore(synthetic, l)
 }
 if (rawVal.startsWith('query:')) {
 const q = rawVal.replace(/^query:/, '')
 const interactiveResponse = await sendToAPI(q, l)
 if (interactiveResponse) setMessages(prev => [...prev, interactiveResponse])
 // Also show a trip card for known destinations
 if (q.includes('bali')) await fetchOfferAndPushCard('bali', l)
 if (q.includes('istanbul')) await fetchOfferAndPushCard('istanbul', l)
 pushAssistant(l === 'ar' ? 'إجراء آخر؟' : 'Another action?', buildSuggestionNav(l))
 return
 }

 // Handle WhatsApp button
 if (rawVal === 'whatsapp') {
 const phoneNumber = '201145389973' // رقم الواتساب بدون + أو 00
 const message = l === 'ar' 
 ? 'مرحباً، أريد الاستفسار عن العروض السياحية'
 : 'Hello, I would like to inquire about travel packages'
 const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
 window.open(whatsappUrl, '_blank')
 
 pushAssistant(
 l === 'ar' 
 ? 'سيتم فتح واتساب في نافذة جديدة. يمكنك التواصل مع فريقنا مباشرة.' 
 : 'WhatsApp will open in a new window. You can contact our team directly.',
 []
 )
 return
 }

 return await handleButtonOptionCore(button, l)
 }

 const handleButtonOptionCore = async (button: ButtonOption, l: Language) => {
 // Core state machine for wizard buttons

 if (button.value === 'start_wizard') {
 // Now simply ask AI to produce initial suggestions
 const initPrompt = l === 'ar' ? '__init__' : '__init__'
 const interactiveResponse = await sendToAPI(initPrompt, l)
 if (interactiveResponse) setMessages(prev => [...prev, interactiveResponse])
 return
 }

 // Legacy travel: removed

 if (button.value.startsWith('dest:')) {
 const dest = button.value.split(':')[1]
 // Inform server to set destination and let it drive the UI (summary/card/buttons)
 const interactiveResponse = await sendToAPI(`dest:${dest}`, l)
 if (interactiveResponse) setMessages(prev => [...prev, interactiveResponse])
 return
 }

 if (button.value.startsWith('show_card:')) {
 const dest = button.value.split(':')[1]
 if (dest) await fetchOfferAndPushCard(dest, l)
 return
 }

 if (button.value.startsWith('hotel:')) {
 // Pass back to AI context
 const interactiveResponse = await sendToAPI(button.value, l)
 if (interactiveResponse) setMessages(prev => [...prev, interactiveResponse])
 return
 }

 if (button.value.startsWith('meal:')) {
 // Send meal selection to server
 console.log(' Meal selected:', button.value)
 const interactiveResponse = await sendToAPI(button.value, l)
 if (interactiveResponse) setMessages(prev => [...prev, interactiveResponse])
 return
 }

 if (button.value.startsWith('room:')) {
 // Send room selection to server
 console.log(' Room selected:', button.value)
 const interactiveResponse = await sendToAPI(button.value, l)
 if (interactiveResponse) setMessages(prev => [...prev, interactiveResponse])
 return
 }

 // Booking summary action buttons
 if (button.value === 'confirm_booking') {
 console.log(' Confirm booking clicked')
 const interactiveResponse = await sendToAPI('confirm_booking', l)
 if (interactiveResponse) setMessages(prev => [...prev, interactiveResponse])
 return
 }

 if (button.value === 'modify_booking') {
 console.log(' Modify booking clicked')
 const interactiveResponse = await sendToAPI('modify_booking', l)
 if (interactiveResponse) setMessages(prev => [...prev, interactiveResponse])
 return
 }

 if (button.value === 'contact_support') {
 console.log(' Contact support clicked')
 const interactiveResponse = await sendToAPI('contact_support', l)
 if (interactiveResponse) setMessages(prev => [...prev, interactiveResponse])
 return
 }

 if (button.value.startsWith('rating:') || button.value.startsWith('budget:')) {
 const interactiveResponse = await sendToAPI(button.value, l)
 if (interactiveResponse) setMessages(prev => [...prev, interactiveResponse])
 return
 }

 // budget handled above

 if (button.value === 'more_details') {
 const dest = 'bali'
 await fetchOfferAndPushCard(dest, l)
 // Re-show navigation buttons
 pushAssistant(l === 'ar' ? 'ماذا تود بعد ذلك؟' : 'What would you like next?', buildSuggestionNav(l))
 return
 }
 if (button.value === 'show_tours') {
 const dest = 'bali'
 try {
 const r = await fetch(`/offers/${dest}?lang=${l}`)
 if (r.ok) {
 const data = await r.json()
 const tours = (data.offer?.optional_tours || []).slice(0, 5)
 const text = tours.map((t: any) => `- ${(l==='ar'?t.name_ar:t.name_en)}${t.price_usd?` ($${t.price_usd})`:''}`).join('\n') || (l==='ar'?'لا توجد رحلات.':'No tours available.')
 pushAssistant((l==='ar'?'رحلات اختيارية:\n':'Optional tours:\n') + text)
 pushAssistant(l === 'ar' ? 'اختر إجراءً:' : 'Choose an action:', buildSuggestionNav(l))
 }
 } catch {}
 return
 }
 if (button.value === 'get_quote') {
 const interactiveResponse = await sendToAPI('get_quote', l)
 if (interactiveResponse) setMessages(prev => [...prev, interactiveResponse])
 return
 }
 if (button.value.startsWith('set_dates:') || button.value.startsWith('set_pax:') || button.value.startsWith('set_from:')) {
 const interactiveResponse = await sendToAPI(button.value, l)
 if (interactiveResponse) setMessages(prev => [...prev, interactiveResponse])
 return
 }
 if (button.value === 'change_destination') {
 const interactiveResponse = await sendToAPI('change_destination', l)
 if (interactiveResponse) setMessages(prev => [...prev, interactiveResponse])
 return
 }
 if (button.value.startsWith('ask_')) {
 const interactiveResponse = await sendToAPI(button.value, l)
 if (interactiveResponse) setMessages(prev => [...prev, interactiveResponse])
 return
 }
 if (button.value === 'restart_wizard') {
 const interactiveResponse = await sendToAPI('__init__', l)
 if (interactiveResponse) setMessages(prev => [...prev, interactiveResponse])
 return
 }
 }

 const handleSend = async (customMessage?: string | React.MouseEvent) => {
 // Handle different input types
 let messageToSend: string

 if (customMessage) {
 if (typeof customMessage === 'string') {
 messageToSend = customMessage.trim()
 } else {
 // If it's an event object, ignore it and return
 return
 }
 } else {
 messageToSend = input.trim()
 }

 if (!messageToSend || isLoading) return
 
 // Auto-detect language if not set
 const detectedLang = lang ?? detectLanguage(messageToSend)
 if (!lang) {
 setLang(detectedLang)
 }
 
 const userMessage = messageToSend
 
 // Clear input immediately if it's from user typing
 if (!customMessage) {
 setInput('')
 }
 
 const userMsg: ChatMessage = { text: userMessage, isUser: true, timestamp: new Date(), meta: { source: 'system' } }
 setMessages(prev => [...prev, userMsg])
 // Plugin hook
 const ctx = { lang: detectedLang, setLang, pushMessage: (m: ChatMessage) => setMessages(prev => [...prev, m]) }
 Plugins.list().forEach(p => { try { p.onUserMessage?.(userMsg, ctx as any) } catch {} })
 setIsLoading(true)

 try {
 eventBus.emit('typing:start', undefined as any)
 const interactiveResponse = await sendToAPI(userMessage, detectedLang)
 
 // Only add the response if sendToAPI returns a message
 // (it returns null when it handles blocks internally)
 if (interactiveResponse) {
 // Avoid appending identical or duplicate replies
 setMessages(prev => {
 // Check last 3 messages to prevent any recent duplicates
 const recentMessages = prev.slice(-3)
 const isDuplicate = recentMessages.some(msg => 
 !msg.isUser && 
 msg.text && 
 interactiveResponse.text && 
 msg.text.trim() === interactiveResponse.text.trim()
 )
 
 if (isDuplicate) {
 console.log(' Dropping duplicate response')
 return prev
 }
 
 return [...prev, interactiveResponse]
 })
 }
 
 // NOTE: If sendToAPI handled blocks and returned null, 
 // the messages were already added inside sendToAPI via setMessages
 
 // Auto-fetch card for destination mentions (only once)
 const lower = userMessage.toLowerCase()
 const alreadyHasCard = messages.some(m => m.meta?.card?.type === 'trip')
 
 if (!alreadyHasCard) {
 if (lower.includes('بالي') || lower.includes('bali')) {
 fetchOfferAndPushCard('bali', detectedLang)
 } else if (lower.includes('إسطنبول') || lower.includes('istanbul') || lower.includes('turkey')) {
 fetchOfferAndPushCard('istanbul', detectedLang)
 }
 }
 } catch (error) {
 console.error('Error sending message:', error)
 // Add error message
 setMessages(prev => [...prev, { 
 text: detectedLang === 'ar' ? 'عذراً، حدث خطأ في الاتصال بالخادم.' : 'Sorry, there was an error connecting to the server.',
 isUser: false, 
 timestamp: new Date() 
 }])
 } finally {
 setIsLoading(false)
 eventBus.emit('typing:stop', undefined as any)
 }
 }

 const handleKeyPress = (e: React.KeyboardEvent) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault()
 handleSend()
 }
 }

 const sendSupportRequest = async (supportData: Omit<SupportRequest, 'userId' | 'lang'>) => {
 try {
 const response = await fetch(API_ENDPOINTS.SUPPORT_REQUEST, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 ...supportData,
 userId,
 lang: lang ?? 'en'
 })
 })
 
 const result = await response.json()
 
 if (result.ok) {
 // Show success message
 const successMessage = result.message || LABELS[lang ?? 'en'].requestSent
 setMessages(prev => [...prev, { 
 text: successMessage, 
 isUser: false, 
 timestamp: new Date() 
 }])
 } else {
 const errorMessage = result.error || LABELS[lang ?? 'en'].requestFailed
 setMessages(prev => [...prev, { 
 text: errorMessage, 
 isUser: false, 
 timestamp: new Date() 
 }])
 }
 } catch (e) {
 const errorMessage = LABELS[lang ?? 'en'].requestFailed
 setMessages(prev => [...prev, { 
 text: errorMessage, 
 isUser: false, 
 timestamp: new Date() 
 }])
 }
 }

 return {
 isOpen,
 setIsOpen,
 lang,
 messages,
 input,
 setInput,
 isLoading,
 messagesEndRef,
 handleSelectLang,
 handleSend,
 handleKeyPress,
 sendSupportRequest,
 handleButtonOption
 }
}

// Support Modal Hook
export const useSupportModal = () => {
 const [isOpen, setIsOpen] = useState(false)
 const [isSending, setIsSending] = useState(false)
 const [formData, setFormData] = useState({
 name: '',
 email: '',
 phone: '',
 message: ''
 })

 const updateFormData = (field: keyof typeof formData, value: string) => {
 setFormData(prev => ({ ...prev, [field]: value }))
 }

 const resetForm = () => {
 setFormData({
 name: '',
 email: '',
 phone: '',
 message: ''
 })
 }

 const isFormValid = () => {
 return (formData.email || formData.phone) && formData.message.trim()
 }

 return {
 isOpen,
 setIsOpen,
 isSending,
 setIsSending,
 formData,
 updateFormData,
 resetForm,
 isFormValid
 }
}
