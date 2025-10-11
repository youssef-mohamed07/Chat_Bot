import { useState, useRef, useEffect } from 'react'
import type { Language } from '../types'
import { SUGGESTION_CHIPS, PLACEHOLDERS } from '../constants'
import { useSoundEffects } from '../utils'

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
  const [showSuggestions, setShowSuggestions] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { playClick, playSend, playTyping } = useSoundEffects()

  const emojis = ['😊', '👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🚀', '💡', '⭐', '🔥']

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Play typing sound occasionally
    if (Math.random() < 0.1) {
      playTyping()
    }
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
    playClick()
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setShowSuggestions(false)
    textareaRef.current?.focus()
    playClick()
  }

  const handleSendClick = () => {
    playSend()
    onSend()
  }

  useEffect(() => {
    if (input.trim()) {
      setShowSuggestions(false)
    } else {
      setShowSuggestions(true)
    }
  }, [input])

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      <div className="flex items-end gap-2">
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
              w-full resize-none rounded-xl border-2 px-3.5 py-2.5 text-sm transition-all duration-300
              ${isFocused 
                ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                : 'border-gray-200 hover:border-gray-300'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            `}
            style={{ maxHeight: '120px' }}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            disabled={isLoading}
          />
          
          {/* Character count */}
          {isFocused && (
            <div className="absolute -top-6 right-0 text-xs text-gray-400 fade-in-up">
              {input.length}/500
            </div>
          )}
        </div>

        {/* Emoji button */}
        <button
          onClick={() => setShowEmojis(!showEmojis)}
          className={`
            h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300
            ${showEmojis 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
            hover-scale
          `}
          aria-label="Add emoji"
        >
          <span className="text-lg">😊</span>
        </button>

        {/* Send button */}
        <button
          onClick={handleSendClick}
          disabled={isLoading || !input.trim()}
          className={`
            h-10 w-10 rounded-xl text-white flex items-center justify-center transition-all duration-300
            ${isLoading || !input.trim() 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:scale-105 active:scale-95 btn-interactive'
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
        <div className="mt-2 p-3 bg-gray-50 rounded-xl fade-in-up">
          <div className="grid grid-cols-6 gap-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="text-xl hover:scale-125 transition-transform duration-200 p-1 rounded-lg hover:bg-white"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Smart Suggestion Chips */}
      {showSuggestions && (
        <div className="mt-2 flex flex-wrap gap-2 fade-in-up">
          {SUGGESTION_CHIPS[lang].map((suggestion, index) => (
            <button 
              key={suggestion} 
              onClick={() => handleSuggestionClick(suggestion)}
              className={`
                px-3 py-1.5 text-xs border rounded-full transition-all duration-300
                hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600
                hover-scale btn-interactive
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
