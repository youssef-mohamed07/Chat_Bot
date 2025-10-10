import type { Language } from '../types'
import { LABELS } from '../constants'

interface ChatHeaderProps {
  onClose: () => void
  lang: Language
}

export const ChatHeader = ({ onClose, lang }: ChatHeaderProps) => {
  return (
    <div className="px-4 py-3 text-white flex items-center justify-between glass" style={{ background: 'var(--header-bg)' }}>
      <div className="flex items-center gap-3">
        <img src="/logo.jpg" alt="Quick Air" className="w-9 h-9 rounded-lg object-cover shadow" />
        <div>
          <div className="text-sm font-semibold">Quick Air AI</div>
          <div className="text-[11px] text-white/80">{LABELS[lang].onlineTravelAssistant}</div>
        </div>
      </div>
      <button onClick={onClose} className="hover:bg-white/10 p-1.5 rounded-lg">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
