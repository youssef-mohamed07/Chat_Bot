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

  const createInteractiveResponse = (userMessage: string, lang: Language): ChatMessage => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Flight search response
    if (lowerMessage.includes('flight') || lowerMessage.includes('رحل') || lowerMessage.includes('search flights') || lowerMessage.includes('البحث عن رحلات')) {
      return {
        text: lang === 'ar' ? 'أين تريد السفر؟ اختر وجهتك المفضلة:' : 'Where would you like to travel? Choose your destination:',
        isUser: false,
        timestamp: new Date(),
        type: 'buttons',
        buttons: [
          {
            id: 'dubai',
            text: '🇦🇪 Dubai',
            action: 'postback',
            value: lang === 'ar' ? 'رحلات إلى دبي' : 'Flights to Dubai',
            style: 'primary'
          },
          {
            id: 'london',
            text: '🇬🇧 London',
            action: 'postback',
            value: lang === 'ar' ? 'رحلات إلى لندن' : 'Flights to London',
            style: 'primary'
          },
          {
            id: 'paris',
            text: '🇫🇷 Paris',
            action: 'postback',
            value: lang === 'ar' ? 'رحلات إلى باريس' : 'Flights to Paris',
            style: 'primary'
          },
          {
            id: 'tokyo',
            text: '🇯🇵 Tokyo',
            action: 'postback',
            value: lang === 'ar' ? 'رحلات إلى طوكيو' : 'Flights to Tokyo',
            style: 'primary'
          }
        ]
      }
    }
    
    // Deals response
    if (lowerMessage.includes('deal') || lowerMessage.includes('offer') || lowerMessage.includes('عرض') || lowerMessage.includes('خصم')) {
      return {
        text: lang === 'ar' ? 'إليك أفضل العروض المتاحة الآن:' : 'Here are the best deals available now:',
        isUser: false,
        timestamp: new Date(),
        type: 'card',
        card: {
          title: lang === 'ar' ? 'عرض خاص - دبي' : 'Special Offer - Dubai',
          subtitle: lang === 'ar' ? 'توفير حتى 40%' : 'Save up to 40%',
          description: lang === 'ar' ? 'رحلات إلى دبي مع إقامة فندقية مجانية' : 'Flights to Dubai with free hotel stay',
          image: '/logo.jpg',
          buttons: [
            {
              id: 'book_dubai',
              text: lang === 'ar' ? 'احجز الآن' : 'Book Now',
              action: 'url',
              value: 'https://example.com/book-dubai',
              style: 'success'
            },
            {
              id: 'more_info',
              text: lang === 'ar' ? 'مزيد من التفاصيل' : 'More Info',
              action: 'postback',
              value: lang === 'ar' ? 'مزيد من التفاصيل عن عرض دبي' : 'More details about Dubai offer',
              style: 'secondary'
            }
          ]
        }
      }
    }
    
    // Visa information response
    if (lowerMessage.includes('visa') || lowerMessage.includes('تأشيرة') || lowerMessage.includes('visa information')) {
      return {
        text: lang === 'ar' ? 'ما نوع التأشيرة التي تحتاجها؟' : 'What type of visa do you need?',
        isUser: false,
        timestamp: new Date(),
        type: 'quick_replies',
        quickReplies: lang === 'ar' 
          ? ['تأشيرة سياحة', 'تأشيرة عمل', 'تأشيرة دراسة', 'تأشيرة عائلية']
          : ['Tourist Visa', 'Work Visa', 'Student Visa', 'Family Visa']
      }
    }
    
    // Default response with quick replies
    return {
      text: lang === 'ar' ? 'كيف يمكنني مساعدتك أكثر؟' : 'How else can I help you?',
      isUser: false,
      timestamp: new Date(),
      type: 'quick_replies',
      quickReplies: lang === 'ar' 
        ? ['البحث عن رحلات', 'العروض والخصومات', 'معلومات التأشيرة', 'الدعم الفني']
        : ['Search Flights', 'Deals & Offers', 'Visa Information', 'Technical Support']
    }
  }

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input.trim()
    if (!messageToSend || isLoading) return
    
    const userMessage = messageToSend
    
    // Clear input immediately if it's from user typing
    if (!customMessage) {
      setInput('')
    }
    
    setMessages(prev => [...prev, { text: userMessage, isUser: true, timestamp: new Date() }])
    setIsLoading(true)

    // Immediate interactive response
    const interactiveResponse = createInteractiveResponse(userMessage, lang ?? 'en')
    setMessages(prev => [...prev, interactiveResponse])
    setIsLoading(false)
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
