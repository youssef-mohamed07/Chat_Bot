import { useEffect, useRef } from 'react'
import type { ChatMessage, Language } from '../types'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'

interface MessagesListProps {
  messages: ChatMessage[]
  lang: Language
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  isLoading?: boolean
}

export const MessagesList = ({ messages, lang, messagesEndRef, isLoading = false }: MessagesListProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Smooth scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
    }
  }, [messages, messagesEndRef])

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50 bg-noise p-4 space-y-4 scroll-smooth" 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent'
      }}
    >
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center fade-in-up">
            <div className="text-4xl mb-4">💬</div>
            <div className="text-gray-500 text-sm">
              {lang === 'ar' ? 'ابدأ محادثة جديدة' : 'Start a new conversation'}
            </div>
          </div>
        </div>
      ) : (
        messages.map((message, index) => (
          <div
            key={index}
            className="message-bubble"
            style={{ 
              animationDelay: `${index * 0.1}s`,
              animationFillMode: 'both'
            }}
          >
            <MessageBubble message={message} lang={lang} />
          </div>
        ))
      )}
      
      {/* Typing indicator */}
      <TypingIndicator isVisible={isLoading} lang={lang} />
      
      <div ref={messagesEndRef} />
    </div>
  )
}
