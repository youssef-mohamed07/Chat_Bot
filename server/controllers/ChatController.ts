import type { Request, Response } from 'express'
import type { ChatRequest, ChatResponse, Language } from '../types/index.js'
import { GeminiService } from '../services/GeminiService.js'
import { SessionManager } from '../services/SessionManager.js'
import { ragService } from '../services/RAGService.js'
import { PromptService } from '../services/PromptService.js'

export class ChatController {
  private geminiService: GeminiService
  private sessionManager: SessionManager

  constructor() {
    this.geminiService = new GeminiService()
    this.sessionManager = new SessionManager()
  }

  // Main chat handler - 100% AI-driven
  async handleChat(req: Request, res: Response): Promise<void> {
    try {
      const { message, userId = 'default-user', lang = 'en' }: ChatRequest = req.body
      
      if (!message || message.trim() === '') {
        res.status(400).json({ error: 'Message is required' })
        return
      }

      console.log(`\n📥 [${userId}] Message: "${message}" (${lang})`)

      const history = this.sessionManager.getSession(userId)
      const meta = this.sessionManager.getMeta(userId)

      // Special case: initialization
      if (message.trim() === '__init__') {
        await this.handleInit(res, lang as Language, userId)
        return
      }

      // Extract button actions data if present
      let userMessage = message
      let contextData: any = {}

      // Handle button clicks (extract data but still use AI)
      if (message.startsWith('dest:')) {
        const dest = message.replace('dest:', '').toLowerCase()
        contextData.selectedDestination = dest
        this.sessionManager.updateMeta(userId, { 
          lastDest: dest,
          step: 'destination_selected'
        })
        userMessage = lang === 'ar' 
          ? `اخترت ${dest === 'bali' ? 'بالي' : dest === 'istanbul' ? 'إسطنبول' : dest}`
          : `I chose ${dest}`
      } else if (message.startsWith('ask_')) {
        const topic = message.replace('ask_', '')
        const dest = meta.lastDest || 'bali'
        contextData.requestedTopic = topic
        contextData.destination = dest
        userMessage = lang === 'ar'
          ? `أريد معرفة ${this.getTopicNameAr(topic)} في ${dest === 'bali' ? 'بالي' : 'إسطنبول'}`
          : `I want to know about ${topic} in ${dest}`
      } else if (message.startsWith('set_dates:')) {
        const [, dates] = message.split(':')
        const [start, end] = dates.split('..')
        this.sessionManager.updateMeta(userId, { 
          startDate: start, 
          endDate: end,
          step: 'dates_selected'
        })
        userMessage = lang === 'ar'
          ? `اخترت السفر من ${start} إلى ${end}`
          : `I chose to travel from ${start} to ${end}`
      } else if (message.startsWith('set_pax:')) {
        const pax = parseInt(message.replace('set_pax:', ''), 10)
        this.sessionManager.updateMeta(userId, { 
          pax,
          step: 'travelers_selected'
        })
        userMessage = lang === 'ar'
          ? `عدد المسافرين ${pax} ${pax > 1 ? 'أشخاص' : 'شخص'}`
          : `Number of travelers is ${pax} ${pax > 1 ? 'people' : 'person'}`
      } else if (message.startsWith('budget:')) {
        const budget = parseInt(message.replace('budget:', ''), 10)
        this.sessionManager.updateMeta(userId, { 
          budget,
          step: 'budget_selected'
        })
        userMessage = lang === 'ar'
          ? `ميزانيتي حوالي ${budget} دولار للشخص`
          : `My budget is around $${budget} per person`
      } else if (message.startsWith('hotel:')) {
        // User selected a hotel - show detailed info
        const hotelName = message.replace('hotel:', '')
        contextData.selectedHotel = hotelName
        this.sessionManager.updateMeta(userId, { selectedHotel: hotelName })
        userMessage = lang === 'ar'
          ? `أريد معرفة المزيد عن فندق ${hotelName}`
          : `I want to know more about ${hotelName} hotel`
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

      // Get AI response with full context
      await this.handleAIChat(userMessage, userId, lang as Language, history, meta, contextData, res)

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
    const destList = destinations.map(d => d === 'bali' ? 'بالي (Bali)' : 'إسطنبول (Istanbul)').join(' و ')
    const contextMessage = lang === 'ar'
      ? `لدينا عروض سفر رائعة إلى: ${destList}. نقدم باقات شاملة تشمل الفنادق، الجولات السياحية، ومساعدة في التأشيرات.`
      : `We have amazing travel packages to: ${destList}. We offer complete packages including hotels, tours, and visa assistance.`

    const welcomePrompt = lang === 'ar'
      ? `أنت مساعد Quick Air الذكي. رحب بالعميل بحرارة واذكر الوجهات المتاحة بطريقة جذابة ومشوقة. ${contextMessage}`
      : `You are Quick Air's intelligent assistant. Welcome the customer warmly and mention available destinations in an attractive way. ${contextMessage}`

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
    res: Response
  ): Promise<void> {
    try {
      console.log('🤖 Processing with AI...')

      // Build rich context for AI
      const enrichedContext = await this.buildEnrichedContext(message, lang, meta, contextData)
      
      // Build messages with context
      const messages = this.geminiService.buildMessages(message, history, lang, enrichedContext)

      console.log('🚀 Calling Gemini API...')
      const result = await this.geminiService.sendChatRequest(messages, lang, true)
      
      console.log(' Got AI response:', result.text?.substring(0, 100))

      // Handle function call
      if (result.functionCall) {
        console.log('🔧 Function called:', result.functionCall.name)
        const functionResult = await this.executeFunctionCall(result.functionCall, lang, userId)
        
        this.sessionManager.addMessage(userId, { role: 'user', content: message })
        this.sessionManager.addMessage(userId, { role: 'assistant', content: functionResult.text })
        
        res.json({ reply: functionResult.text, ui: functionResult.ui })
        return
      }

      // Generate smart UI based on AI response and context
      const ui = await this.generateSmartUI(result.text, message, lang, meta, contextData, userId)
      
      this.sessionManager.addMessage(userId, { role: 'user', content: message })
      this.sessionManager.addMessage(userId, { role: 'assistant', content: result.text })
      
      res.json({ reply: result.text, ui })

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
                { text: lang === 'ar' ? '� الفنادق' : '� Hotels', value: 'ask_hotels' },
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

    // Add conversation flow instructions based on current step
    const step = meta.step || 'initial'
    const hasDestination = !!(meta.lastDest || meta.destination)
    const hasDates = !!(meta.startDate && meta.endDate)
    const hasTravelers = !!meta.pax
    const hasBudget = !!meta.budget

    // Guide AI based on what information we have
    if (!hasDestination) {
      contextParts.push(lang === 'ar'
        ? '🎯 الخطوة التالية: اسأل العميل عن الوجهة التي يريد السفر إليها (بالي أو إسطنبول)'
        : '🎯 Next step: Ask the client about their desired destination (Bali or Istanbul)')
    } else if (!hasDates) {
      contextParts.push(lang === 'ar'
        ? '🎯 الخطوة التالية: اسأل العميل عن تواريخ سفره (متى يريد السفر)'
        : '🎯 Next step: Ask the client about travel dates (when they want to travel)')
    } else if (!hasTravelers) {
      contextParts.push(lang === 'ar'
        ? '🎯 الخطوة التالية: اسأل العميل عن عدد المسافرين (كام واحد هيسافر)'
        : '🎯 Next step: Ask the client about number of travelers (how many people)')
    } else if (!hasBudget) {
      contextParts.push(lang === 'ar'
        ? '🎯 الخطوة التالية: اسأل العميل عن الميزانية التقريبية لكل شخص'
        : '🎯 Next step: Ask the client about approximate budget per person')
    } else {
      contextParts.push(lang === 'ar'
        ? ' لديك كل المعلومات! الآن اقترح 2-3 عروض مناسبة بناءً على اختياراته'
        : ' You have all info! Now suggest 2-3 suitable offers based on their choices')
    }

    // Add collected user preferences
    if (meta.lastDest || contextData.destination) {
      const dest = contextData.destination || meta.lastDest
      contextParts.push(lang === 'ar' 
        ? `📍 الوجهة: ${dest === 'bali' ? 'بالي' : 'إسطنبول'}`
        : `📍 Destination: ${dest}`)
    }

    if (meta.startDate && meta.endDate) {
      contextParts.push(lang === 'ar'
        ? `📅 التواريخ: من ${meta.startDate} إلى ${meta.endDate}`
        : `📅 Dates: from ${meta.startDate} to ${meta.endDate}`)
    }

    if (meta.pax) {
      contextParts.push(lang === 'ar'
        ? `👥 عدد المسافرين: ${meta.pax}`
        : `👥 Travelers: ${meta.pax}`)
    }

    if (meta.budget) {
      contextParts.push(lang === 'ar'
        ? `💰 الميزانية: ${meta.budget} دولار/شخص`
        : `💰 Budget: $${meta.budget}/person`)
    }

    // Retrieve relevant RAG chunks
    const { chunks } = ragService.retrieve(message, { lang, limit: 5 })
    
    if (chunks.length > 0) {
      const ragContext = PromptService.formatRAGContext(chunks, lang)
      contextParts.push('\n📚 معلومات متاحة:\n' + ragContext)
      
      // Add explicit instruction to use real data
      contextParts.push(lang === 'ar'
        ? '\n⚠️ استخدم المعلومات الحقيقية أعلاه (أسماء الفنادق، الأسعار، التفاصيل) في ردك!'
        : '\n⚠️ Use the real information above (hotel names, prices, details) in your response!')
    }

    // Add specific topic data if requested
    if (contextData.requestedTopic && contextData.destination) {
      const topicChunks = ragService.getDestinationInfo(
        contextData.destination,
        contextData.requestedTopic,
        lang
      )
      
      if (topicChunks.length > 0) {
        let topicContext = ''
        
        // Format based on topic type with interactive instructions
        if (contextData.requestedTopic === 'hotels' && topicChunks[0].metadata?.hotels) {
          const hotels = topicChunks[0].metadata.hotels
          topicContext = PromptService.formatHotels(hotels, lang, hotels.length) // Show ALL hotels
          topicContext += lang === 'ar'
            ? '\n\n📌 تعليمات: استخدم الأسماء والأسعار الحقيقية للفنادق أعلاه. اقترح 2-3 فنادق مناسبة للميزانية والتفضيلات.'
            : '\n\n📌 Instructions: Use the real hotel names and prices above. Suggest 2-3 hotels suitable for budget and preferences.'
        } else if (contextData.requestedTopic === 'tours' && topicChunks[0].metadata?.tours) {
          const tours = topicChunks[0].metadata.tours
          topicContext = PromptService.formatTours(tours, lang, tours.length) // Show ALL tours
          topicContext += lang === 'ar'
            ? '\n\n📌 تعليمات: استخدم الأسماء والأسعار الحقيقية للجولات أعلاه. اقترح 2-3 جولات مناسبة.'
            : '\n\n📌 Instructions: Use the real tour names and prices above. Suggest 2-3 suitable tours.'
        } else {
          topicContext = topicChunks.map(c => c.text).join('\n\n')
        }
        
        contextParts.push(`\n${lang === 'ar' ? '🎯 معلومات محددة:' : '🎯 Specific information:'}\n${topicContext}`)
      }
    }
    
    // If user selected a specific hotel, provide detailed information
    if (contextData.selectedHotel || meta.selectedHotel) {
      const hotelName = contextData.selectedHotel || meta.selectedHotel
      const dest = meta.lastDest || contextData.destination || 'bali'
      const destChunks = ragService.getDestinationInfo(dest, 'hotels', lang)
      
      if (destChunks.length > 0 && destChunks[0].metadata?.hotels) {
        const hotel = destChunks[0].metadata.hotels.find((h: any) => 
          h.hotel_name?.toLowerCase().includes(hotelName.toLowerCase())
        )
        
        if (hotel) {
          const hotelDetails = lang === 'ar'
            ? `🏨 **تفاصيل ${hotel.hotel_name}**\n\n⭐ التصنيف: ${hotel.rating || 'غير محدد'}\n📍 المنطقة: ${hotel.area || 'غير محدد'}\n💵 السعر: $${hotel.price_usd || hotel.price_double_triple_usd || 'غير محدد'} للشخص\n\n📋 **المميزات:**\n${hotel.features || 'غير متوفر'}\n\n📝 **الوصف:**\n${hotel.description_ar || hotel.description || 'غير متوفر'}`
            : `🏨 **${hotel.hotel_name} Details**\n\n⭐ Rating: ${hotel.rating || 'N/A'}\n📍 Area: ${hotel.area || 'N/A'}\n💵 Price: $${hotel.price_usd || hotel.price_double_triple_usd || 'N/A'} per person\n\n📋 **Features:**\n${hotel.features || 'Not available'}\n\n📝 **Description:**\n${hotel.description_en || hotel.description || 'Not available'}`
          
          contextParts.push('\n' + hotelDetails)
          contextParts.push(lang === 'ar'
            ? '\n📌 تعليمات: اعرض تفاصيل الفندق بشكل جذاب واسأل العميل إذا كان يريد الحجز أو رؤية فنادق أخرى.'
            : '\n📌 Instructions: Present the hotel details attractively and ask the client if they want to book or see other hotels.')
        }
      }
    }
    
    // If we have all info, add instruction to make recommendations
    if (hasDestination && hasDates && hasTravelers && hasBudget) {
      const dest = meta.lastDest || contextData.destination
      const destChunks = ragService.getDestinationInfo(dest, 'all', lang)
      
      if (destChunks.length > 0 && destChunks[0].metadata?.hotels) {
        const allHotels = destChunks[0].metadata.hotels
        const filtered = allHotels.filter((h: any) => {
          const price = h.price_usd || h.price_double_triple_usd || 0
          return price <= (meta.budget || 999999)
        })
        
        if (filtered.length > 0) {
          contextParts.push('\n' + PromptService.formatHotels(filtered, lang, filtered.length))
          contextParts.push(lang === 'ar'
            ? '\n الآن اقترح أفضل 2-3 فنادق من القائمة أعلاه بناءً على ميزانية العميل وتفضيلاته. اذكر الأسماء والأسعار الحقيقية!'
            : '\n Now suggest the best 2-3 hotels from the list above based on client budget and preferences. Mention real names and prices!')
        }
      }
    }

    return contextParts.join('\n')
  }

  // Generate smart UI based on AI response
  private async generateSmartUI(
    aiResponse: string,
    userMessage: string,
    lang: Language,
    meta: any,
    contextData: any,
    userId: string
  ): Promise<ChatResponse['ui'] | undefined> {
    const blocks: any[] = []
    
    // ALWAYS add AI response as text block first
    blocks.push({
      type: 'text',
      text: aiResponse
    })
    
    const responseLower = aiResponse.toLowerCase()
    const messageLower = userMessage.toLowerCase()

    // Only show destination buttons if AI mentions multiple destinations and user hasn't chosen yet
    if (!meta.lastDest && !contextData.selectedDestination &&
        (responseLower.includes('bali') && responseLower.includes('istanbul')) &&
        (responseLower.includes('which') || responseLower.includes('choose') || 
         responseLower.includes('prefer') ||
         responseLower.includes('أي') || responseLower.includes('اختر') ||
         responseLower.includes('تفضل'))) {
      const destinations = ragService.destinations().filter(d => d && d !== 'unknown')
      if (destinations.length > 0) {
        blocks.push({
          type: 'buttons',
          text: '',
          buttons: destinations.map(d => ({
            text: lang === 'ar' ? (d === 'istanbul' ? '🕌 إسطنبول' : '🌴 بالي') : (d === 'istanbul' ? '🕌 Istanbul' : '🌴 Bali'),
            value: `dest:${d}`
          }))
        })
      }
      return blocks.length > 0 ? { blocks } : undefined
    }

    // Show date picker ONLY if AI specifically asks about dates
    if ((responseLower.includes('when') || responseLower.includes('date') || 
         responseLower.includes('متى') || responseLower.includes('تاريخ') ||
         responseLower.includes('امتى') || responseLower.includes('ناوي تسافر')) &&
        !meta.startDate && meta.lastDest) {
      blocks.push({
        type: 'dateRange',
        heading: lang === 'ar' ? 'اختر التواريخ:' : 'Select dates:'
      })
      return blocks.length > 0 ? { blocks } : undefined
    }

    // Show travellers widget ONLY if AI asks about number of people
    if ((responseLower.includes('how many') || responseLower.includes('traveler') || 
         responseLower.includes('people') ||
         responseLower.includes('كم شخص') || responseLower.includes('مسافر') ||
         responseLower.includes('كام') || responseLower.includes('عدد') ||
         responseLower.includes('هيسافروا')) &&
        !meta.pax && meta.lastDest) {
      blocks.push({
        type: 'travellers',
        heading: lang === 'ar' ? 'عدد المسافرين:' : 'Number of travelers:',
        min: 1,
        max: 9,
        default: 2
      })
      return blocks.length > 0 ? { blocks } : undefined
    }

    // Show budget buttons if AI asks about budget - ENHANCED
    if ((responseLower.includes('budget') || responseLower.includes('price') || 
         responseLower.includes('ميزانية') || responseLower.includes('سعر') ||
         responseLower.includes('تكلفة') || responseLower.includes('كام') ||
         responseLower.includes('how much')) &&
        !meta.budget) {
      blocks.push({
        type: 'buttons',
        text: lang === 'ar' 
          ? '💰 اختر الميزانية المناسبة لك (السعر للشخص الواحد):' 
          : '💰 Choose your preferred budget (price per person):',
        buttons: [
          { 
            text: lang === 'ar' ? '� اقتصادي\n$500 - $800' : '� Economy\n$500 - $800', 
            value: 'budget:650' 
          },
          { 
            text: lang === 'ar' ? '💎 متوسط\n$800 - $1200' : '💎 Medium\n$800 - $1200', 
            value: 'budget:1000' 
          },
          { 
            text: lang === 'ar' ? '👑 فاخر\n$1200+' : '👑 Luxury\n$1200+', 
            value: 'budget:1500' 
          },
          { 
            text: lang === 'ar' ? '🌟 ممتاز جداً\n$1500+' : '🌟 Premium\n$1500+', 
            value: 'budget:2000' 
          }
        ]
      })
    }

    // If AI suggested hotels AND user has all info, show hotel selection buttons
    if (meta.lastDest && meta.budget && !meta.selectedHotel && !contextData.selectedHotel) {
      // Check if AI response mentions hotel recommendations
      if (responseLower.includes('hotel') || responseLower.includes('فندق')) {
        const dest = meta.lastDest
        const destChunks = ragService.getDestinationInfo(dest, 'hotels', lang)
        
        if (destChunks.length > 0 && destChunks[0].metadata?.hotels) {
          const allHotels = destChunks[0].metadata.hotels
          const filtered = allHotels.filter((h: any) => {
            const price = h.price_usd || h.price_double_triple_usd || 0
            return price <= (meta.budget || 999999)
          }).slice(0, 3) // Top 3 hotels only
          
          if (filtered.length > 0) {
            blocks.push({
              type: 'buttons',
              text: lang === 'ar' ? '🏨 اختر فندق لمعرفة المزيد:' : '🏨 Select a hotel to learn more:',
              buttons: filtered.map((h: any) => ({
                text: `${h.hotel_name}\n${h.rating || ''} - $${h.price_usd || h.price_double_triple_usd}`,
                value: `hotel:${h.hotel_name}`
              }))
            })
          }
        }
      }
    }

    // If user selected a hotel, show booking options
    if (meta.selectedHotel || contextData.selectedHotel) {
      blocks.push({
        type: 'buttons',
        text: lang === 'ar' ? 'ماذا تريد أن تفعل؟' : 'What would you like to do?',
        buttons: [
          { text: lang === 'ar' ? '� تواصل عبر واتساب' : '� Contact via WhatsApp', value: 'whatsapp' },
          { text: lang === 'ar' ? '🏨 فنادق أخرى' : '🏨 Other Hotels', value: 'ask_hotels' },
          { text: lang === 'ar' ? '🎯 الجولات السياحية' : '🎯 Tours', value: 'ask_tours' }
        ]
      })
    }

    return blocks.length > 0 ? { blocks } : undefined
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
}
