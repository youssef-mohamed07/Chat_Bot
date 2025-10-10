import type { Language } from '../types'
import { SUGGESTION_CHIPS, PLACEHOLDERS } from '../constants'

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
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleInputResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    target.style.height = 'auto'
    target.style.height = Math.min(target.scrollHeight, 120) + 'px'
  }

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyPress={onKeyPress}
          onInput={handleInputResize}
          rows={1}
          placeholder={PLACEHOLDERS[lang].message}
          className="flex-1 resize-none rounded-xl border-2 border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
          style={{ maxHeight: '120px' }}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          disabled={isLoading}
        />
        <button
          onClick={onSend}
          disabled={isLoading || !input.trim()}
          className="h-10 w-10 rounded-xl text-white flex items-center justify-center disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'var(--chat-bot-bg)' }}
          aria-label="Send"
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Smart Suggestion Chips */}
      <div className="mt-2 flex flex-wrap gap-2">
        {SUGGESTION_CHIPS[lang].map((suggestion) => (
          <button 
            key={suggestion} 
            onClick={() => setInput(suggestion)} 
            className="px-3 py-1.5 text-xs border rounded-full hover:border-blue-500"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
