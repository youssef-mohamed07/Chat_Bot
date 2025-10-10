import type { Language } from '../types'
import { LABELS } from '../constants'

interface SupportCTAProps {
  onOpenSupport: () => void
  lang: Language
}

export const SupportCTA = ({ onOpenSupport, lang }: SupportCTAProps) => {
  return (
    <div className="mt-3 text-[12px] text-gray-500">
      <button 
        onClick={onOpenSupport} 
        className="underline hover:text-gray-700"
      >
        {LABELS[lang].needSupport}
      </button>
    </div>
  )
}
