import type { Language } from '../types'
import { LABELS } from '../constants'

interface ChatHeaderProps {
  onClose: () => void
  lang: Language
}

export const ChatHeader = ({ onClose, lang }: ChatHeaderProps) => {
  return (
    <div className="px-4 py-4 text-white flex items-center justify-between" style={{ background: 'var(--header-bg)' }}>
      <div className="flex items-center gap-3">
        <img src="/logo.jpg" alt="Quick Air" className="w-10 h-10 rounded-lg object-cover shadow-sm" />
        <div>
          <div className="text-base font-semibold">Quick Air AI</div>
          <div className="text-xs text-white/90">{LABELS[lang].onlineTravelAssistant}</div>
        </div>
      </div>
      <button 
        onClick={onClose} 
        className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
        aria-label="Close chat"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
