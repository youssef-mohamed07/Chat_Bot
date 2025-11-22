import type { Request, Response } from 'express'
import type { ChatRequest, ChatResponse, Language } from '../types/index.js'
import { GeminiService } from '../services/GeminiService.js'
import { SessionManager } from '../services/SessionManager.js'
import { ragService } from '../services/RAGService.js'
import { PromptService } from '../services/PromptService.js'
import { WhatsAppService } from '../services/WhatsAppService.js'
import IntentService from '../services/IntentService.js'
import ValidationService from '../services/ValidationService.js'

export class ChatController {
  private geminiService: GeminiService
  private sessionManager: SessionManager
  private whatsappService: WhatsAppService
  private intentService = IntentService
  private validationService = ValidationService

  constructor() {
    this.geminiService = new GeminiService()
    this.sessionManager = new SessionManager()
    this.whatsappService = new WhatsAppService()
  }

  /**
   * معالجة ذكية للرسائل مع Intent Detection
   */
  private async handleSmartMessage(
    userId: string,
    message: string,
    lang: Language
  ): Promise<{
    shouldUseSmart: boolean
    intent?: any
    response?: string
    hotels?: any[]
    suggestions?: string[]
  }> {
    try {
      // تحليل النية
      const meta = this.sessionManager.getMeta(userId)
      const intent = this.intentService.analyzeMessage(message, meta)

      console.log(`🧠 Intent detected: ${intent.type} (${(intent.confidence * 100).toFixed(0)}%)`)

      // التحقق من الكيانات إذا لزم الأمر
      const validation = this.intentService.validateIntent(intent)
      if (!validation.valid) {
        console.warn('⚠️ Intent validation failed:', validation.errors)
      }

      // معالجة حسب النية
      switch (intent.type) {
        case 'hotel_comparison':
          if (intent.entities.hotelNames && intent.entities.hotelNames.length >= 2) {
            const hotels = ragService.compareHotels(intent.entities.hotelNames, meta.lastDest)
            const comparison = this.formatHotelComparison(hotels, lang)
            
            return {
              shouldUseSmart: true,
              intent,
              response: comparison,
              hotels,
              suggestions: intent.suggestions
            }
          }
          break

        case 'price_inquiry':
          // حل الإشارة الضمنية
          const implicitRef = this.sessionManager.resolveImplicitReference(userId, message)
          if (implicitRef) {
            const hotel = this.findHotelByName(implicitRef, meta.lastDest)
            if (hotel) {
              const priceInfo = this.formatPriceInfo(hotel, lang)
              return {
                shouldUseSmart: true,
                intent,
                response: priceInfo,
                suggestions: intent.suggestions
              }
            }
          }
          break

        case 'recommendation_request':
          const recommendations = ragService.getRecommendations({
            destination: intent.entities.destination || meta.lastDest,
            stars: intent.entities.stars,
            budget: this.categorizeBudget(intent.entities.budget),
          }, lang)

          if (recommendations.length > 0) {
            this.sessionManager.updateContextMemory(userId, {
              lastShownHotels: recommendations.map((h: any) => h.hotel_name_en)
            })

            return {
              shouldUseSmart: true,
              intent,
              hotels: recommendations,
              suggestions: intent.suggestions
            }
          }
          break

        case 'general_question':
          const answer = ragService.answerGeneralQuestion(message, lang)
          if (answer) {
            return {
              shouldUseSmart: true,
              intent,
              response: answer,
              suggestions: intent.suggestions
            }
          }
          break

        case 'unknown':
          // إذا كانت الثقة منخفضة جداً، نقدم اقتراحات
          if (intent.confidence < 0.4) {
            const fallback = lang === 'ar'
              ? `عذراً، لم أفهم طلبك بوضوح. هل تريد:\n${intent.suggestions.map((s: string) => `• ${s}`).join('\n')}`
              : `Sorry, I didn't understand. Would you like to:\n${intent.suggestions.map((s: string) => `• ${s}`).join('\n')}`
            
            return {
              shouldUseSmart: true,
              intent,
              response: fallback,
              suggestions: intent.suggestions
            }
          }
          break
      }

      // إذا لم نتمكن من المعالجة الذكية، نرجع للنظام العادي
      return {
        shouldUseSmart: false,
        intent
      }

    } catch (error) {
      console.error('Error in handleSmartMessage:', error)
      return { shouldUseSmart: false }
    }
  }

  /**
   * تنسيق مقارنة الفنادق
   */
  private formatHotelComparison(hotels: any[], lang: Language): string {
    if (hotels.length === 0) {
      return lang === 'ar' ? 'عذراً، لم أجد الفنادق المطلوبة' : 'Sorry, hotels not found'
    }

    let comparison = lang === 'ar' ? '📊 مقارنة الفنادق:\n\n' : '📊 Hotel Comparison:\n\n'

    for (const hotel of hotels) {
      const name = lang === 'ar' ? hotel.hotel_name_ar : hotel.hotel_name_en
      const stars = '⭐'.repeat(hotel.stars || 0)
      const price = hotel.price_egp || hotel.prices_egp?.double || 0
      const priceUsd = hotel.price_usd_reference || Math.round(price / 50)

      comparison += `🏨 ${name}\n`
      comparison += `${stars} (${hotel.stars} ${lang === 'ar' ? 'نجوم' : 'stars'})\n`
      comparison += `💰 ${price.toLocaleString()} ${lang === 'ar' ? 'جنيه' : 'EGP'} (~$${priceUsd})\n`
      comparison += `📍 ${hotel.area || hotel.destination}\n`
      comparison += `🍽️ ${lang === 'ar' ? hotel.room_type_ar : hotel.room_type_en}\n\n`
    }

    return comparison
  }

  /**
   * تنسيق معلومات السعر
   */
  private formatPriceInfo(hotel: any, lang: Language): string {
    const name = lang === 'ar' ? hotel.hotel_name_ar : hotel.hotel_name_en
    const price = hotel.price_egp || hotel.prices_egp?.double || 0
    const priceUsd = hotel.price_usd_reference || Math.round(price / 50)

    if (lang === 'ar') {
      return `💰 سعر فندق ${name}:\n\n` +
        `• للفرد: ${price.toLocaleString()} جنيه (~$${priceUsd})\n` +
        `• يشمل: ${hotel.room_type_ar || 'شامل جميع الوجبات'}\n` +
        `• المدة: 4 أيام / 3 ليالي`
    } else {
      return `💰 Price for ${name}:\n\n` +
        `• Per person: ${price.toLocaleString()} EGP (~$${priceUsd})\n` +
        `• Includes: ${hotel.room_type_en || 'All Inclusive'}\n` +
        `• Duration: 4 days / 3 nights`
    }
  }

  /**
   * البحث عن فندق بالاسم
   */
  private findHotelByName(name: string, destination?: string): any {
    const hotels = ragService.compareHotels([name], destination)
    return hotels.length > 0 ? hotels[0] : null
  }

  /**
   * تصنيف الميزانية
   */
  private categorizeBudget(budget?: number): 'low' | 'medium' | 'high' | undefined {
    if (!budget) return undefined
    if (budget < 8000) return 'low'
    if (budget <= 15000) return 'medium'
    return 'high'
  }

  // Main chat handler - 100% AI-driven
  async handleChat(req: Request, res: Response): Promise<void> {
    try {
      const { message, userId = 'default-user', lang = 'en', customerInfo }: ChatRequest = req.body
      
      console.log(`\n📥 [${userId}] Message: "${message}" (${lang})`)
      
      if (!message || message.trim() === '') {
        res.status(400).json({ error: 'Message is required' })
        return
      }

      const history = this.sessionManager.getSession(userId)
      const meta = this.sessionManager.getMeta(userId)

      // Special case: initialization
      if (message.trim() === '__init__') {
        console.log(`🔍 __init__ called with customerInfo:`, customerInfo)
        // Save customer info if provided
        if (customerInfo) {
          console.log(`💾 Saving customer info: ${customerInfo.name}, ${customerInfo.phone}, ${customerInfo.email}`)
          this.sessionManager.updateMeta(userId, {
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            customerEmail: customerInfo.email
          })
          // Verify saved data
          const savedMeta = this.sessionManager.getMeta(userId)
          console.log(`✅ Verified saved data:`, {
            customerName: savedMeta.customerName,
            customerPhone: savedMeta.customerPhone,
            customerEmail: savedMeta.customerEmail
          })
        } else {
          console.warn(`⚠️ __init__ called WITHOUT customerInfo!`)
        }
        await this.handleInit(res, lang as Language, userId)
        return
      }

      // Extract button actions data if present
      let userMessage = message
      let contextData: any = {}
      let isDetectedAction = false  // Track if this is a detected action (like destination from text)

      // Track previous step before updating
      const previousStep = meta.step || 'initial'

      // Handle button clicks (extract data but still use AI)
      if (message.startsWith('dest:')) {
        const dest = message.replace('dest:', '').toLowerCase()
        contextData.selectedDestination = dest
        this.sessionManager.updateMeta(userId, { 
          lastDest: dest,
          step: 'destination_selected',
          previousStep
        })
        userMessage = lang === 'ar' 
          ? `اخترت ${dest === 'bali' ? 'بالي' : dest === 'istanbul' ? 'إسطنبول' : dest}`
          : `I chose ${dest}`
      } 
      // ✨ NEW: Detect destination from natural language text
      else if (!meta.lastDest || meta.step === 'initial') {
        const detectedDest = this.detectDestinationFromText(message, lang as Language)
        if (detectedDest) {
          contextData.selectedDestination = detectedDest
          isDetectedAction = true  // Mark as detected action
          this.sessionManager.updateMeta(userId, { 
            lastDest: detectedDest,
            step: 'destination_selected',
            previousStep
          })
          userMessage = lang === 'ar' 
            ? `اخترت ${this.getDestinationNameAr(detectedDest)}`
            : `I chose ${this.getDestinationNameEn(detectedDest)}`
          
          console.log(`✅ Detected destination from text: ${detectedDest}`)
        }
      }
      else if (message.startsWith('ask_')) {
        const topic = message.replace('ask_', '')
        const dest = meta.lastDest || 'bali'
        contextData.requestedTopic = topic
        contextData.destination = dest
        userMessage = lang === 'ar'
          ? `أريد معرفة ${this.getTopicNameAr(topic)} في ${dest === 'bali' ? 'بالي' : 'إسطنبول'}`
          : `I want to know about ${topic} in ${dest}`
      } else if (message.startsWith('set_dates:')) {
        const [, dates] = message.split(':')
      } else {
        // ✨ المعالجة الذكية للرسائل الحرة
        const smartResult = await this.handleSmartMessage(userId, message, lang as Language)
        
        if (smartResult.shouldUseSmart) {
          console.log('🎯 Using smart response handler')
          
          // حفظ في تاريخ المحادثة
          this.sessionManager.addConversationTurn(
            userId,
            message,
            smartResult.response || '',
            smartResult.intent?.type,
            smartResult.intent?.entities
          )

          // تحديث ذاكرة السياق
          if (smartResult.hotels && smartResult.hotels.length > 0) {
            this.sessionManager.updateContextMemory(userId, {
              lastShownHotels: smartResult.hotels.map((h: any) => h.hotel_name_en)
            })
          }

          const chatResponse: ChatResponse = {
            reply: smartResult.response || '',
            ui: smartResult.hotels ? {
              blocks: [{
                type: 'hotelCards',
                hotels: smartResult.hotels.map((h: any) => ({
                  hotel_name_ar: h.hotel_name_ar,
                  hotel_name_en: h.hotel_name_en,
                  priceEGP: h.price_egp || h.prices_egp?.double || 0,
                  priceUSD: h.price_usd_reference || Math.round((h.price_egp || 0) / 50),
                  stars: h.stars,
                  area: h.area || h.destination,
                  image_url: h.image_url,
                  room_type_ar: h.room_type_ar,
                  room_type_en: h.room_type_en,
                }))
              }]
            } : undefined
          }

          res.json(chatResponse)
          return
        }
      }

      if (message.startsWith('set_dates:')) {
        const [, dates] = message.split(':')
        const [start, end] = dates.split('..')
        this.sessionManager.updateMeta(userId, { 
          startDate: start, 
          endDate: end,
          step: 'dates_selected',
          previousStep
        })
        userMessage = lang === 'ar'
          ? `اخترت السفر من ${start} إلى ${end}`
          : `I chose to travel from ${start} to ${end}`
      } else if (message.startsWith('set_pax:')) {
        const pax = parseInt(message.replace('set_pax:', ''), 10)
        this.sessionManager.updateMeta(userId, { 
          pax,
          step: 'travelers_selected',
          previousStep
        })
        userMessage = lang === 'ar'
          ? `عدد المسافرين ${pax} ${pax > 1 ? 'أشخاص' : 'شخص'}`
          : `Number of travelers is ${pax} ${pax > 1 ? 'people' : 'person'}`
      } else if (message.startsWith('budget:')) {
        const budgetValue = message.replace('budget:', '')
        // Handle both numeric and string budget values
        const budget = isNaN(parseInt(budgetValue)) ? budgetValue : parseInt(budgetValue)
        this.sessionManager.updateMeta(userId, { 
          budget,
          step: 'budget_selected',
          previousStep
        })
        if (typeof budget === 'number') {
          userMessage = lang === 'ar'
            ? `ميزانيتي حوالي ${budget} دولار للشخص`
            : `My budget is around $${budget} per person`
        } else {
          const budgetNames: Record<string, { ar: string; en: string }> = {
            budget: { ar: 'اقتصادي (حتى $300)', en: 'Budget (up to $300)' },
            standard: { ar: 'متوسط ($300-$600)', en: 'Standard ($300-$600)' },
            luxury: { ar: 'فاخر (أكثر من $600)', en: 'Luxury (above $600)' },
            all: { ar: 'جميع الفنادق', en: 'All hotels' }
          }
          const name = budgetNames[budget] || { ar: budget, en: budget }
          userMessage = lang === 'ar'
            ? `اخترت فئة ${name.ar}`
            : `I chose ${name.en} category`
        }
      } else if (message.startsWith('hotel:')) {
        // ✅ FIX: Extract hotel name and find it in RAG
        const hotelIdentifier = message.replace('hotel:', '').trim()
        
        console.log(`🏨 User selected hotel: ${hotelIdentifier}`)
        
        const dest = meta.lastDest || 'sharm_el_sheikh'
        const destChunks = ragService.getDestinationInfo(dest, 'hotels', lang)
        
        let hotelDisplayName = hotelIdentifier
        if (destChunks.length > 0 && destChunks[0].metadata?.hotels) {
          const hotel = destChunks[0].metadata.hotels.find((h: any) => 
            h.hotel_name_en === hotelIdentifier ||
            h.hotel_name_ar === hotelIdentifier
          )
          
          if (hotel) {
            hotelDisplayName = lang === 'ar' ? (hotel.hotel_name_ar || hotel.hotel_name_en) : (hotel.hotel_name_en || hotel.hotel_name_ar)
            console.log(`✅ Found hotel: ${hotelDisplayName}`)
          } else {
            console.warn(`⚠️ Hotel not found: ${hotelIdentifier}`)
          }
        }
        
        contextData.selectedHotel = hotelIdentifier
        this.sessionManager.updateMeta(userId, { 
          selectedHotel: hotelIdentifier,
          step: 'hotel_selected',
          previousStep
        })
        
        userMessage = lang === 'ar'
          ? `اخترت فندق ${hotelDisplayName}`
          : `I chose ${hotelDisplayName} hotel`
      } else if (message.startsWith('meal:')) {
        const mealPlan = message.replace('meal:', '').trim()
        console.log(`🍽️ User selected meal plan: ${mealPlan}`)
        this.sessionManager.updateMeta(userId, { 
          mealPlan,
          step: 'meal_selected',
          previousStep
        })
        userMessage = lang === 'ar'
          ? `اخترت نظام ${this.getMealPlanName(mealPlan, lang)}`
          : `I chose ${this.getMealPlanName(mealPlan, lang)}`
      } else if (message.startsWith('room:')) {
        const roomType = message.replace('room:', '').trim()
        console.log(`🛏️ User selected room type: ${roomType}`)
        this.sessionManager.updateMeta(userId, { 
          roomType,
          step: 'room_selected',
          previousStep
        })
        userMessage = lang === 'ar'
          ? `اخترت ${this.getRoomTypeName(roomType, lang)}`
          : `I chose ${this.getRoomTypeName(roomType, lang)}`
      } else if (message.startsWith('contact_info:')) {
        // Parse customer contact info: contact_info:name|phone|email
        const contactData = message.replace('contact_info:', '')
        const [name, phone, email] = contactData.split('|')
        console.log(`📋 Customer info received: ${name}, ${phone}, ${email}`)
        this.sessionManager.updateMeta(userId, { 
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          step: 'contact_info',
          previousStep
        })
        userMessage = lang === 'ar' 
          ? `شكراً ${name}! سنتواصل معك قريباً`
          : `Thank you ${name}! We'll contact you soon`
      } else if (message === 'confirm_booking') {
        console.log(`✅ User confirmed booking`)
        this.sessionManager.updateMeta(userId, { step: 'booking_confirmed', previousStep })
        
        // Get customer data from session
        const meta = this.sessionManager.getMeta(userId)
        
        console.log('📋 Customer data from session:', {
          name: meta.customerName,
          phone: meta.customerPhone,
          email: meta.customerEmail
        })
        
        // CRITICAL: Check if customer data exists
        if (!meta.customerName || !meta.customerPhone || !meta.customerEmail) {
          console.error('❌ CUSTOMER DATA MISSING FROM SESSION!')
          console.error('Full meta:', JSON.stringify(meta, null, 2))
        }
        
        // Send WhatsApp notification with booking details
        const bookingSummary = {
          destination: meta.lastDest || 'unknown',
          hotel: meta.selectedHotel || 'Hotel',
          mealPlan: this.getMealPlanName(meta.mealPlan || '', lang),
          roomType: this.getRoomTypeName(meta.roomType || '', lang),
          travelers: meta.pax || 1,
          startDate: meta.startDate,
          endDate: meta.endDate,
          budget: typeof meta.budget === 'object' ? meta.budget : undefined,
          customerName: meta.customerName || 'عميل',
          customerPhone: meta.customerPhone || '201145389973',
          customerEmail: meta.customerEmail || 'booking@quickair.com',
          language: lang
        }
        
        // Send WhatsApp notification (non-blocking)
        this.whatsappService.sendBookingSummary(bookingSummary)
          .then(sent => {
            if (sent) {
              console.log('✅ WhatsApp notification sent successfully')
            } else {
              console.warn('⚠️  WhatsApp notification failed')
            }
          })
          .catch(err => console.error('❌ WhatsApp error:', err))
        
        userMessage = lang === 'ar' 
          ? 'تم تأكيد الحجز بنجاح! سيتواصل معك فريقنا قريباً عبر واتساب لاستكمال الإجراءات.'
          : 'Booking confirmed successfully! Our team will contact you soon via WhatsApp to complete the process.'
      } else if (message === 'modify_booking') {
        console.log(`✏️ User wants to modify booking`)
        this.sessionManager.updateMeta(userId, { step: 'booking_modification', previousStep })
        userMessage = lang === 'ar' ? 'أريد تعديل الحجز' : 'I want to modify the booking'
      } else if (message === 'contact_support') {
        console.log(`📞 User wants to contact support`)
        this.sessionManager.updateMeta(userId, { step: 'support_contact', previousStep })
        userMessage = lang === 'ar' ? 'أريد التواصل مع الدعم' : 'I want to contact support'
      } else if (message.startsWith('filter:')) {
        const filterValue = message.replace('filter:', '')
        const [filterType, value] = filterValue.split('=')
        this.sessionManager.updateMeta(userId, { 
          [`filter_${filterType}`]: value,
          previousStep
        })
        userMessage = lang === 'ar'
          ? `تصفية ${filterType}: ${value}`
          : `Filter ${filterType}: ${value}`
      } else if (message.startsWith('set_from:')) {
        const city = message.replace('set_from:', '')
        this.sessionManager.updateMeta(userId, { depCity: city })
        userMessage = lang === 'ar'
          ? `مدينة المغادرة ${city}`
          : `Departure city is ${city}`
      } else if (message === 'contact_support') {
        userMessage = lang === 'ar'
          ? 'أريد التواصل مع الدعم الفني'
          : 'I want to contact support'
      }
      // For regular messages, don't update previousStep to avoid blocking widgets

      // Get AI response with full context
      await this.handleAIChat(userMessage, userId, lang as Language, history, 
                              this.sessionManager.getMeta(userId), contextData, res, isDetectedAction, message)

    } catch (error) {
      console.error('❌ Chat Error:', error)
      const errorLang = (req.body?.lang || 'en') as Language
      res.status(500).json({ 
        error: 'Internal server error',
        reply: errorLang === 'ar' 
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.' 
          : 'Sorry, an error occurred. Please try again.'
      })
    }
  }

  // Handle initialization with AI
  private async handleInit(res: Response, lang: Language, userId: string): Promise<void> {
    console.log('🎯 Handling initialization')
    
    // Get available destinations
    const destinations = ragService.destinations().filter(d => d && d !== 'unknown')
    const destButtons = destinations.map(d => ({
      text: lang === 'ar' ? (d === 'istanbul' ? 'إسطنبول' : d === 'bali' ? 'بالي' : d) : d.charAt(0).toUpperCase() + d.slice(1),
      value: `dest:${d}`
    }))

    // Get welcome message with destinations context
    const destList = lang === 'ar' 
      ? destinations.map(d => d === 'bali' ? 'بالي' : d === 'istanbul' ? 'إسطنبول' : d === 'beirut' ? 'بيروت' : d).join(' و ')
      : destinations.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')
    
    const contextMessage = lang === 'ar'
      ? `لدينا عروض سفر رائعة إلى: ${destList}. نقدم باقات شاملة تشمل الفنادق، الجولات السياحية، ومساعدة في التأشيرات.`
      : `We have amazing travel packages to: ${destList}. We offer complete packages including hotels, tours, and visa assistance.`

    const welcomePrompt = lang === 'ar'
      ? `أنت مساعد Quick Air الذكي. رحب بالعميل بحرارة واذكر الوجهات المتاحة بطريقة جذابة ومشوقة. ${contextMessage} تذكر: رد بالعربي فقط 100%، لا تستخدم أي كلمات إنجليزية.`
      : `You are Quick Air's intelligent assistant. Welcome the customer warmly and mention available destinations in an attractive way. ${contextMessage} Remember: Respond in English ONLY 100%, do not use any Arabic words.`

    const messages = [
      { role: 'system' as const, content: PromptService.getSystemPrompt(lang) },
      { role: 'system' as const, content: welcomePrompt },
      { role: 'user' as const, content: lang === 'ar' ? 'مرحبا' : 'Hello' }
    ]

    try {
      const result = await this.geminiService.sendChatRequest(messages, lang, false)
      
      const ui: ChatResponse['ui'] = {
        blocks: [
          { type: 'text', text: result.text },
          {
            type: 'buttons',
            text: lang === 'ar' ? '🌍 اختر وجهتك:' : '🌍 Choose your destination:',
            buttons: destButtons
          }
        ]
      }

      this.sessionManager.addMessage(userId, { role: 'assistant', content: result.text })
      res.json({ reply: result.text, ui })
    } catch (error) {
      console.error('Init error:', error)
      // Fallback to static welcome
      const fallback = PromptService.getWelcomeMessage(lang)
      res.json({ 
        reply: fallback, 
        ui: { blocks: [
          { type: 'text', text: fallback },
          { type: 'buttons', text: lang === 'ar' ? '🌍 اختر وجهتك:' : '🌍 Choose your destination:', buttons: destButtons }
        ]}
      })
    }
  }

  // Handle AI-driven chat with smart UI generation
  private async handleAIChat(
    message: string,
    userId: string,
    lang: Language,
    history: any[],
    meta: any,
    contextData: any,
    res: Response,
    isDetectedAction: boolean = false,
    originalMessage: string = message
  ): Promise<void> {
    try {
      console.log('🤖 Processing with AI...')
      
      const step = meta.step || 'initial'
      
      // ✨ Use predefined responses for simple widget steps to save API quota
      const simpleSteps = ['destination_selected', 'dates_selected', 'travelers_selected', 'hotel_selected', 'meal_selected', 'room_selected']
      const isSimpleStep = simpleSteps.includes(step)
      const isButtonAction = originalMessage.startsWith('dest:') || 
                             originalMessage.startsWith('set_dates:') || 
                             originalMessage.startsWith('set_pax:') ||
                             originalMessage.startsWith('hotel:') ||
                             originalMessage.startsWith('meal:') ||
                             originalMessage.startsWith('room:')
      
      let aiResponse = ''
      
      // Special case for budget selection - needs context from hotels
      if (step === 'budget_selected' && originalMessage.startsWith('budget:')) {
        aiResponse = lang === 'ar' 
          ? `ممتاز! 🏨 إليك أفضل الفنادق المتاحة:`
          : `Excellent! 🏨 Here are the best available hotels:`
      }
      // Use predefined response for simple button actions
      else if (isButtonAction && isSimpleStep) {
        const predefined = this.getPredefinedResponse(step, lang, meta)
        if (predefined) {
          console.log('✅ Using predefined response (saving API quota)')
          aiResponse = predefined
        }
      }
      
      // Only call AI for complex queries or when no predefined response
      if (!aiResponse) {
        // Build rich context for AI
        const enrichedContext = await this.buildEnrichedContext(message, lang, meta, contextData)
        
        // Build messages with context
        const messages = this.geminiService.buildMessages(message, history, lang, enrichedContext)

        console.log('🚀 Calling Gemini API...')
        const result = await this.geminiService.sendChatRequest(messages, lang, true)
        
        console.log('✅ Got AI response:', result.text?.substring(0, 100))

        // Handle function call
        if (result.functionCall) {
          console.log('🔧 Function called:', result.functionCall.name)
          const functionResult = await this.executeFunctionCall(result.functionCall, lang, userId)
          
          this.sessionManager.addMessage(userId, { role: 'user', content: message })
          this.sessionManager.addMessage(userId, { role: 'assistant', content: functionResult.text })
          
          res.json({ reply: functionResult.text, ui: functionResult.ui })
          return
        }
        
        aiResponse = result.text
      }

      // Generate smart UI based on response and context
      console.log(`📊 Current step: ${step}, Meta:`, JSON.stringify(meta, null, 2))
      const ui = await this.generateSmartUI(aiResponse, originalMessage, lang, meta, contextData, userId, isDetectedAction)
      
      this.sessionManager.addMessage(userId, { role: 'user', content: message })
      this.sessionManager.addMessage(userId, { role: 'assistant', content: aiResponse })
      
      console.log(`✅ Sending response with ${ui?.blocks?.length || 0} UI blocks`)
      res.json({ reply: aiResponse, ui })

    } catch (error) {
      console.error('❌ AI Chat Error:', error)
      const fallback = lang === 'ar'
        ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى أو التواصل مع فريق الدعم.'
        : 'Sorry, an error occurred. Please try again or contact our support team.'
      
      this.sessionManager.addMessage(userId, { role: 'user', content: message })
      this.sessionManager.addMessage(userId, { role: 'assistant', content: fallback })
      
      res.json({ 
        reply: fallback,
        ui: {
          blocks: [
            { type: 'text', text: fallback },
            {
              type: 'buttons',
              text: lang === 'ar' ? 'كيف يمكنني مساعدتك؟' : 'How can I help you?',
              buttons: [
                { text: lang === 'ar' ? '📞 تواصل عبر واتساب' : '📞 Contact via WhatsApp', value: 'whatsapp' },
                { text: lang === 'ar' ? '🏨 الفنادق' : '🏨 Hotels', value: 'ask_hotels' },
                { text: lang === 'ar' ? '🎯 الجولات' : '🎯 Tours', value: 'ask_tours' }
              ]
            }
          ]
        }
      })
    }
  }

  // Build enriched context from RAG and user data
  private async buildEnrichedContext(
    message: string,
    lang: Language,
    meta: any,
    contextData: any
  ): Promise<string> {
    const contextParts: string[] = []
    const step = meta.step || 'initial'

    // ===== Simple step-based instructions - ONE step at a time =====
    
    switch(step) {
      case 'initial':
        contextParts.push(lang === 'ar'
          ? 'اسأل فقط: "فين تحب تسافر؟"'
          : 'Ask only: "Where to travel?"')
        break
        
      case 'destination_selected':
        contextParts.push(
          `📍 ${meta.lastDest}`,
          lang === 'ar' ? 'اسأل فقط: "امتى السفر؟"' : 'Ask only: "When to travel?"'
        )
        break
        
      case 'dates_selected':
        contextParts.push(
          `📍 ${meta.lastDest} | 📅 ${meta.startDate}-${meta.endDate}`,
          lang === 'ar' ? 'اسأل فقط: "كام شخص؟"' : 'Ask only: "How many people?"'
        )
        break
        
      case 'travelers_selected':
        contextParts.push(
          `📍 ${meta.lastDest} | 📅 ${meta.startDate}-${meta.endDate} | 👥 ${meta.pax}`,
          lang === 'ar' ? 'اسأل فقط: "الميزانية؟"' : 'Ask only: "Budget?"'
        )
        break
        
      case 'budget_selected':
      case 'ready_for_offers':
        const dest = meta.lastDest
        const destChunks = ragService.getDestinationInfo(dest, 'hotels', lang)
        
        console.log(`🔍 Getting hotels for ${dest}:`, destChunks.length, 'chunks')
        
        if (destChunks.length > 0 && destChunks[0].metadata?.hotels) {
          const allHotels = destChunks[0].metadata.hotels
          console.log(`📊 Found ${allHotels.length} hotels in ${dest}`)
          
          // Filter by budget using EGP prices
          let suitable = allHotels
          const budgetValue = meta.budget
          
          if (budgetValue && typeof budgetValue === 'number') {
            suitable = allHotels.filter((h: any) => {
              const priceEGP = h.prices_egp?.double || h.price_egp || 0
              const priceUSD = Math.round(priceEGP / 50)
              return priceUSD > 0 && priceUSD <= (budgetValue * 1.2)
            })
          } else if (budgetValue === 'budget') {
            suitable = allHotels.filter((h: any) => {
              const priceEGP = h.prices_egp?.double || h.price_egp || 0
              const priceUSD = Math.round(priceEGP / 50)
              return priceUSD <= 300
            })
          } else if (budgetValue === 'standard') {
            suitable = allHotels.filter((h: any) => {
              const priceEGP = h.prices_egp?.double || h.price_egp || 0
              const priceUSD = Math.round(priceEGP / 50)
              return priceUSD > 300 && priceUSD <= 600
            })
          } else if (budgetValue === 'luxury') {
            suitable = allHotels.filter((h: any) => {
              const priceEGP = h.prices_egp?.double || h.price_egp || 0
              const priceUSD = Math.round(priceEGP / 50)
              return priceUSD > 600
            })
          }
          
          console.log(`✅ After filtering: ${suitable.length} hotels match budget`)
          
          if (suitable.length > 0) {
            // Format hotels with REAL names and prices from JSON
            const hotelsText = suitable.slice(0, 6).map((h: any) => {
              const nameAr = h.hotel_name_ar || h.hotel_name_en || h.hotel_name || 'فندق'
              const nameEn = h.hotel_name_en || h.hotel_name_ar || h.hotel_name || 'Hotel'
              const name = lang === 'ar' ? nameAr : nameEn
              const stars = h.stars || h.rating || 0
              const priceEGP = h.prices_egp?.double || h.price_egp || 0
              const priceUSD = Math.round(priceEGP / 50)
              const area = h.area || dest
              const roomType = lang === 'ar' ? (h.room_type_ar || h.room_type_en || '') : (h.room_type_en || h.room_type_ar || '')
              
              return `🏨 **${name}** (${stars}⭐)\n   📍 ${area}\n   💰 ${priceEGP.toLocaleString()} جنيه (~$${priceUSD} دولار)\n   🛏️ ${roomType}`
            }).join('\n\n')
            
            contextParts.push(
              `\n📍 **وجهة السفر: ${dest.toUpperCase()}**`,
              `👥 عدد المسافرين: ${meta.pax || 2}`,
              `\n🏨 **الفنادق المتاحة (${suitable.length} فندق):**\n`,
              hotelsText,
              `\n\n${lang === 'ar' ? '✨ اعرض هذه الفنادق بأسمائها الحقيقية وأسعارها الفعلية. لا تخترع أسماء!' : '✨ Show these hotels with their REAL names and prices. Do not invent names!'}`
            )
          } else {
            contextParts.push(
              lang === 'ar'
                ? `\n⚠️ لا توجد فنادق تناسب الميزانية في ${dest}. اقترح فنادق قريبة من السعر المطلوب.`
                : `\n⚠️ No hotels match the budget in ${dest}. Suggest nearby price range.`
            )
          }
        } else {
          console.log(`⚠️ No hotel data found for destination: ${dest}`)
          contextParts.push(
            lang === 'ar'
              ? `\n❌ لا توجد بيانات فنادق متاحة حالياً لوجهة ${dest}`
              : `\n❌ No hotel data currently available for ${dest}`
          )
        }
        break
        
      case 'hotel_selected':
        const hotelIdentifier = meta.selectedHotel
        const hotelDest = meta.lastDest
        const hotelChunks = ragService.getDestinationInfo(hotelDest, 'hotels', lang)
        
        console.log(`🔍 Looking for hotel: "${hotelIdentifier}" in ${hotelDest}`)
        
        if (hotelChunks.length > 0 && hotelChunks[0].metadata?.hotels) {
          const hotel = hotelChunks[0].metadata.hotels.find((h: any) => 
            h.hotel_name_en === hotelIdentifier ||
            h.hotel_name_ar === hotelIdentifier ||
            h.hotel_name_en?.toLowerCase() === hotelIdentifier.toLowerCase() ||
            h.hotel_name_ar?.toLowerCase() === hotelIdentifier.toLowerCase()
          )
          
          if (hotel) {
            const name = lang === 'ar' ? (hotel.hotel_name_ar || hotel.hotel_name_en) : (hotel.hotel_name_en || hotel.hotel_name_ar)
            const stars = hotel.stars || 0
            const priceEGP = hotel.price_egp || 0
            const priceUSD = hotel.price_usd_reference || Math.round(priceEGP / 50)
            const area = hotel.area || hotelDest
            const roomType = lang === 'ar' ? (hotel.room_type_ar || hotel.room_type_en) : (hotel.room_type_en || hotel.room_type_ar)
            
            contextParts.push(
              `\n🏨 **${name}** (${stars}⭐)`,
              `📍 ${area}`,
              `💰 ${priceEGP.toLocaleString()} جنيه (~$${priceUSD} دولار)`,
              `🛏️ ${roomType}`,
              `\n${lang === 'ar' ? '✅ اعرض التفاصيل واسأل عن نظام الوجبات' : '✅ Show details and ask about meal plan'}`
            )
            
            console.log(`✅ Found hotel: ${name}`)
          } else {
            console.error(`❌ Hotel NOT FOUND: "${hotelIdentifier}"`)
            console.log('Available:', hotelChunks[0].metadata.hotels.map((h: any) => h.hotel_name_en))
            contextParts.push(
              lang === 'ar'
                ? `\n⚠️ عذراً، لا توجد معلومات عن "${hotelIdentifier}"`
                : `\n⚠️ Sorry, no info for "${hotelIdentifier}"`
            )
          }
        }
        break
        
      case 'meal_selected':
        const mealHotelIdentifier = meta.selectedHotel
        const mealHotelDest = meta.lastDest
        const mealPlanName = this.getMealPlanName(meta.mealPlan, lang)
        
        contextParts.push(
          `🏨 ${mealHotelIdentifier}`,
          `🍽️ ${mealPlanName}`,
          `\n${lang === 'ar' ? '✅ اسأل عن نوع الغرفة' : '✅ Ask about room type'}`
        )
        break
        
      case 'room_selected':
        const roomHotelIdentifier = meta.selectedHotel
        const roomMealPlan = this.getMealPlanName(meta.mealPlan, lang)
        const roomTypeName = this.getRoomTypeName(meta.roomType, lang)
        
        contextParts.push(
          `🏨 ${roomHotelIdentifier}`,
          `🍽️ ${roomMealPlan}`,
          `🛏️ ${roomTypeName}`,
          `\n${lang === 'ar' ? '✅ اعرض ملخص الحجز النهائي' : '✅ Show final booking summary'}`
        )
        break
    }

    // Add specific topic data if requested (hotels/tours inquiry)
    if (contextData.requestedTopic && contextData.destination) {
      const topicChunks = ragService.getDestinationInfo(
        contextData.destination,
        contextData.requestedTopic,
        lang
      )
      
      if (topicChunks.length > 0) {
        let topicContext = ''
        
        if (contextData.requestedTopic === 'hotels' && topicChunks[0].metadata?.hotels) {
          const hotels = topicChunks[0].metadata.hotels.slice(0, 5)
          topicContext = PromptService.formatHotels(hotels, lang, hotels.length)
        } else if (contextData.requestedTopic === 'tours' && topicChunks[0].metadata?.tours) {
          const tours = topicChunks[0].metadata.tours.slice(0, 5)
          topicContext = PromptService.formatTours(tours, lang, tours.length)
        } else {
          topicContext = topicChunks.map(c => c.text).join('\n\n')
        }
        
        if (topicContext) {
          contextParts.push(`\n📚 ${topicContext}`)
        }
      }
    }

    return contextParts.join('\n')
  }

  // Detect if a widget is required based on missing session data
  private detectRequiredWidget(meta: any, lang: Language): { type: string; widget: any; message: string } | null {
    // Check what data is missing and return appropriate widget
    
    // No destination selected
    if (!meta.lastDest && meta.step !== 'destination_selected') {
      const destinations = ragService.destinations().filter(d => d && d !== 'unknown')
      const international = destinations.filter(d => ['bali', 'istanbul', 'beirut'].includes(d))
      const local = destinations.filter(d => !['bali', 'istanbul', 'beirut'].includes(d))
      
      return {
        type: 'destinations',
        message: lang === 'ar' ? 'ممتاز! 🌟 اختر وجهتك المفضلة:' : 'Great! 🌟 Choose your destination:',
        widget: {
          type: 'destinations',
          title: lang === 'ar' ? 'اختر وجهتك' : 'Choose your destination',
          categories: [
            {
              title: lang === 'ar' ? '🌍 وجهات دولية' : '🌍 International',
              destinations: international.map(d => ({
                id: d,
                name: this.getDestinationNameAr(d),
                name_en: this.getDestinationNameEn(d),
                emoji: this.getDestinationEmoji(d)
              }))
            },
            {
              title: lang === 'ar' ? '🏖️ وجهات محلية' : '🏖️ Local',
              destinations: local.map(d => ({
                id: d,
                name: this.getDestinationNameAr(d),
                name_en: this.getDestinationNameEn(d),
                emoji: this.getDestinationEmoji(d)
              }))
            }
          ]
        }
      }
    }
    
    // Destination selected but no dates
    if (meta.lastDest && !meta.startDate && meta.step !== 'dates_selected') {
      const today = new Date()
      const maxDate = new Date()
      maxDate.setMonth(maxDate.getMonth() + 6)
      
      return {
        type: 'dateRange',
        message: lang === 'ar' ? 'اختيار رائع! 🎉 اختر تواريخ السفر:' : 'Great choice! 🎉 Select travel dates:',
        widget: {
          type: 'dateRange',
          heading: lang === 'ar' ? 'تواريخ السفر' : 'Travel dates',
          minDate: today.toISOString().split('T')[0],
          maxDate: maxDate.toISOString().split('T')[0]
        }
      }
    }
    
    // Dates selected but no travelers count
    if (meta.startDate && !meta.pax && meta.step !== 'travelers_selected') {
      return {
        type: 'travellers',
        message: lang === 'ar' ? 'ممتاز! 👥 كم عدد المسافرين؟' : 'Excellent! 👥 How many travelers?',
        widget: {
          type: 'travellers',
          heading: lang === 'ar' ? 'عدد المسافرين' : 'Number of travelers',
          min: 1,
          max: 10,
          default: 2
        }
      }
    }
    
    // Travelers count selected but no budget
    if (meta.pax && !meta.budget && meta.step !== 'budget_selected') {
      return {
        type: 'budget',
        message: lang === 'ar' ? 'تمام! 💰 اختر ميزانيتك:' : 'Perfect! 💰 Choose your budget:',
        widget: {
          type: 'budget',
          title_ar: 'اختر ميزانيتك',
          title_en: 'Choose Your Budget',
          ranges: [
            {
              label_ar: 'اقتصادي',
              label_en: 'Budget',
              min: 0,
              max: 15000,
              icon: '💰',
              description_ar: 'خيارات ممتازة بأسعار مناسبة',
              description_en: 'Great options at affordable prices'
            },
            {
              label_ar: 'متوسط',
              label_en: 'Standard',
              min: 15000,
              max: 30000,
              icon: '💎',
              description_ar: 'توازن مثالي بين السعر والجودة',
              description_en: 'Perfect balance of price and quality',
              popular: true
            },
            {
              label_ar: 'فاخر',
              label_en: 'Premium',
              min: 30000,
              max: 50000,
              icon: '👑',
              description_ar: 'تجربة فاخرة ومميزة',
              description_en: 'Luxury premium experience'
            },
            {
              label_ar: 'الكل',
              label_en: 'All',
              min: 0,
              max: 999999,
              icon: '✨',
              description_ar: 'عرض جميع الخيارات المتاحة',
              description_en: 'Show all available options'
            }
          ]
        }
      }
    }
    
    // Budget selected but no hotel selected - show hotels widget
    if (meta.budget && !meta.selectedHotel && meta.step !== 'hotel_selected') {
      const dest = meta.lastDest
      const chunks = ragService.getDestinationInfo(dest, 'hotels', lang)
      
      if (chunks.length > 0 && chunks[0].metadata?.hotels) {
        const hotels = chunks[0].metadata.hotels
        const budgetMin = typeof meta.budget === 'object' ? meta.budget.min : 0
        const budgetMax = typeof meta.budget === 'object' ? meta.budget.max : 999999
        
        const suitable = hotels.filter((h: any) => {
          const price = h.prices_egp?.double || h.price_egp || 0
          return price >= budgetMin && price <= budgetMax
        }).slice(0, 10)
        
        if (suitable.length > 0) {
          return {
            type: 'hotelCards',
            message: lang === 'ar' ? 'وجدت لك فنادق رائعة! 🏨 اختر ما يناسبك:' : 'Found great hotels! 🏨 Choose what suits you:',
            widget: {
              type: 'hotelCards',
              hotels: suitable.map((h: any) => ({
                hotel_id: h.hotel_id,
                hotel_name_ar: h.hotel_name_ar || h.hotel_name,
                hotel_name_en: h.hotel_name_en || h.hotel_name,
                priceEGP: h.prices_egp?.double || h.price_egp || 0,
                priceUSD: Math.round((h.prices_egp?.double || h.price_egp || 0) / 50),
                rating: h.stars || h.rating || 4,
                amenities: h.amenities || [],
                area_ar: h.area_ar || h.area,
                area_en: h.area_en || h.area,
                description_ar: h.description_ar,
                description_en: h.description_en,
                image: h.image
              }))
            }
          }
        }
      }
    }
    
    // Hotel selected but no meal plan
    if (meta.selectedHotel && !meta.mealPlan && (meta.step === 'hotel_selected' || meta.previousStep === 'hotel_selected')) {
      return {
        type: 'mealPlan',
        message: lang === 'ar' ? 'اختيار موفق! 🌟 اختر نظام الوجبات:' : 'Great choice! 🌟 Select meal plan:',
        widget: {
          type: 'mealPlans',
          title_ar: 'نظام الوجبات',
          title_en: 'Meal Plan',
          options: [
            {
              value: 'BB',
              label_ar: 'إفطار فقط',
              label_en: 'Breakfast Only',
              icon: '🍳',
              description_ar: 'وجبة الإفطار يومياً',
              description_en: 'Daily breakfast included'
            },
            {
              value: 'HB',
              label_ar: 'نصف إقامة',
              label_en: 'Half Board',
              icon: '🍽️',
              description_ar: 'إفطار وعشاء',
              description_en: 'Breakfast and dinner'
            },
            {
              value: 'FB',
              label_ar: 'إقامة كاملة',
              label_en: 'Full Board',
              icon: '🍴',
              description_ar: 'جميع الوجبات',
              description_en: 'All meals included'
            },
            {
              value: 'AI',
              label_ar: 'شامل كلياً',
              label_en: 'All Inclusive',
              icon: '🎉',
              description_ar: 'وجبات ومشروبات وأنشطة',
              description_en: 'Meals, drinks and activities'
            }
          ]
        }
      }
    }
    
    // Meal plan selected but no room type
    if (meta.mealPlan && !meta.roomType && (meta.step === 'meal_selected' || meta.previousStep === 'meal_selected')) {
      return {
        type: 'roomTypes',
        message: lang === 'ar' 
          ? `ممتاز! اخترت ${this.getMealPlanName(meta.mealPlan, lang)} 🛏️ الآن اختر نوع الغرفة:`
          : `Excellent! You chose ${this.getMealPlanName(meta.mealPlan, lang)} 🛏️ Now select room type:`,
        widget: {
          type: 'roomTypes',
          title_ar: 'نوع الغرفة',
          title_en: 'Room Type',
          options: [
            {
              value: 'single',
              label_ar: 'غرفة فردية',
              label_en: 'Single Room',
              icon: '🛏️',
              capacity: 1
            },
            {
              value: 'double',
              label_ar: 'غرفة مزدوجة',
              label_en: 'Double Room',
              icon: '🛏️🛏️',
              capacity: 2
            },
            {
              value: 'triple',
              label_ar: 'غرفة ثلاثية',
              label_en: 'Triple Room',
              icon: '👨‍👩‍👦',
              capacity: 3
            },
            {
              value: 'family',
              label_ar: 'غرفة عائلية',
              label_en: 'Family Room',
              icon: '👨‍👩‍👧‍👦',
              capacity: 4
            }
          ]
        }
      }
    }

    // Room type selected - Show booking summary directly (skip contact info)
    if (meta.roomType && meta.step === 'room_selected') {
      const dest = meta.lastDest || 'unknown'
      const hotelName = meta.selectedHotel || 'Hotel'
      console.log('📋 Showing booking summary')
      console.log('   Customer data from meta:', { 
        name: meta.customerName, 
        phone: meta.customerPhone, 
        email: meta.customerEmail 
      })
      console.log('   Full meta object:', meta)
      
      return {
        type: 'bookingSummary',
        message: lang === 'ar' 
          ? '🎉 رائع! إليك ملخص حجزك:'
          : '🎉 Perfect! Here\'s your booking summary:',
        widget: {
          type: 'bookingSummary',
          title_ar: 'ملخص الحجز',
          title_en: 'Booking Summary',
          data: {
            destination: dest,
            hotel: hotelName,
            mealPlan: this.getMealPlanName(meta.mealPlan, lang),
            roomType: this.getRoomTypeName(meta.roomType, lang),
            travelers: meta.pax || 1,
            startDate: meta.startDate,
            endDate: meta.endDate,
            budget: meta.budget,
            customerName: meta.customerName,
            customerPhone: meta.customerPhone,
            customerEmail: meta.customerEmail
          },
          actions: [
            {
              text_ar: '✅ تأكيد الحجز',
              text_en: '✅ Confirm Booking',
              value: 'confirm_booking',
              variant: 'primary'
            },
            {
              text_ar: '✏️ تعديل الحجز',
              text_en: '✏️ Modify Booking',
              value: 'modify_booking'
            }
          ]
        }
      }
    }
    
    return null
  }

  // Get predefined response for simple actions (to save API quota)
  private getPredefinedResponse(step: string, lang: Language, meta: any): string | null {
    const responses: Record<string, { ar: string; en: string }> = {
      'destination_selected': {
        ar: `اختيار رائع! 🎉 متى تفضل السفر؟`,
        en: `Great choice! 🎉 When would you like to travel?`
      },
      'dates_selected': {
        ar: `ممتاز! 👥 كم شخص سيسافر؟`,
        en: `Excellent! 👥 How many people will be traveling?`
      },
      'travelers_selected': {
        ar: `تمام! 💰 اختر الميزانية المناسبة:`,
        en: `Perfect! 💰 Choose your budget range:`
      },
      'budget_selected': {
        ar: `ممتاز! 🏨 إليك أفضل الفنادق المتاحة:`,
        en: `Excellent! 🏨 Here are the best available hotels:`
      },
      'hotel_selected': {
        ar: `اختيار موفق! 🌟 اختر نظام الوجبات:`,
        en: `Great choice! 🌟 Select meal plan:`
      },
      'meal_selected': {
        ar: `ممتاز! 🛏️ اختر نوع الغرفة:`,
        en: `Excellent! 🛏️ Select room type:`
      },
      'room_selected': {
        ar: `رائع! 🎊 إليك ملخص حجزك:`,
        en: `Perfect! 🎊 Here's your booking summary:`
      }
    }
    
    return responses[step]?.[lang] || null
  }

  // Generate smart UI based on AI response AND conversation state
  private async generateSmartUI(
    aiResponse: string,
    userMessage: string,
    lang: Language,
    meta: any,
    contextData: any,
    userId: string,
    isDetectedAction: boolean = false
  ): Promise<ChatResponse['ui'] | undefined> {
    const blocks: any[] = []
    
    // Get typography config
    const typography = this.getTypographyConfig(lang)
    
    // ALWAYS add AI response as text block first with typography
    blocks.push({
      type: 'text',
      text: aiResponse,
      typography: {
        fontFamily: typography.fontFamily,
        size: typography.sizes.base,
        weight: typography.weights.normal,
        lineHeight: typography.lineHeights.relaxed
      },
      animated: true,
      timestamp: new Date().toISOString()
    })
    
    const step = meta.step || 'initial'
    const previousStep = meta.previousStep
    
    console.log(`🎯 generateSmartUI called - step: ${step}, userMessage: ${userMessage}`)
    
    // ✅ Detect if message is a button action (not free text)
    const isButtonAction = userMessage.startsWith('dest:') || 
                           userMessage.startsWith('hotel:') || 
                           userMessage.startsWith('meal:') || 
                           userMessage.startsWith('room:') || 
                           userMessage.startsWith('budget:') || 
                           userMessage.startsWith('set_dates:') || 
                           userMessage.startsWith('set_pax:') ||
                           userMessage.startsWith('contact_info:') ||
                           userMessage.startsWith('ask_') ||
                           userMessage.startsWith('filter:') ||
                           userMessage === 'contact_support'
    
    const isNewStep = previousStep !== step
    
    console.log(`🔍 isButtonAction: ${isButtonAction}, isDetectedAction: ${isDetectedAction}, step: ${step}`)
    
    // ✅ Don't show widgets for free text messages (except initial or detected actions)
    if (!isButtonAction && !isDetectedAction && step !== 'initial') {
      console.log(`💬 Free text message - AI response only`)
      return { blocks: [blocks[0]] }
    }
    
    console.log(`🎯 Showing widget for step: ${step} (button: ${isButtonAction}, detected: ${isDetectedAction}, newStep: ${isNewStep})`)

    // ===== Show widget for current step =====

    // 1️⃣ Destinations Grid - Enhanced with categories
    if (step === 'initial') {
      const destinations = ragService.destinations().filter(d => d && d !== 'unknown')
      if (destinations.length > 0) {
        const international = destinations.filter(d => ['bali', 'istanbul', 'beirut'].includes(d))
        const local = destinations.filter(d => !['bali', 'istanbul', 'beirut'].includes(d))
        
        blocks.push({
          type: 'destinations',
          title: lang === 'ar' ? 'اختر وجهتك' : 'Choose your destination',
          categories: [
            {
              title: lang === 'ar' ? '🌍 وجهات دولية' : '🌍 International',
              destinations: international.map(d => ({
                id: d,
                name: this.getDestinationNameAr(d),
                name_en: this.getDestinationNameEn(d),
                emoji: this.getDestinationEmoji(d),
                image: `/images/destinations/${d}.jpg`
              }))
            },
            {
              title: lang === 'ar' ? '🏖️ وجهات محلية' : '🏖️ Local',
              destinations: local.map(d => ({
                id: d,
                name: this.getDestinationNameAr(d),
                name_en: this.getDestinationNameEn(d),
                emoji: this.getDestinationEmoji(d),
                image: `/images/destinations/${d}.jpg`
              }))
            }
          ]
        })
      }
      return { blocks }
    }

    // 2️⃣ Date Range Picker - Enhanced
    if (step === 'destination_selected') {
      const today = new Date()
      const maxDate = new Date()
      maxDate.setMonth(maxDate.getMonth() + 6)
      
      blocks.push({
        type: 'dateRange',
        heading: lang === 'ar' ? 'اختر التواريخ:' : 'Select dates:',
        label_ar: 'تواريخ السفر',
        label_en: 'Travel dates',
        minDate: today.toISOString().split('T')[0],
        maxDate: maxDate.toISOString().split('T')[0],
        nights: 5
      })
      return { blocks }
    }

    // 3️⃣ Travelers Selector - Enhanced with options
    if (step === 'dates_selected') {
      blocks.push({
        type: 'travellers',
        heading: lang === 'ar' ? 'عدد المسافرين:' : 'Number of travelers:',
        label_ar: 'عدد المسافرين',
        label_en: 'Number of travelers',
        min: 1,
        max: 10,
        default: 2,
        options: [
          { value: 1, label_ar: 'شخص واحد', label_en: '1 Person', icon: '👤' },
          { value: 2, label_ar: 'شخصين', label_en: '2 People', icon: '👥' },
          { value: 3, label_ar: '3 أشخاص', label_en: '3 People', icon: '👨‍👩‍👦' },
          { value: 4, label_ar: '4 أشخاص', label_en: '4 People', icon: '👨‍👩‍👧‍👦' },
          { value: 5, label_ar: '5+ أشخاص', label_en: '5+ People', icon: '👨‍👩‍👧‍👦+' }
        ]
      })
      return { blocks }
    }

    // 4️⃣ Budget Selector - Enhanced with descriptions
    if (step === 'travelers_selected') {
      console.log('🎯 Showing Budget Widget for travelers_selected step')
      blocks.push({
        type: 'budget',
        title_ar: '💰 اختر ميزانيتك للشخص الواحد',
        title_en: '💰 Choose Your Budget',
        ranges: [
          { 
            label_ar: '🌟 اقتصادي', 
            label_en: '🌟 Budget Friendly',
            min: 0, 
            max: 15000, 
            icon: '💰',
            description_ar: 'فنادق 3 نجوم - حتى 15,000 ج.م',
            description_en: '3-star hotels - Up to 15,000 EGP'
          },
          { 
            label_ar: '💎 متوسط', 
            label_en: '💎 Standard',
            min: 15000, 
            max: 30000, 
            icon: '💎',
            description_ar: 'فنادق 4 نجوم - 15,000-30,000 ج.م',
            description_en: '4-star hotels - 15,000-30,000 EGP',
            popular: true
          },
          { 
            label_ar: '👑 فاخر', 
            label_en: '👑 Luxury',
            min: 30000, 
            max: 999999, 
            icon: '👑',
            description_ar: 'فنادق 5 نجوم - أكثر من 30,000 ج.م',
            description_en: '5-star hotels - Above 30,000 EGP'
          },
          {
            label_ar: '🔍 كل الفنادق',
            label_en: '🔍 All Hotels',
            min: 0,
            max: 999999,
            icon: '🔍',
            description_ar: 'عرض جميع الخيارات المتاحة',
            description_en: 'Show all available options'
          }
        ]
      })
      console.log('✅ Budget Widget added to blocks')
      return { blocks }
    }

    // 5️⃣ Hotel Cards - Enhanced with full details and images
    if (step === 'budget_selected' || step === 'ready_for_offers') {
      const dest = meta.lastDest
      const destChunks = ragService.getDestinationInfo(dest, 'hotels', lang)
      
      if (destChunks.length > 0 && destChunks[0].metadata?.hotels) {
        const budgetValue = meta.budget
        let minPriceEGP = 0
        let maxPriceEGP = 999999
        
        // Parse budget from "min-max" format
        if (typeof budgetValue === 'string' && budgetValue.includes('-')) {
          const [min, max] = budgetValue.split('-').map(Number)
          minPriceEGP = min
          maxPriceEGP = max
        }
        
        const allHotels = destChunks[0].metadata.hotels
        const filtered = allHotels
          .filter((h: any) => {
            const priceEGP = h.prices_egp?.double || h.price_egp || 0
            return priceEGP >= minPriceEGP && priceEGP <= maxPriceEGP
          })
          .sort((a: any, b: any) => {
            const priceA = a.prices_egp?.double || a.price_egp || 0
            const priceB = b.prices_egp?.double || b.price_egp || 0
            return priceA - priceB
          })
        
        const displayHotels = filtered.slice(0, 3)  // ✅ Show only 3 hotels
        const hasMore = filtered.length > 3
        
        if (displayHotels.length > 0) {
          // Add section header
          blocks.push({
            type: 'sectionHeader',
            icon: '🏨',
            title_ar: 'الفنادق المتاحة',
            title_en: 'Available Hotels',
            subtitle_ar: `${filtered.length} ${filtered.length === 1 ? 'فندق' : 'فنادق'}`,
            subtitle_en: `${filtered.length} ${filtered.length === 1 ? 'hotel' : 'hotels'}`
          })

          blocks.push({
            type: 'hotelCards',
            layout: 'grid',
            responsive: {
              mobile: { layout: 'carousel', showCount: 1 },
              tablet: { layout: 'grid', columns: 2 },
              desktop: { layout: 'grid', columns: 3 }
            },
            hotels: displayHotels.map((h: any) => {
              const hotelId = h.hotel_name_en || h.hotel_name_ar || 'Hotel'
              
              // ✅ Use Unsplash mock images if hotel image not available
              const mockImageUrl = `https://source.unsplash.com/800x600/?hotel,resort,${dest},luxury`
              
              return {
                hotel_id: hotelId,
                hotel_name_ar: h.hotel_name_ar || h.hotel_name_en || 'فندق',
                hotel_name_en: h.hotel_name_en || h.hotel_name_ar || 'Hotel',
                priceEGP: h.price_egp || 0,
                priceUSD: h.price_usd_reference || Math.round((h.price_egp || 0) / 50),
                rating: h.stars || h.rating || 4,
                amenities: h.amenities || ['WiFi', 'Pool', 'Breakfast'],
                description_ar: h.description_ar || 'فندق رائع مع إطلالة مميزة',
                description_en: h.description_en || 'Amazing hotel with great views',
                image: h.image || mockImageUrl,
                area_ar: h.area_ar || h.area || this.getDestinationNameAr(dest),
                area_en: h.area_en || h.area || this.getDestinationNameEn(dest),
                cta: {
                  text_ar: 'اختر هذا الفندق',
                  text_en: 'Select Hotel',
                  variant: 'primary'
                },
                lazy: true
              }
            })
          })

          // Add "Show More" button if there are more hotels
          if (hasMore) {
            blocks.push({
              type: 'button',
              text_ar: `عرض ${filtered.length - 3} ${filtered.length - 3 === 1 ? 'فندق آخر' : 'فنادق أخرى'}`,
              text_en: `Show ${filtered.length - 3} more ${filtered.length - 3 === 1 ? 'hotel' : 'hotels'}`,
              value: 'show_more_hotels',
              variant: 'outline',
              icon: '👇'
            })
          }
          
          console.log(`✅ Showing ${displayHotels.length} of ${filtered.length} hotels`)
        } else {
          // ✅ Empty state when no hotels available
          blocks.push({
            type: 'empty',
            icon: '😔',
            title_ar: 'لا توجد فنادق متاحة',
            title_en: 'No Hotels Available',
            description_ar: 'لم نجد فنادق تناسب ميزانيتك في هذه الوجهة. جرب تعديل الميزانية؟',
            description_en: 'No hotels match your budget for this destination. Try adjusting your budget?',
            actions: [
              { text_ar: '💰 تعديل الميزانية', text_en: '💰 Adjust Budget', value: 'back_to_budget' },
              { text_ar: '🔍 عرض كل الفنادق', text_en: '🔍 Show All Hotels', value: 'budget:0-999999' }
            ]
          })
        }
      }
      return { blocks }
    }

    // 6️⃣ Hotel Selected - Show meal plans
    if (step === 'hotel_selected') {
      console.log('✅ Showing meal plan options for hotel_selected step')
      blocks.push({
        type: 'mealPlans',
        title_ar: 'اختر نظام الوجبات:',
        title_en: 'Choose meal plan:',
        options: [
          { 
            value: 'room_only', 
            label_ar: 'غرفة فقط', 
            label_en: 'Room Only',
            icon: '🛏️',
            description_ar: 'بدون وجبات',
            description_en: 'No meals included'
          },
          { 
            value: 'breakfast', 
            label_ar: 'مع الإفطار', 
            label_en: 'Breakfast',
            icon: '☕',
            description_ar: 'إفطار يومي',
            description_en: 'Daily breakfast'
          },
          { 
            value: 'half_board', 
            label_ar: 'نصف إقامة', 
            label_en: 'Half Board',
            icon: '🍽️',
            description_ar: 'إفطار + عشاء',
            description_en: 'Breakfast + Dinner'
          },
          { 
            value: 'full_board', 
            label_ar: 'إقامة كاملة', 
            label_en: 'Full Board',
            icon: '🍱',
            description_ar: 'جميع الوجبات',
            description_en: 'All meals'
          },
          { 
            value: 'all_inclusive', 
            label_ar: 'شامل كليًا', 
            label_en: 'All Inclusive',
            icon: '🌟',
            description_ar: 'كل شيء مشمول',
            description_en: 'Everything included'
          }
        ]
      })
      return { blocks }
    }

    // 7️⃣ After meal plan - Show room types
    if (step === 'meal_selected') {
      blocks.push({
        type: 'roomTypes',
        title_ar: 'اختر نوع الغرفة:',
        title_en: 'Choose room type:',
        options: [
          { 
            value: 'single', 
            label_ar: 'غرفة مفردة', 
            label_en: 'Single Room',
            icon: '👤',
            capacity: 1,
            description_ar: 'سرير مفرد',
            description_en: 'One bed'
          },
          { 
            value: 'double', 
            label_ar: 'غرفة مزدوجة', 
            label_en: 'Double Room',
            icon: '👥',
            capacity: 2,
            description_ar: 'سرير مزدوج',
            description_en: 'Double bed'
          },
          { 
            value: 'twin', 
            label_ar: 'غرفة توأم', 
            label_en: 'Twin Room',
            icon: '🛏️🛏️',
            capacity: 2,
            description_ar: 'سريرين منفصلين',
            description_en: 'Two separate beds'
          },
          { 
            value: 'triple', 
            label_ar: 'غرفة ثلاثية', 
            label_en: 'Triple Room',
            icon: '👨‍👩‍👦',
            capacity: 3,
            description_ar: '3 أسرة',
            description_en: '3 beds'
          },
          { 
            value: 'family', 
            label_ar: 'غرفة عائلية', 
            label_en: 'Family Room',
            icon: '👨‍👩‍👧‍👦',
            capacity: 4,
            description_ar: 'مناسبة للعائلات',
            description_en: 'Perfect for families'
          }
        ]
      })
      return { blocks }
    }

    // 8️⃣ After room type - Show booking summary directly (customer info already collected at start)
    if (step === 'room_selected') {
      console.log('📋 Room selected - showing booking summary')
      const dest = meta.lastDest || 'unknown'
      const hotelName = meta.selectedHotel || 'Hotel'
      const mealPlan = this.getMealPlanName(meta.mealPlan || '', lang)
      const roomType = this.getRoomTypeName(meta.roomType || '', lang)
      
      blocks.push({
        type: 'bookingSummary',
        title_ar: 'ملخص الحجز',
        title_en: 'Booking Summary',
        data: {
          destination: dest,
          hotel: hotelName,
          mealPlan: mealPlan,
          roomType: roomType,
          travelers: meta.pax,
          startDate: meta.startDate,
          endDate: meta.endDate,
          budget: meta.budget,
          customerName: meta.customerName,
          customerPhone: meta.customerPhone,
          customerEmail: meta.customerEmail
        },
        actions: [
          { text_ar: '✅ تأكيد الحجز', text_en: '✅ Confirm Booking', value: 'confirm_booking', variant: 'primary' }
        ]
      })
      return { blocks }
    }

    // 9️⃣ Quick Replies - للأسئلة العامة
    if (step === 'general_inquiry' || userMessage.toLowerCase().includes('محتاج مساعدة') || userMessage.toLowerCase().includes('need help')) {
      blocks.push({
        type: 'quickReplies',
        title_ar: 'كيف يمكنني مساعدتك؟',
        title_en: 'How can I help you?',
        options: [
          { label_ar: 'معلومات عن الفنادق', label_en: 'Hotel Information', value: 'ask_hotels', emoji: '🏨' },
          { label_ar: 'الجولات السياحية', label_en: 'Tours & Activities', value: 'ask_tours', emoji: '🎯' },
          { label_ar: 'التأشيرات', label_en: 'Visa Information', value: 'ask_visa', emoji: '📋' },
          { label_ar: 'الأسعار والعروض', label_en: 'Prices & Offers', value: 'ask_prices', emoji: '💰' },
          { label_ar: 'تكلم مع موظف', label_en: 'Talk to Agent', value: 'contact_support', emoji: '👤' }
        ]
      })
      return { blocks }
    }

    // 🔟 Hotel Filters - عند عرض الفنادق
    if ((step === 'budget_selected' || step === 'ready_for_offers') && meta.lastDest) {
      const destChunks = ragService.getDestinationInfo(meta.lastDest, 'hotels', lang)
      
      if (destChunks.length > 0 && destChunks[0].metadata?.hotels) {
        // Extract unique areas from hotels
        const hotels = destChunks[0].metadata.hotels
        const uniqueAreas = [...new Set(hotels.map((h: any) => h.area).filter(Boolean))]
        
        blocks.push({
          type: 'hotelFilters',
          title_ar: 'تصفية النتائج:',
          title_en: 'Filter Results:',
          filters: {
            stars: [
              { value: 3, label: '⭐⭐⭐' },
              { value: 4, label: '⭐⭐⭐⭐' },
              { value: 5, label: '⭐⭐⭐⭐⭐' }
            ],
            mealPlans: [
              { value: 'breakfast', label_ar: 'إفطار فقط', label_en: 'Breakfast Only' },
              { value: 'half_board', label_ar: 'نصف إقامة', label_en: 'Half Board' },
              { value: 'all_inclusive', label_ar: 'شامل كليًا', label_en: 'All Inclusive' }
            ],
            areas: uniqueAreas.slice(0, 5).map((area: string) => ({
              value: area.toLowerCase(),
              label_ar: area,
              label_en: area
            }))
          }
        })
      }
    }

    // Default: only text, no widgets
    return { blocks: [blocks[0]] }
  }

  private getTypographyConfig(lang: Language) {
    return {
      fontFamily: lang === 'ar' 
        ? "'Cairo', 'Tajawal', 'IBM Plex Sans Arabic', -apple-system, sans-serif"
        : "'Inter', 'Roboto', -apple-system, system-ui, sans-serif",
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem'
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    }
  }

  private getProgressForStep(step: string): { current: number; total: number; steps: any[] } {
    const stepMap: Record<string, number> = {
      'initial': 0,
      'destination_selected': 1,
      'dates_selected': 2,
      'travelers_selected': 3,
      'budget_selected': 4,
      'hotel_selected': 5,
      'meal_selected': 6,
      'room_selected': 7
    }

    return {
      current: stepMap[step] || 0,
      total: 7,
      steps: [
        { key: 'destination', label_ar: 'الوجهة', label_en: 'Destination', icon: '🌍' },
        { key: 'dates', label_ar: 'التواريخ', label_en: 'Dates', icon: '📅' },
        { key: 'travelers', label_ar: 'المسافرون', label_en: 'Travelers', icon: '👥' },
        { key: 'budget', label_ar: 'الميزانية', label_en: 'Budget', icon: '💰' },
        { key: 'hotel', label_ar: 'الفندق', label_en: 'Hotel', icon: '🏨' },
        { key: 'meal', label_ar: 'الوجبات', label_en: 'Meals', icon: '🍽️' },
        { key: 'room', label_ar: 'الغرفة', label_en: 'Room', icon: '🛏️' }
      ]
    }
  }

  private getDestinationNameAr(dest: string): string {
    const names: Record<string, string> = {
      bali: 'بالي',
      istanbul: 'إسطنبول',
      beirut: 'بيروت',
      sharm_el_sheikh: 'شرم الشيخ',
      hurghada: 'الغردقة',
      dahab: 'دهب',
      ain_sokhna: 'العين السخنة',
      sahl_hashish: 'صحل حشيش'
    }
    return names[dest] || dest
  }

  private getDestinationNameEn(dest: string): string {
    const names: Record<string, string> = {
      bali: 'Bali',
      istanbul: 'Istanbul',
      beirut: 'Beirut',
      sharm_el_sheikh: 'Sharm El Sheikh',
      hurghada: 'Hurghada',
      dahab: 'Dahab',
      ain_sokhna: 'Ain Sokhna',
      sahl_hashish: 'Sahl Hasheesh'
    }
    return names[dest] || dest
  }

  private getDestinationEmoji(dest: string): string {
    const emojis: Record<string, string> = {
      bali: '🌴',
      istanbul: '🕌',
      beirut: '🇱🇧',
      sharm_el_sheikh: '🌊',
      hurghada: '🏝️',
      dahab: '🏔️',
      ain_sokhna: '🌅',
      sahl_hashish: '🏖️'
    }
    return emojis[dest] || '🌍'
  }

  // Execute function calls from AI
  private async executeFunctionCall(
    functionCall: { name: string; args: Record<string, any> },
    lang: Language,
    userId: string
  ): Promise<{ text: string; ui?: ChatResponse['ui'] }> {
    const { name, args } = functionCall

    switch (name) {
      case 'get_destination_info': {
        const chunks = ragService.getDestinationInfo(args.destination, args.info_type, lang)
        
        if (chunks.length === 0) {
          return { 
            text: lang === 'ar' ? 'عذراً، لا توجد معلومات متاحة حالياً.' : 'Sorry, no information available right now.' 
          }
        }

        // Update user's last destination
        this.sessionManager.updateMeta(userId, { lastDest: args.destination })

        let text = ''
        if (args.info_type === 'hotels' && chunks[0].metadata?.hotels) {
          text = PromptService.formatHotels(chunks[0].metadata.hotels, lang)
        } else if (args.info_type === 'tours' && chunks[0].metadata?.tours) {
          text = PromptService.formatTours(chunks[0].metadata.tours, lang)
        } else {
          text = chunks.map(c => `**${c.section}**\n${c.text}`).join('\n\n')
        }

        const ui = await this.generateSmartUI(text, `show ${args.info_type}`, lang, { lastDest: args.destination }, {}, userId)
        return { text, ui }
      }

      case 'search_hotels': {
        const hotels = ragService.searchHotels(args.destination, {
          minRating: args.min_rating,
          maxPrice: args.max_price
        })
        
        if (hotels.length === 0) {
          return { text: lang === 'ar' ? 'لا توجد فنادق تطابق معاييرك.' : 'No hotels match your criteria.' }
        }

        const text = PromptService.formatHotels(hotels, lang)
        return { text }
      }

      case 'get_tour_details': {
        const offer = ragService.getOfferByDestination(args.destination)
        const tours = offer?.optional_tours || []
        
        if (tours.length === 0) {
          return { text: lang === 'ar' ? 'لا توجد جولات متاحة.' : 'No tours available.' }
        }

        const text = PromptService.formatTours(tours, lang)
        return { text }
      }

      case 'calculate_quote': {
        const offer = ragService.getOfferByDestination(args.destination)
        const hotel = offer?.hotels?.find((h: any) => 
          h.hotel_name?.toLowerCase().includes(args.hotel_name?.toLowerCase())
        )
        
        if (!hotel) {
          return { text: lang === 'ar' ? 'الفندق غير موجود.' : 'Hotel not found.' }
        }

        const pricePerPerson = hotel.price_usd || hotel.price_double_triple_usd || 0
        const nights = args.num_nights || 5
        const total = pricePerPerson * args.num_travelers
        
        const text = lang === 'ar'
          ? `💰 **عرض السعر التقريبي:**\n\n🏨 الفندق: ${hotel.hotel_name} ${hotel.rating}\n🌙 المدة: ${nights} ليالٍ\n👥 عدد المسافرين: ${args.num_travelers}\n💵 السعر للشخص: $${pricePerPerson}\n💳 **الإجمالي: $${total}**\n\n📌 السعر يشمل: الإقامة + الإفطار + المواصلات\n⚠️ السعر لا يشمل: تذاكر الطيران والتأشيرة\n\n📞 للحجز، تواصل معنا الآن!`
          : `💰 **Estimated Quote:**\n\n🏨 Hotel: ${hotel.hotel_name} ${hotel.rating}\n🌙 Duration: ${nights} nights\n👥 Travelers: ${args.num_travelers}\n💵 Price per person: $${pricePerPerson}\n💳 **Total: $${total}**\n\n📌 Includes: Accommodation + Breakfast + Transfers\n⚠️ Excludes: Flight tickets and visa\n\n📞 Contact us now to book!`
        
        return { 
          text,
          ui: {
            blocks: [{
              type: 'buttons',
              text: lang === 'ar' ? 'الخطوة التالية:' : 'Next step:',
              buttons: [
                { text: lang === 'ar' ? '📞 احجز الآن' : '📞 Book Now', value: 'contact_support' },
                { text: lang === 'ar' ? '🏨 فنادق أخرى' : '🏨 Other Hotels', value: 'ask_hotels' }
              ]
            }]
          }
        }
      }

      default:
        return { text: lang === 'ar' ? 'وظيفة غير معروفة.' : 'Unknown function.' }
    }
  }

  // Streaming handler
  async handleStreamingChat(req: Request, res: Response): Promise<void> {
    const { message, userId = 'default-user', lang = 'en' }: ChatRequest = req.body || {}

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    })

    try {
      const history = this.sessionManager.getSession(userId)
      const meta = this.sessionManager.getMeta(userId)
      
      // Build context
      const enrichedContext = await this.buildEnrichedContext(message, lang as Language, meta, {})
      const messages = this.geminiService.buildMessages(message, history, lang as Language, enrichedContext)

      // Stream response
      const stream = await this.geminiService.sendStreamingRequest(messages, lang as Language, true)

      let fullText = ''
      for await (const chunk of stream) {
        if (chunk.done) {
          res.write('data: [DONE]\n\n')
          break
        }

        if (chunk.text) {
          fullText += chunk.text
          res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk.text } }] })}\n\n`)
        }

        if (chunk.functionCall) {
          const result = await this.executeFunctionCall(chunk.functionCall, lang as Language, userId)
          res.write(`data: ${JSON.stringify({ choices: [{ message: { content: result.text } }] })}\n\n`)
          res.write('data: [DONE]\n\n')
          fullText = result.text
          break
        }
      }

      this.sessionManager.addMessage(userId, { role: 'user', content: message })
      this.sessionManager.addMessage(userId, { role: 'assistant', content: fullText })

      res.end()
    } catch (error) {
      console.error('Streaming error:', error)
      try {
        res.write(`data: ${JSON.stringify({ error: 'stream_error' })}\n\n`)
      } catch {}
      res.end()
    }
  }

  // Helper methods
  private getTopicNameAr(topic: string): string {
    const map: Record<string, string> = {
      hotels: 'الفنادق',
      tours: 'الجولات السياحية',
      visa: 'التأشيرة',
      includes: 'ما يشمله العرض',
      excludes: 'ما لا يشمله العرض'
    }
    return map[topic] || topic
  }

  // Get meal plan display name
  private getMealPlanName(value: string, lang: Language): string {
    const names: Record<string, { ar: string; en: string }> = {
      'room_only': { ar: 'غرفة فقط (بدون وجبات)', en: 'Room Only' },
      'breakfast': { ar: 'مع الإفطار', en: 'Breakfast' },
      'BB': { ar: 'إفطار فقط', en: 'Breakfast Only' },
      'half_board': { ar: 'نصف إقامة (إفطار + عشاء)', en: 'Half Board' },
      'HB': { ar: 'نصف إقامة', en: 'Half Board' },
      'full_board': { ar: 'إقامة كاملة (جميع الوجبات)', en: 'Full Board' },
      'FB': { ar: 'إقامة كاملة', en: 'Full Board' },
      'all_inclusive': { ar: 'شامل كلياً (وجبات + مشروبات + أنشطة)', en: 'All Inclusive' },
      'AI': { ar: 'شامل كلياً', en: 'All Inclusive' }
    }
    return names[value]?.[lang] || value
  }

  // Get room type display name
  private getRoomTypeName(value: string, lang: Language): string {
    const names: Record<string, { ar: string; en: string }> = {
      'single': { ar: 'غرفة فردية', en: 'Single Room' },
      'double': { ar: 'غرفة مزدوجة', en: 'Double Room' },
      'twin': { ar: 'غرفة توأم', en: 'Twin Room' },
      'triple': { ar: 'غرفة ثلاثية', en: 'Triple Room' },
      'family': { ar: 'غرفة عائلية', en: 'Family Room' },
      'suite': { ar: 'جناح', en: 'Suite' }
    }
    return names[value]?.[lang] || value
  }

  // ✨ NEW: Detect destination from natural language text
  private detectDestinationFromText(message: string, lang: Language): string | null {
    const lower = message.toLowerCase()
    
    // Check each destination with multiple variations (English + Arabic + common typos + phrases)
    // Bali
    if (/bali|بالي|باالي|balli/.test(lower)) return 'bali'
    
    // Istanbul
    if (/istanbul|إسطنبول|اسطنبول|instanbul|turkey|تركيا|تركي/.test(lower)) return 'istanbul'
    
    // Beirut
    if (/beirut|بيروت|beyrut|lebanon|لبنان/.test(lower)) return 'beirut'
    
    // Sharm El Sheikh
    if (/sharm|شرم/.test(lower)) return 'sharm_el_sheikh'
    
    // Hurghada
    if (/hurghada|الغردقة|غردقة|hurgada/.test(lower)) return 'hurghada'
    
    // Dahab
    if (/dahab|دهب|dhab/.test(lower)) return 'dahab'
    
    // Ain Sokhna
    if (/ain sokhna|العين السخنة|sokhna|سخنة|ain sukhna/.test(lower)) return 'ain_sokhna'
    
    // Sahl Hasheesh
    if (/sahl|hasheesh|hashish|صحل|حشيش/.test(lower)) return 'sahl_hashish'
    
    return null
  }
}
