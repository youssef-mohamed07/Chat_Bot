import { useState, useRef, useEffect } from 'react'
import type { ChatMessage, Language, SupportRequest } from '../types'
import { WELCOME_MESSAGES, API_ENDPOINTS, LABELS } from '../constants'
import { generateUserId } from '../utils'

export const useChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [lang, setLang] = useState<Language | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const userId = useRef(generateUserId()).current
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSelectLang = (selected: Language) => {
    setLang(selected)
    const text = WELCOME_MESSAGES[selected]
    
    // Add welcome message with interactive buttons
    const welcomeMessage: ChatMessage = {
      text: text,
      isUser: false,
      timestamp: new Date(),
      type: 'buttons',
      buttons: [
        {
          id: 'flights',
          text: selected === 'ar' ? 'البحث عن رحلات' : 'Search Flights',
          action: 'postback',
          value: selected === 'ar' ? 'البحث عن رحلات' : 'Search Flights',
          style: 'primary'
        },
        {
          id: 'deals',
          text: selected === 'ar' ? 'العروض والخصومات' : 'Deals & Offers',
          action: 'postback',
          value: selected === 'ar' ? 'العروض والخصومات' : 'Deals & Offers',
          style: 'secondary'
        },
        {
          id: 'visa',
          text: selected === 'ar' ? 'معلومات التأشيرة' : 'Visa Information',
          action: 'postback',
          value: selected === 'ar' ? 'معلومات التأشيرة' : 'Visa Information',
          style: 'success'
        }
      ]
    }
    
    setMessages([welcomeMessage])
  }

  const detectLanguage = (message: string): Language => {
    // Simple Arabic detection - check for Arabic characters
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
    return arabicRegex.test(message) ? 'ar' : 'en'
  }

  const sendToAPI = async (message: string, lang: Language): Promise<ChatMessage> => {
    try {
      const response = await fetch('/chat/stream', {
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

      // Read the streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      let fullResponse = ''
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') continue
              
              try {
                const parsed = JSON.parse(data)
                // Handle different response formats
                if (parsed.content) {
                  fullResponse += parsed.content
                } else if (parsed.choices?.[0]?.delta?.content) {
                  fullResponse += parsed.choices[0].delta.content
                } else if (parsed.choices?.[0]?.message?.content) {
                  fullResponse += parsed.choices[0].message.content
                }
              } catch (e) {
                // Ignore parsing errors for non-JSON lines
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      // Create interactive response based on the message content
      return createInteractiveResponse(fullResponse, message, lang)
    } catch (error) {
      console.error('❌ API Error:', error)
      return {
        text: lang === 'ar' ? 'عذراً، حدث خطأ في الاتصال بالخادم.' : 'Sorry, there was an error connecting to the server.',
        isUser: false,
        timestamp: new Date()
      }
    }
  }

  const createInteractiveResponse = (apiResponse: string, userMessage: string, lang: Language): ChatMessage => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Extract key info from API response and create short, helpful responses
    const getShortResponse = (fullResponse: string, category: string): string => {
      // Clean up the response - remove markdown formatting and extra spaces
      // const cleanResponse = fullResponse
      //   .replace(/\*\*/g, '') // Remove bold markdown
      //   .replace(/\*/g, '') // Remove italic markdown
      //   .replace(/\n\n/g, ' ') // Replace double newlines with space
      //   .replace(/\n/g, ' ') // Replace single newlines with space
      //   .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      //   .trim()
      
      // Take first sentence or first 80 characters, whichever is shorter
      // const firstSentence = cleanResponse.split('.')[0]
      
      if (lang === 'ar') {
        switch (category) {
          case 'flights': return '✈️ يمكنني مساعدتك في البحث عن أفضل الرحلات!'
          case 'deals': return '🎯 لدينا عروض رائعة متاحة الآن!'
          case 'visa': return '📋 معلومات التأشيرة جاهزة لك!'
          case 'greeting': return '👋 مرحباً! كيف يمكنني مساعدتك؟'
          case 'support': return '🆘 فريق الدعم جاهز لمساعدتك!'
          case 'domestic': return '🏠 رحلات محلية مريحة وسريعة!'
          case 'international': return '🌍 رحلات دولية إلى جميع أنحاء العالم!'
          case 'book_now': return '📅 احجز رحلتك الآن واحصل على أفضل الأسعار!'
          case 'hot_deals': return '🔥 عروض ساخنة محدودة الوقت!'
          case 'early_bird': return '🐦 عروض الحجز المبكر توفر حتى 40%!'
          case 'group_discounts': return '👥 خصومات خاصة للمجموعات!'
          case 'tourist_visa': return '🏖️ تأشيرة سياحة لاستكشاف العالم!'
          case 'business_visa': return '💼 تأشيرة عمل للمهنيين!'
          case 'visa_requirements': return '📝 متطلبات التأشيرة واضحة ومبسطة!'
          case 'live_chat': return '💬 محادثة مباشرة مع فريق الدعم!'
          case 'phone_support': return '📞 دعم هاتفي على مدار الساعة!'
          case 'email_support': return '📧 دعم إلكتروني سريع ومفيد!'
          default: return '✅ شكراً لك! كيف يمكنني مساعدتك أكثر؟'
        }
      } else {
        switch (category) {
          case 'flights': return '✈️ I can help you find the best flights!'
          case 'deals': return '🎯 We have amazing deals available now!'
          case 'visa': return '📋 Visa information ready for you!'
          case 'greeting': return '👋 Hello! How can I help you?'
          case 'support': return '🆘 Our support team is ready to help!'
          case 'domestic': return '🏠 Comfortable and fast domestic flights!'
          case 'international': return '🌍 International flights worldwide!'
          case 'book_now': return '📅 Book your flight now and get the best prices!'
          case 'hot_deals': return '🔥 Hot deals with limited time offers!'
          case 'early_bird': return '🐦 Early bird offers save up to 40%!'
          case 'group_discounts': return '👥 Special group discounts available!'
          case 'tourist_visa': return '🏖️ Tourist visa to explore the world!'
          case 'business_visa': return '💼 Business visa for professionals!'
          case 'visa_requirements': return '📝 Clear and simplified visa requirements!'
          case 'live_chat': return '💬 Live chat with our support team!'
          case 'phone_support': return '📞 24/7 phone support available!'
          case 'email_support': return '📧 Fast and helpful email support!'
          default: return '✅ Thank you! How else can I help you?'
        }
      }
    }
    
    // Domestic flights
    if (lowerMessage.includes('domestic') || lowerMessage.includes('محلية') || lowerMessage.includes('رحلات محلية')) {
      return {
        text: getShortResponse(apiResponse, 'domestic'),
        isUser: false,
        timestamp: new Date(),
        type: 'buttons',
        buttons: [
          {
            id: 'book_domestic',
            text: lang === 'ar' ? 'احجز رحلة محلية' : 'Book Domestic Flight',
            action: 'postback',
            value: lang === 'ar' ? 'احجز رحلة محلية' : 'Book Domestic Flight',
            style: 'primary'
          },
          {
            id: 'domestic_routes',
            text: lang === 'ar' ? 'الطرق المحلية' : 'Domestic Routes',
            action: 'postback',
            value: lang === 'ar' ? 'الطرق المحلية' : 'Domestic Routes',
            style: 'secondary'
          },
          {
            id: 'back_to_flights',
            text: lang === 'ar' ? 'العودة للرحلات' : 'Back to Flights',
            action: 'postback',
            value: lang === 'ar' ? 'العودة للرحلات' : 'Back to Flights',
            style: 'success'
          }
        ]
      }
    }
    
    // International flights
    if (lowerMessage.includes('international') || lowerMessage.includes('دولية') || lowerMessage.includes('رحلات دولية')) {
      return {
        text: getShortResponse(apiResponse, 'international'),
        isUser: false,
        timestamp: new Date(),
        type: 'buttons',
        buttons: [
          {
            id: 'book_international',
            text: lang === 'ar' ? 'احجز رحلة دولية' : 'Book International Flight',
            action: 'postback',
            value: lang === 'ar' ? 'احجز رحلة دولية' : 'Book International Flight',
            style: 'primary'
          },
          {
            id: 'international_routes',
            text: lang === 'ar' ? 'الطرق الدولية' : 'International Routes',
            action: 'postback',
            value: lang === 'ar' ? 'الطرق الدولية' : 'International Routes',
            style: 'secondary'
          },
          {
            id: 'back_to_flights',
            text: lang === 'ar' ? 'العودة للرحلات' : 'Back to Flights',
            action: 'postback',
            value: lang === 'ar' ? 'العودة للرحلات' : 'Back to Flights',
            style: 'success'
          }
        ]
      }
    }
    
    // Book now
    if (lowerMessage.includes('book now') || lowerMessage.includes('احجز الآن') || lowerMessage.includes('احجز')) {
      return {
        text: getShortResponse(apiResponse, 'book_now'),
        isUser: false,
        timestamp: new Date(),
        type: 'buttons',
        buttons: [
          {
            id: 'search_flights',
            text: lang === 'ar' ? 'البحث عن رحلات' : 'Search Flights',
            action: 'postback',
            value: lang === 'ar' ? 'البحث عن رحلات' : 'Search Flights',
            style: 'primary'
          },
          {
            id: 'check_prices',
            text: lang === 'ar' ? 'تحقق من الأسعار' : 'Check Prices',
            action: 'postback',
            value: lang === 'ar' ? 'تحقق من الأسعار' : 'Check Prices',
            style: 'secondary'
          },
          {
            id: 'contact_booking',
            text: lang === 'ar' ? 'تواصل للحجز' : 'Contact for Booking',
            action: 'postback',
            value: lang === 'ar' ? 'تواصل للحجز' : 'Contact for Booking',
            style: 'success'
          }
        ]
      }
    }
    
    // Flight-related responses
    if (lowerMessage.includes('flight') || lowerMessage.includes('رحل') || lowerMessage.includes('طيران') || 
        lowerMessage.includes('search flights') || lowerMessage.includes('البحث عن رحلات')) {
      return {
        text: getShortResponse(apiResponse, 'flights'),
        isUser: false,
        timestamp: new Date(),
        type: 'buttons',
        buttons: [
          {
            id: 'domestic',
            text: lang === 'ar' ? 'رحلات محلية' : 'Domestic Flights',
            action: 'postback',
            value: lang === 'ar' ? 'رحلات محلية' : 'Domestic Flights',
            style: 'primary'
          },
          {
            id: 'international',
            text: lang === 'ar' ? 'رحلات دولية' : 'International Flights',
            action: 'postback',
            value: lang === 'ar' ? 'رحلات دولية' : 'International Flights',
            style: 'secondary'
          },
          {
            id: 'book_now',
            text: lang === 'ar' ? 'احجز الآن' : 'Book Now',
            action: 'postback',
            value: lang === 'ar' ? 'احجز الآن' : 'Book Now',
            style: 'success'
          }
        ]
      }
    }
    
    // Hot deals
    if (lowerMessage.includes('hot deals') || lowerMessage.includes('عروض ساخنة') || lowerMessage.includes('ساخنة')) {
      return {
        text: getShortResponse(apiResponse, 'hot_deals'),
        isUser: false,
        timestamp: new Date(),
        type: 'buttons',
        buttons: [
          {
            id: 'view_hot_deals',
            text: lang === 'ar' ? 'عرض العروض الساخنة' : 'View Hot Deals',
            action: 'postback',
            value: lang === 'ar' ? 'عرض العروض الساخنة' : 'View Hot Deals',
            style: 'primary'
          },
          {
            id: 'hot_deals_terms',
            text: lang === 'ar' ? 'شروط العروض' : 'Deal Terms',
            action: 'postback',
            value: lang === 'ar' ? 'شروط العروض' : 'Deal Terms',
            style: 'secondary'
          },
          {
            id: 'back_to_deals',
            text: lang === 'ar' ? 'العودة للعروض' : 'Back to Deals',
            action: 'postback',
            value: lang === 'ar' ? 'العودة للعروض' : 'Back to Deals',
            style: 'success'
          }
        ]
      }
    }
    
    // Early bird offers
    if (lowerMessage.includes('early bird') || lowerMessage.includes('الحجز المبكر') || lowerMessage.includes('مبكر')) {
      return {
        text: getShortResponse(apiResponse, 'early_bird'),
        isUser: false,
        timestamp: new Date(),
        type: 'buttons',
        buttons: [
          {
            id: 'view_early_bird',
            text: lang === 'ar' ? 'عرض عروض الحجز المبكر' : 'View Early Bird Offers',
            action: 'postback',
            value: lang === 'ar' ? 'عرض عروض الحجز المبكر' : 'View Early Bird Offers',
            style: 'primary'
          },
          {
            id: 'early_bird_benefits',
            text: lang === 'ar' ? 'فوائد الحجز المبكر' : 'Early Bird Benefits',
            action: 'postback',
            value: lang === 'ar' ? 'فوائد الحجز المبكر' : 'Early Bird Benefits',
            style: 'secondary'
          },
          {
            id: 'back_to_deals',
            text: lang === 'ar' ? 'العودة للعروض' : 'Back to Deals',
            action: 'postback',
            value: lang === 'ar' ? 'العودة للعروض' : 'Back to Deals',
            style: 'success'
          }
        ]
      }
    }
    
    // Group discounts
    if (lowerMessage.includes('group discounts') || lowerMessage.includes('خصومات المجموعات') || lowerMessage.includes('مجموعات')) {
      return {
        text: getShortResponse(apiResponse, 'group_discounts'),
        isUser: false,
        timestamp: new Date(),
        type: 'buttons',
        buttons: [
          {
            id: 'view_group_discounts',
            text: lang === 'ar' ? 'عرض خصومات المجموعات' : 'View Group Discounts',
            action: 'postback',
            value: lang === 'ar' ? 'عرض خصومات المجموعات' : 'View Group Discounts',
            style: 'primary'
          },
          {
            id: 'group_requirements',
            text: lang === 'ar' ? 'متطلبات المجموعة' : 'Group Requirements',
            action: 'postback',
            value: lang === 'ar' ? 'متطلبات المجموعة' : 'Group Requirements',
            style: 'secondary'
          },
          {
            id: 'back_to_deals',
            text: lang === 'ar' ? 'العودة للعروض' : 'Back to Deals',
            action: 'postback',
            value: lang === 'ar' ? 'العودة للعروض' : 'Back to Deals',
            style: 'success'
          }
        ]
      }
    }
    
    // Deals-related responses
    if (lowerMessage.includes('deal') || lowerMessage.includes('offer') || lowerMessage.includes('عرض') || 
        lowerMessage.includes('خصم') || lowerMessage.includes('deals & offers') || lowerMessage.includes('العروض والخصومات')) {
      return {
        text: getShortResponse(apiResponse, 'deals'),
        isUser: false,
        timestamp: new Date(),
        type: 'buttons',
          buttons: [
            {
            id: 'hot_deals',
            text: lang === 'ar' ? 'عروض ساخنة' : 'Hot Deals',
            action: 'postback',
            value: lang === 'ar' ? 'عروض ساخنة' : 'Hot Deals',
            style: 'primary'
          },
          {
            id: 'early_bird',
            text: lang === 'ar' ? 'عروض الحجز المبكر' : 'Early Bird Offers',
            action: 'postback',
            value: lang === 'ar' ? 'عروض الحجز المبكر' : 'Early Bird Offers',
            style: 'secondary'
          },
          {
            id: 'group_discounts',
            text: lang === 'ar' ? 'خصومات المجموعات' : 'Group Discounts',
            action: 'postback',
            value: lang === 'ar' ? 'خصومات المجموعات' : 'Group Discounts',
              style: 'success'
          }
        ]
      }
    }
    
    // Visa-related responses
    if (lowerMessage.includes('visa') || lowerMessage.includes('تأشيرة') || lowerMessage.includes('visa information') || 
        lowerMessage.includes('معلومات التأشيرة') || lowerMessage.includes('tourist visa') || lowerMessage.includes('business visa')) {
      return {
        text: getShortResponse(apiResponse, 'visa'),
        isUser: false,
        timestamp: new Date(),
        type: 'buttons',
        buttons: [
          {
            id: 'tourist_visa',
            text: lang === 'ar' ? 'تأشيرة سياحة' : 'Tourist Visa',
            action: 'postback',
            value: lang === 'ar' ? 'تأشيرة سياحة' : 'Tourist Visa',
            style: 'primary'
          },
          {
            id: 'business_visa',
            text: lang === 'ar' ? 'تأشيرة عمل' : 'Business Visa',
              action: 'postback',
            value: lang === 'ar' ? 'تأشيرة عمل' : 'Business Visa',
              style: 'secondary'
          },
          {
            id: 'visa_requirements',
            text: lang === 'ar' ? 'متطلبات التأشيرة' : 'Visa Requirements',
            action: 'postback',
            value: lang === 'ar' ? 'متطلبات التأشيرة' : 'Visa Requirements',
            style: 'success'
          }
        ]
      }
    }
    
    // General greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('مرحبا') || 
        lowerMessage.includes('السلام') || lowerMessage.includes('ازيك')) {
      return {
        text: getShortResponse(apiResponse, 'greeting'),
        isUser: false,
        timestamp: new Date(),
        type: 'buttons',
        buttons: [
          {
            id: 'flights',
            text: lang === 'ar' ? 'البحث عن رحلات' : 'Search Flights',
            action: 'postback',
            value: lang === 'ar' ? 'البحث عن رحلات' : 'Search Flights',
            style: 'primary'
          },
          {
            id: 'deals',
            text: lang === 'ar' ? 'العروض والخصومات' : 'Deals & Offers',
            action: 'postback',
            value: lang === 'ar' ? 'العروض والخصومات' : 'Deals & Offers',
            style: 'secondary'
          },
          {
            id: 'visa',
            text: lang === 'ar' ? 'معلومات التأشيرة' : 'Visa Information',
            action: 'postback',
            value: lang === 'ar' ? 'معلومات التأشيرة' : 'Visa Information',
            style: 'success'
          }
        ]
      }
    }
    
    // Support-related responses
    if (lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('contact') ||
        lowerMessage.includes('دعم') || lowerMessage.includes('مساعدة') || lowerMessage.includes('تواصل') ||
        lowerMessage.includes('customer support') || lowerMessage.includes('human agent') || lowerMessage.includes('agent')) {
      return {
        text: getShortResponse(apiResponse, 'support'),
        isUser: false,
        timestamp: new Date(),
        type: 'buttons',
        buttons: [
          {
            id: 'live_chat',
            text: lang === 'ar' ? 'محادثة مباشرة' : 'Live Chat',
            action: 'postback',
            value: lang === 'ar' ? 'محادثة مباشرة' : 'Live Chat',
            style: 'primary'
          },
          {
            id: 'phone_support',
            text: lang === 'ar' ? 'دعم هاتفي' : 'Phone Support',
            action: 'postback',
            value: lang === 'ar' ? 'دعم هاتفي' : 'Phone Support',
            style: 'secondary'
          },
          {
            id: 'email_support',
            text: lang === 'ar' ? 'دعم إلكتروني' : 'Email Support',
            action: 'postback',
            value: lang === 'ar' ? 'دعم إلكتروني' : 'Email Support',
            style: 'success'
          }
        ]
      }
    }
    
    // Default response with general options
    return {
      text: getShortResponse(apiResponse, 'default'),
      isUser: false,
      timestamp: new Date(),
      type: 'buttons',
      buttons: [
        {
          id: 'more_info',
          text: lang === 'ar' ? 'مزيد من المعلومات' : 'More Information',
          action: 'postback',
          value: lang === 'ar' ? 'مزيد من المعلومات' : 'More Information',
          style: 'primary'
        },
        {
          id: 'contact_support',
          text: lang === 'ar' ? 'التواصل مع الدعم' : 'Contact Support',
          action: 'postback',
          value: lang === 'ar' ? 'التواصل مع الدعم' : 'Contact Support',
          style: 'secondary'
        },
        {
          id: 'new_search',
          text: lang === 'ar' ? 'بحث جديد' : 'New Search',
          action: 'postback',
          value: lang === 'ar' ? 'بحث جديد' : 'New Search',
          style: 'success'
        }
      ]
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
    
    const userMessage = messageToSend
    
    // Clear input immediately if it's from user typing
    if (!customMessage) {
      setInput('')
    }
    
    setMessages(prev => [...prev, { text: userMessage, isUser: true, timestamp: new Date() }])
    setIsLoading(true)

    try {
      // Auto-detect language if not set
      const detectedLang = lang ?? detectLanguage(userMessage)
      
      // Send to API and get interactive response
      const interactiveResponse = await sendToAPI(userMessage, detectedLang)
      
      // Add interactive response to messages
    setMessages(prev => [...prev, interactiveResponse])
    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message
      setMessages(prev => [...prev, { 
        text: lang === 'ar' ? 'عذراً، حدث خطأ في الاتصال بالخادم.' : 'Sorry, there was an error connecting to the server.',
        isUser: false, 
        timestamp: new Date() 
      }])
    } finally {
    setIsLoading(false)
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
        // Show success message instead of opening WhatsApp link
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
    sendSupportRequest
  }
}
