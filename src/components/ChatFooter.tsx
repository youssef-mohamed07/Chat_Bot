import type { Language } from '../types'
import { SupportCTA } from './SupportCTA'

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
