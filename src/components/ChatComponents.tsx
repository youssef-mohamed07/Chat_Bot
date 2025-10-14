import { useState, useRef } from 'react'
import type { Language } from '../types'
import { PLACEHOLDERS } from '../utils'
import { SupportCTA } from './UIComponents'

// Chat Header Component
interface ChatHeaderProps {
  onClose: () => void
  isChatEnded?: boolean
}

export const ChatHeader = ({ onClose, isChatEnded = false }: ChatHeaderProps) => {
  return (
    <div className="px-4 py-4 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg">
            <img 
              src="/logo.jpg" 
              alt="Quick Air" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Quick Air - Online</span>
          </div>
        </div>
        
        {isChatEnded ? (
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Minimize chat"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        ) : (
          <button 
            onClick={onClose} 
            className="px-3 py-1 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200"
            aria-label="End chat"
          >
            End chat
          </button>
        )}
      </div>
    </div>
  )
}

// Chat Input Component
interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  onSend: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  isLoading: boolean
  lang: Language
}

export const ChatInput = ({ 
  input, 
  setInput, 
  onSend, 
  onKeyPress, 
  isLoading, 
  lang 
}: ChatInputProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🚀', '💡', '⭐', '🔥', '✅']

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleInputResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    target.style.height = 'auto'
    target.style.height = Math.min(target.scrollHeight, 120) + 'px'
  }

  const handleEmojiClick = (emoji: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newText = input.substring(0, start) + emoji + input.substring(end)
      setInput(newText)
      
      // Focus back to textarea and set cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 0)
    }
    setShowEmojis(false)
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyPress={onKeyPress}
            onInput={handleInputResize}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={1}
            placeholder={PLACEHOLDERS[lang].message}
            className={`
              w-full resize-none rounded-lg border-2 px-4 py-3 text-sm transition-colors duration-200
              ${isFocused 
                ? 'border-blue-500' 
                : 'border-gray-200'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            `}
            style={{ maxHeight: '120px' }}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            disabled={isLoading}
          />
          
          {/* Character count */}
          {isFocused && (
            <div className="absolute -top-6 right-0 text-xs text-gray-400">
              {input.length}/500
            </div>
          )}
        </div>

        {/* Emoji button */}
        <button
          onClick={() => setShowEmojis(!showEmojis)}
          className={`
            h-11 w-11 rounded-lg flex items-center justify-center transition-colors duration-200
            ${showEmojis 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
          aria-label="Add emoji"
        >
          <span className="text-lg">😊</span>
        </button>

        {/* Send button */}
        <button
          onClick={onSend}
          disabled={isLoading || !input.trim()}
          className={`
            h-11 w-11 rounded-lg text-white flex items-center justify-center transition-colors duration-200
            ${isLoading || !input.trim() 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:opacity-90'
            }
          `}
          style={{ background: 'var(--chat-bot-bg)' }}
          aria-label="Send"
        >
          {isLoading ? (
            <div className="relative">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <svg className="w-5 h-5 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>
      </div>

      {/* Emoji picker */}
      {showEmojis && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-6 gap-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="text-lg p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Chat Footer Component (Simple version)
interface ChatFooterProps {
  input: string
  setInput: (value: string) => void
  onSend: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  isLoading: boolean
  lang: Language
  onOpenSupport: () => void
}

export const ChatFooter = ({ 
  input, 
  setInput, 
  onSend, 
  onKeyPress, 
  isLoading, 
  lang, 
  onOpenSupport 
}: ChatFooterProps) => {
  return (
    <div className="border-t border-gray-100 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Type your message"
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-600 text-sm"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          />
        </div>
        <button
          onClick={() => onSend()}
          disabled={isLoading || !input.trim()}
          className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
      
      {/* Support CTA */}
      <div className="mt-3 text-center">
        <SupportCTA onOpenSupport={onOpenSupport} lang={lang} />
      </div>
      
      {/* Footer Branding */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">Powered by Quick Air</p>
      </div>
    </div>
  )
}

// Chat Ended State Component
interface ChatEndedStateProps {
  lang: Language
  onRestartChat: () => void
}

export const ChatEndedState = ({ onRestartChat }: ChatEndedStateProps) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  const ratings = [
    { emoji: '😄', value: 5, label: 'Very Happy' },
    { emoji: '😊', value: 4, label: 'Happy' },
    { emoji: '😐', value: 3, label: 'Neutral' },
    { emoji: '😔', value: 2, label: 'Sad' },
    { emoji: '😢', value: 1, label: 'Very Sad' }
  ]

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Chat Ended Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-sm text-gray-500">Chat has ended</span>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="text-center space-y-4">
        <h3 className="text-sm font-medium text-gray-700">
          How was your experience with us?
        </h3>
        
        {/* Rating Emojis */}
        <div className="flex justify-center gap-2">
          {ratings.map((rating) => (
            <button
              key={rating.value}
              onClick={() => setSelectedRating(rating.value)}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                selectedRating === rating.value
                  ? 'border-red-800 bg-red-50 scale-110'
                  : 'border-gray-300 hover:border-red-600'
              }`}
              title={rating.label}
            >
              <span className="text-lg">{rating.emoji}</span>
            </button>
          ))}
        </div>

        {/* Restart Chat Button */}
        <button
          onClick={onRestartChat}
          className="w-full bg-red-800 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-900 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Restart Chat
        </button>
      </div>
    </div>
  )
}
