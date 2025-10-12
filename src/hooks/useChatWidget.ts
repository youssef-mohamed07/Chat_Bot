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
    setMessages([{ text, isUser: false, timestamp: new Date() }])
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage = input.trim()
    setMessages(prev => [...prev, { text: userMessage, isUser: true, timestamp: new Date() }])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(API_ENDPOINTS.CHAT_STREAM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          userId, 
          lang: (lang ?? 'en') 
        })
      })

      if (!response.body) {
        throw new Error('No stream')
      }

      let assistantText = ''
      setMessages(prev => [...prev, { text: '', isUser: false, timestamp: new Date() }])

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split(/\r?\n/)
        
        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data:')) continue
          
          const data = line.slice(5).trim()
          if (data === '[DONE]') continue
          
          try {
            const json = JSON.parse(data)
            const delta = json?.choices?.[0]?.delta?.content || json?.choices?.[0]?.message?.content || ''
            
            if (delta) {
              assistantText += delta
              setMessages(prev => {
                const cloned = [...prev]
                for (let i = cloned.length - 1; i >= 0; i--) {
                  if (!cloned[i].isUser) {
                    cloned[i] = { ...cloned[i], text: assistantText }
                    break
                  }
                }
                return cloned
              })
            }
          } catch {}
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { 
        text: 'Connection error. Please check server.', 
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
