import { useState, useRef, useEffect } from 'react'
import type { ChatMessage, Language, SupportRequest } from '../types'
import { WELCOME_MESSAGES, API_ENDPOINTS, LABELS, generateUserId } from '../utils'

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
    
    // Add simple welcome message without buttons
    const welcomeMessage: ChatMessage = {
      text: text,
      isUser: false,
      timestamp: new Date()
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

      // Return the actual AI response without any buttons or complex logic
      return {
        text: fullResponse,
        isUser: false,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('❌ API Error:', error)
      return {
        text: lang === 'ar' ? 'عذراً، حدث خطأ في الاتصال بالخادم.' : 'Sorry, there was an error connecting to the server.',
        isUser: false,
        timestamp: new Date()
      }
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
    sendSupportRequest
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
