import { useEffect, useRef } from 'react'
import type { ChatMessage, Language, ButtonOption } from '../types'
import { MessageBubble } from './MessageBubble'
import { SkeletonBubble } from './UIComponents'

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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, messagesEndRef])

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-y-auto bg-white scroll-smooth"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent' }}
    >
      <div className="px-4 pt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dashed border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-sm text-gray-500">Today</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {messages.length === 0 ? null : (
          messages.map((message, index) => {
            // Only show buttons on the LAST bot message
            const isLastBotMessage = !message.isUser && 
              index === messages.map(m => !m.isUser).lastIndexOf(true)
            
            return (
              <div key={index} className="message-bubble">
                <MessageBubble 
                  message={message} 
                  lang={lang} 
                  onButtonClick={onButtonClick}
                  showButtons={isLastBotMessage}
                />
              </div>
            )
          })
        )}
        {isLoading ? <SkeletonBubble /> : null}
      </div>

      <div ref={messagesEndRef} />
    </div>
  )
}
