import { useEffect, useRef } from 'react'
import type { ChatMessage, Language, ButtonOption } from '../types'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'

interface MessagesListProps {
  messages: ChatMessage[]
  lang: Language
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  isLoading?: boolean
  onButtonClick?: (button: ButtonOption) => void
}

export const MessagesList = ({ messages, lang, messagesEndRef, isLoading = false, onButtonClick }: MessagesListProps) => {
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
      className="flex-1 overflow-y-auto bg-white p-4 space-y-4 scroll-smooth" 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent'
      }}
    >
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <div className="text-gray-500 text-lg font-medium mb-2">
              {lang === 'ar' ? 'مرحباً! كيف يمكنني مساعدتك؟' : 'Hello! How can I help you?'}
            </div>
            <div className="text-gray-400 text-sm">
              {lang === 'ar' ? 'ابدأ محادثة جديدة' : 'Start a new conversation'}
            </div>
          </div>
        </div>
      ) : (
        messages.map((message, index) => (
          <div
            key={index}
            className="message-bubble"
          >
            <MessageBubble 
              message={message} 
              lang={lang} 
              onButtonClick={onButtonClick}
            />
          </div>
        ))
      )}
      
      {/* Typing indicator */}
      <TypingIndicator isVisible={isLoading} lang={lang} />
      
      <div ref={messagesEndRef} />
    </div>
  )
}
