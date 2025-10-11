import { useState } from 'react'
import type { Language } from '../types'
import { LABELS } from '../constants'
import { useSoundEffects } from '../utils'

interface LanguageSelectorProps {
  onSelectLanguage: (lang: Language) => void
}

export const LanguageSelector = ({ onSelectLanguage }: LanguageSelectorProps) => {
  const [hoveredLang, setHoveredLang] = useState<Language | null>(null)
  const { playClick, playHover } = useSoundEffects()

  const languages = [
    { 
      code: 'en' as Language, 
      name: 'English', 
      flag: '🇺🇸', 
      description: 'English language',
      dir: 'ltr'
    },
    { 
      code: 'ar' as Language, 
      name: 'العربية', 
      flag: '🇸🇦', 
      description: 'اللغة العربية',
      dir: 'rtl'
    }
  ]

  return (
    <div className="flex-1 p-5 bg-gradient-to-b from-white to-gray-50 bg-noise flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-xl font-bold gradient-text-animated mb-2">
            Choose your language • اختر لغتك
          </div>
          <div className="text-sm text-gray-500">
            {LABELS.en.youCanChangeLater}
          </div>
        </div>
        
        <div className="space-y-3">
          {languages.map((lang, index) => (
            <button 
              key={lang.code}
              onClick={() => {
                playClick()
                onSelectLanguage(lang.code)
              }}
              onMouseEnter={() => {
                setHoveredLang(lang.code)
                playHover()
              }}
              onMouseLeave={() => setHoveredLang(null)}
              className={`
                w-full border-2 rounded-xl py-4 px-4 font-medium transition-all duration-300
                hover-lift btn-interactive group relative overflow-hidden
                ${hoveredLang === lang.code 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-gray-200 hover:border-blue-400'
                }
              `}
              dir={lang.dir}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-center">
                  <div className={`
                    font-semibold transition-colors duration-300
                    ${hoveredLang === lang.code ? 'text-blue-700' : 'text-gray-800'}
                  `}>
                    {lang.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {lang.description}
                  </div>
                </div>
              </div>
              
              {/* Hover effect overlay */}
              {hoveredLang === lang.code && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 shimmer" />
              )}
            </button>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <div className="text-xs text-gray-400 mb-2">
            Required to continue • مطلوب للمتابعة
          </div>
          
          {/* Animated dots */}
          <div className="flex justify-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
