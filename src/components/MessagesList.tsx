import { useEffect, useRef } from 'react'
import type { ChatMessage, Language, ButtonOption } from '../types'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './UIComponents'

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
      className="flex-1 overflow-y-auto bg-white scroll-smooth" 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent'
      }}
    >
      {/* Today Divider */}
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
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="text-center">
              {/* Virtual Assistant Message */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 max-w-xs">
                  <p className="text-sm text-gray-700">
                    Hi I'm your personal virtual assistant. How may I help you?
                  </p>
                </div>
              </div>
              
              {/* Quick Questions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 text-center mb-3">How can I help you today?</h4>
                <div className="grid grid-cols-1 gap-2">
                  <button className="flex items-center gap-3 px-4 py-3 border border-red-200 rounded-xl bg-white hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-left">
                    <div className="w-8 h-8 bg-red-800 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Book a Flight</div>
                      <div className="text-xs text-gray-500">Find the best deals</div>
                    </div>
                  </button>
                  
                  <button className="flex items-center gap-3 px-4 py-3 border border-red-200 rounded-xl bg-white hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-left">
                    <div className="w-8 h-8 bg-red-800 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Visa Information</div>
                      <div className="text-xs text-gray-500">Requirements & process</div>
                    </div>
                  </button>
                  
                  <button className="flex items-center gap-3 px-4 py-3 border border-red-200 rounded-xl bg-white hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-left">
                    <div className="w-8 h-8 bg-red-800 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Special Offers</div>
                      <div className="text-xs text-gray-500">Exclusive deals & discounts</div>
                    </div>
                  </button>
                  
                  <button className="flex items-center gap-3 px-4 py-3 border border-red-200 rounded-xl bg-white hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-left">
                    <div className="w-8 h-8 bg-red-800 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Customer Support</div>
                      <div className="text-xs text-gray-500">Get help from our team</div>
                    </div>
                  </button>
                </div>
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
      </div>
      
      <div ref={messagesEndRef} />
    </div>
  )
}
