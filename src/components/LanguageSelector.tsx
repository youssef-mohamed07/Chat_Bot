import type { Language } from '../types'
import { LABELS } from '../constants'

interface LanguageSelectorProps {
  onSelectLanguage: (lang: Language) => void
}

export const LanguageSelector = ({ onSelectLanguage }: LanguageSelectorProps) => {
  return (
    <div className="flex-1 p-5 bg-gradient-to-b from-white to-gray-50 bg-noise flex items-center justify-center">
      <div className="w-full">
        <div className="text-center mb-5">
          <div className="text-lg font-semibold brand-text-gradient">
            Choose your language • اختر لغتك
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {LABELS.en.youCanChangeLater}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onSelectLanguage('en')} 
            className="border-2 border-gray-200 hover:border-blue-500 rounded-xl py-3 font-medium hover:shadow"
          >
            English
          </button>
          <button 
            onClick={() => onSelectLanguage('ar')} 
            className="border-2 border-gray-200 hover:border-blue-500 rounded-xl py-3 font-medium hover:shadow" 
            dir="rtl"
          >
            العربية
          </button>
        </div>
        <div className="text-[11px] text-gray-400 text-center mt-3">
          Required to continue • مطلوب للمتابعة
        </div>
      </div>
    </div>
  )
}
