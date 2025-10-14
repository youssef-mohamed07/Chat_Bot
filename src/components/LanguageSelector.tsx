import { useState } from 'react'
import type { Language } from '../types'
import { LABELS } from '../constants'
import { useSoundEffects } from '../utils'

interface LanguageSelectorProps {
  onSelectLanguage: (lang: Language) => void
}

export const LanguageSelector = ({ onSelectLanguage }: LanguageSelectorProps) => {
  const { playClick } = useSoundEffects()

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
    <div className="flex-1 p-6 bg-white flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-gray-800 mb-3">
            Choose your language
          </div>
          <div className="text-sm text-gray-600">
            {LABELS.en.youCanChangeLater}
          </div>
        </div>
        
        <div className="space-y-4">
          {languages.map((lang, index) => (
            <button 
              key={lang.code}
              onClick={() => {
                playClick()
                onSelectLanguage(lang.code)
              }}
              className="w-full border-2 rounded-xl py-5 px-5 font-medium transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md border-gray-200 group"
              dir={lang.dir}
            >
              <div className="flex items-center justify-center gap-4">
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-center">
                  <div className="font-semibold text-gray-800 text-lg">
                    {lang.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {lang.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <div className="text-sm text-gray-500">
            Required to continue
          </div>
        </div>
      </div>
    </div>
  )
}
