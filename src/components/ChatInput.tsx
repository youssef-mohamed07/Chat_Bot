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

  const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🚀', '💡', '⭐', '🔥', '✅']

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

  const handleSuggestionClick = () => {
    setShowSuggestions(false)
    playClick()
    // Auto-send the suggestion immediately
    onSend()
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
          onClick={handleSendClick}
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
      
      {/* Smart Suggestion Chips */}
      {showSuggestions && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTION_CHIPS[lang].map((suggestion) => (
            <button 
              key={suggestion} 
              onClick={() => handleSuggestionClick()}
              className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-full transition-all duration-150 hover:bg-blue-100 hover:border-blue-300 hover:shadow-sm hover:scale-105 active:scale-95"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
